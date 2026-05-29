import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { labelForInterest } from '../common/interests';
import { affinityScore } from '../matching/affinity';
import { Opportunity } from '../opportunities/opportunity.entity';
import { Skill } from '../skills/skill.entity';
import type { SocialActivity } from '../social-activity/social-activity.entity';
import { YoungProfile, type InterestSlug } from '../young/young.entity';
import { GeminiService } from './gemini.service';

// ───────────────────────── Tipos de salida de la IA ─────────────────────────

export interface MatchScore {
  opportunityId: string;
  score: number; // afinidad 0..1
}

export interface DemandForecast {
  interest: InterestSlug;
  barrio: string;
  predictedYoungCount: number;
  horizonMonths: number;
}

export interface GroupSuggestion {
  barrio: string;
  interest: InterestSlug;
  suggestedName: string;
  candidateYoungIds: string[];
}

// ── Diferenciador 1: Rutas de Crecimiento ──
export interface CvExtractionResult {
  skills: Skill[];
  confidence: number; // 0..1
}

export interface GapAnalysisResult {
  matchingSkills: Skill[];
  missingSkills: Skill[];
}

export interface ClosingOpportunityInput {
  skill: Skill;
  opportunityTitle: string;
  barrio: string;
  slotsAvailable: number;
}

export interface GrowthRouteGenerationInput {
  targetTitle: string;
  matchingSkills: Skill[];
  missingSkills: Skill[];
  closingOpportunities: ClosingOpportunityInput[];
}

export interface GrowthRouteGeneration {
  affinityScore: number; // 0..100
  headline: string;
}

// ── Diferenciador 2: CivicCoins ──
export interface ActivitySuggestion {
  activityId: string;
  affinityScore: number; // 0..100
}

// Contrato del módulo de IA. El front nunca lo llama directo — todo pasa por el back.
export interface AiServiceContract {
  // MCP_HOOK: AI_MATCHING
  matchJovenToOpportunity(
    profileId: string,
    opportunityIds: string[],
  ): Promise<MatchScore[]>;

  // MCP_HOOK: DEMAND_PREDICTION
  predictDemandByZone(
    barrio: string,
    horizonMonths: number,
  ): Promise<DemandForecast[]>;

  suggestGroupFormation(
    barrio: string,
    interest: InterestSlug,
  ): Promise<GroupSuggestion[]>;
}

// Heurística de crecimiento mensual de demanda (proyección lineal simple).
const MONTHLY_GROWTH = 0.04;
// Tope de candidatos devueltos por sugerencia de grupo.
const MAX_CANDIDATES = 25;

interface InterestCountRow {
  interest: InterestSlug;
  youngCount: number;
}
interface IdRow {
  id: string;
}

// Cada // MCP_HOOK intenta primero el modelo Gemini (si hay GEMINI_API_KEY) y,
// ante cualquier error o falta de key/cuota, cae a una heurística por reglas
// determinista. Así el back nunca se rompe por la IA. El front no llama aquí.
@Injectable()
export class AiService implements AiServiceContract {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @InjectRepository(YoungProfile)
    private readonly youngRepo: Repository<YoungProfile>,
    @InjectRepository(Opportunity)
    private readonly opportunityRepo: Repository<Opportunity>,
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,
    private readonly gemini: GeminiService,
  ) {}

  // ───────────────────────────── AI_MATCHING ─────────────────────────────
  // MCP_HOOK: AI_MATCHING
  async matchJovenToOpportunity(
    profileId: string,
    opportunityIds: string[],
  ): Promise<MatchScore[]> {
    const profile = await this.youngRepo.findOne({ where: { id: profileId } });
    if (!profile) {
      throw new NotFoundException(`Perfil de joven ${profileId} no encontrado`);
    }
    if (opportunityIds.length === 0) return [];

    const opportunities = await this.opportunityRepo.find({
      where: { id: In(opportunityIds) },
    });

    if (this.gemini.isEnabled()) {
      try {
        return await this.matchWithGemini(profile, opportunities);
      } catch (err) {
        this.warnFallback('AI_MATCHING', err);
      }
    }
    return this.matchHeuristic(profile, opportunities);
  }

  private matchHeuristic(
    profile: YoungProfile,
    opportunities: Opportunity[],
  ): MatchScore[] {
    return opportunities
      .map((opp) => ({ opportunityId: opp.id, score: affinityScore(profile, opp) }))
      .sort((a, b) => b.score - a.score);
  }

  private async matchWithGemini(
    profile: YoungProfile,
    opportunities: Opportunity[],
  ): Promise<MatchScore[]> {
    const prompt = `Sos un motor de recomendación de oportunidades para jóvenes de Cartagena, Colombia.
Joven: barrio="${profile.barrio}", intereses=${JSON.stringify(profile.interests)}, nivel="${profile.educationLevel}", busca="${profile.seeking}".
Oportunidades:
${JSON.stringify(
  opportunities.map((o) => ({
    id: o.id,
    title: o.title,
    kind: o.kind,
    barrio: o.barrio,
    interests: o.interests,
  })),
)}
Devolvé SOLO un array JSON con un objeto por oportunidad: [{"opportunityId": string, "score": number}], score de afinidad entre 0 y 1.`;

    const raw = await this.gemini.generateJson<
      Array<{ opportunityId: string; score: number }>
    >(prompt);

    const validIds = new Set(opportunities.map((o) => o.id));
    const byId = new Map<string, number>();
    for (const item of raw) {
      if (validIds.has(item.opportunityId) && typeof item.score === 'number') {
        byId.set(item.opportunityId, this.clamp01(item.score));
      }
    }
    // Si el modelo omitió alguna oportunidad, la respuesta no es confiable.
    if (byId.size !== opportunities.length) {
      throw new Error('Gemini no puntuó todas las oportunidades');
    }

    return opportunities
      .map((o) => ({ opportunityId: o.id, score: byId.get(o.id) ?? 0 }))
      .sort((a, b) => b.score - a.score);
  }

  // ──────────────────────────── DEMAND_PREDICTION ────────────────────────────
  // MCP_HOOK: DEMAND_PREDICTION
  async predictDemandByZone(
    barrio: string,
    horizonMonths: number,
  ): Promise<DemandForecast[]> {
    const rows = await this.youngRepo.query<InterestCountRow[]>(
      `SELECT i AS interest, COUNT(*)::int AS "youngCount"
         FROM young_profiles, unnest(interests) AS i
        WHERE barrio = $1
        GROUP BY i
        ORDER BY "youngCount" DESC`,
      [barrio],
    );
    if (rows.length === 0) return [];

    if (this.gemini.isEnabled()) {
      try {
        return await this.predictWithGemini(barrio, horizonMonths, rows);
      } catch (err) {
        this.warnFallback('DEMAND_PREDICTION', err);
      }
    }
    return this.predictHeuristic(barrio, horizonMonths, rows);
  }

  private predictHeuristic(
    barrio: string,
    horizonMonths: number,
    rows: InterestCountRow[],
  ): DemandForecast[] {
    const factor = 1 + MONTHLY_GROWTH * horizonMonths;
    return rows.map((r) => ({
      interest: r.interest,
      barrio,
      predictedYoungCount: Math.round(r.youngCount * factor),
      horizonMonths,
    }));
  }

  private async predictWithGemini(
    barrio: string,
    horizonMonths: number,
    rows: InterestCountRow[],
  ): Promise<DemandForecast[]> {
    const prompt = `Demanda juvenil actual por interés en el barrio "${barrio}" de Cartagena:
${JSON.stringify(rows)}
Proyectá la demanda esperada dentro de ${horizonMonths} meses considerando tendencias razonables de juventud urbana.
Devolvé SOLO un array JSON [{"interest": string, "predictedYoungCount": number}] usando exactamente los mismos slugs de interés recibidos.`;

    const raw = await this.gemini.generateJson<
      Array<{ interest: InterestSlug; predictedYoungCount: number }>
    >(prompt);

    const validInterests = new Set(rows.map((r) => r.interest));
    const result = raw
      .filter(
        (r) =>
          validInterests.has(r.interest) &&
          typeof r.predictedYoungCount === 'number',
      )
      .map((r) => ({
        interest: r.interest,
        barrio,
        predictedYoungCount: Math.max(0, Math.round(r.predictedYoungCount)),
        horizonMonths,
      }));

    if (result.length === 0) throw new Error('Gemini no devolvió proyecciones válidas');
    return result;
  }

  // ─────────────────────────── Formación de grupos ───────────────────────────
  async suggestGroupFormation(
    barrio: string,
    interest: InterestSlug,
  ): Promise<GroupSuggestion[]> {
    const rows = await this.youngRepo.query<IdRow[]>(
      `SELECT id
         FROM young_profiles
        WHERE barrio = $1 AND $2 = ANY(interests)
        ORDER BY "createdAt" ASC
        LIMIT $3`,
      [barrio, interest, MAX_CANDIDATES],
    );
    if (rows.length === 0) return [];

    const candidateYoungIds = rows.map((r) => r.id);

    // Los candidatos SIEMPRE salen de la BD; solo el nombre se puede generar
    // con IA (un modelo no debe inventar ids de jóvenes).
    let suggestedName = `${labelForInterest(interest)} ${barrio}`;
    if (this.gemini.isEnabled()) {
      try {
        suggestedName = await this.suggestGroupNameWithGemini(barrio, interest);
      } catch (err) {
        this.warnFallback('GROUP_NAME', err);
      }
    }

    return [{ barrio, interest, suggestedName, candidateYoungIds }];
  }

  private async suggestGroupNameWithGemini(
    barrio: string,
    interest: InterestSlug,
  ): Promise<string> {
    const prompt = `Proponé un nombre corto, juvenil y atractivo (máx. 5 palabras, en español) para un grupo comunitario de "${labelForInterest(
      interest,
    )}" en el barrio "${barrio}" de Cartagena.
Devolvé SOLO un JSON {"name": string}.`;
    const { name } = await this.gemini.generateJson<{ name: string }>(prompt);
    const clean = (name ?? '').trim();
    if (!clean) throw new Error('Gemini devolvió un nombre vacío');
    return clean.slice(0, 80);
  }

  // ─────────────────────────────── CV_PARSING ───────────────────────────────
  // MCP_HOOK: CV_PARSING
  async extractSkillsFromCV(cvText: string): Promise<CvExtractionResult> {
    const catalog = await this.skillRepo.find();

    if (this.gemini.isEnabled()) {
      try {
        return await this.extractCvWithGemini(cvText, catalog);
      } catch (err) {
        this.warnFallback('CV_PARSING', err);
      }
    }
    return this.extractCvHeuristic(cvText, catalog);
  }

  private extractCvHeuristic(
    cvText: string,
    catalog: Skill[],
  ): CvExtractionResult {
    const haystack = cvText.toLowerCase();
    const skills = catalog.filter((s) => {
      const label = s.label.toLowerCase();
      const slugWords = s.slug.replace(/-/g, ' ');
      return haystack.includes(label) || haystack.includes(slugWords);
    });

    const confidence = skills.length
      ? Math.min(
          0.95,
          Math.round((0.6 + (0.4 * skills.length) / catalog.length) * 100) / 100,
        )
      : 0.2;

    return { skills, confidence };
  }

  private async extractCvWithGemini(
    cvText: string,
    catalog: Skill[],
  ): Promise<CvExtractionResult> {
    const prompt = `Catálogo de habilidades disponibles (slug: etiqueta):
${catalog.map((s) => `${s.slug}: ${s.label}`).join('\n')}

Texto del CV de un joven:
"""${cvText}"""

Identificá qué habilidades del catálogo evidencia el CV (entendé sinónimos y acentos).
Devolvé SOLO un JSON {"skillSlugs": string[], "confidence": number} donde skillSlugs son slugs EXACTOS del catálogo y confidence está entre 0 y 1.`;

    const raw = await this.gemini.generateJson<{
      skillSlugs: string[];
      confidence: number;
    }>(prompt);

    const bySlug = new Map(catalog.map((s) => [s.slug, s]));
    const skills = (raw.skillSlugs ?? [])
      .map((slug) => bySlug.get(slug))
      .filter((s): s is Skill => Boolean(s));

    const confidence =
      typeof raw.confidence === 'number' ? this.clamp01(raw.confidence) : 0.5;

    return { skills, confidence };
  }

  // ─────────────────────────────── GAP_ANALYSIS ──────────────────────────────
  // MCP_HOOK: GAP_ANALYSIS
  // Diferencia de conjuntos exacta por id de catálogo: es determinista y no
  // mejora con un LLM, así que se resuelve siempre por reglas.
  analyzeSkillGap(
    youngSkills: Skill[],
    requiredSkills: Skill[],
  ): GapAnalysisResult {
    const haveIds = new Set(youngSkills.map((s) => s.id));
    return {
      matchingSkills: requiredSkills.filter((s) => haveIds.has(s.id)),
      missingSkills: requiredSkills.filter((s) => !haveIds.has(s.id)),
    };
  }

  // ────────────────────────────── ROUTE_GENERATION ───────────────────────────
  // MCP_HOOK: ROUTE_GENERATION
  // El score es determinista (cobertura de requisitos); solo el titular en
  // lenguaje natural se genera con IA, con fallback a una plantilla.
  async generateGrowthRoute(
    input: GrowthRouteGenerationInput,
  ): Promise<GrowthRouteGeneration> {
    const total = input.matchingSkills.length + input.missingSkills.length;
    const affinityScore = total
      ? Math.round((100 * input.matchingSkills.length) / total)
      : 100;

    let headline = this.routeHeadlineHeuristic(input);
    if (this.gemini.isEnabled() && input.missingSkills.length > 0) {
      try {
        headline = await this.routeHeadlineWithGemini(input);
      } catch (err) {
        this.warnFallback('ROUTE_GENERATION', err);
      }
    }

    return { affinityScore, headline };
  }

  private routeHeadlineHeuristic(input: GrowthRouteGenerationInput): string {
    if (input.missingSkills.length === 0) {
      return `¡Ya cumplís el perfil para «${input.targetTitle}»! Postúlate.`;
    }
    const missingLabels = input.missingSkills.map((s) => s.label).join(', ');
    const closing = input.closingOpportunities[0];
    return closing
      ? `Para «${input.targetTitle}» te falta ${missingLabels}. ${closing.opportunityTitle} en ${closing.barrio} tiene ${closing.slotsAvailable} cupos — ¿te conectamos?`
      : `Para «${input.targetTitle}» te falta ${missingLabels}. Aún no hay un curso de cierre disponible en tu zona.`;
  }

  private async routeHeadlineWithGemini(
    input: GrowthRouteGenerationInput,
  ): Promise<string> {
    const prompt = `Generá un titular motivador en español (1-2 frases, cercano, sin exagerar) para un joven de Cartagena que quiere acceder a «${input.targetTitle}».
Ya tiene: ${JSON.stringify(input.matchingSkills.map((s) => s.label))}.
Le falta: ${JSON.stringify(input.missingSkills.map((s) => s.label))}.
Cursos/talleres gratis disponibles para cerrar la brecha: ${JSON.stringify(
      input.closingOpportunities.map((c) => ({
        skill: c.skill.label,
        curso: c.opportunityTitle,
        barrio: c.barrio,
        cupos: c.slotsAvailable,
      })),
    )}.
Mencioná la habilidad que falta y, si hay un curso, invitá a conectarse. Devolvé SOLO un JSON {"headline": string}.`;

    const { headline } = await this.gemini.generateJson<{ headline: string }>(
      prompt,
    );
    const clean = (headline ?? '').trim();
    if (!clean) throw new Error('Gemini devolvió un titular vacío');
    return clean;
  }

  // ────────────────────────────── SOCIAL_MATCHING ────────────────────────────
  // MCP_HOOK: SOCIAL_MATCHING
  async suggestSocialActivities(
    young: { barrio: string; skillIds: string[] },
    activities: SocialActivity[],
  ): Promise<ActivitySuggestion[]> {
    if (activities.length === 0) return [];

    if (this.gemini.isEnabled()) {
      try {
        return await this.suggestActivitiesWithGemini(young, activities);
      } catch (err) {
        this.warnFallback('SOCIAL_MATCHING', err);
      }
    }
    return this.suggestActivitiesHeuristic(young, activities);
  }

  private suggestActivitiesHeuristic(
    young: { barrio: string; skillIds: string[] },
    activities: SocialActivity[],
  ): ActivitySuggestion[] {
    const haveSkills = new Set(young.skillIds);
    return activities
      .map((a) => {
        const required = a.requiredSkillIds;
        const skillCoverage = required.length
          ? required.filter((id) => haveSkills.has(id)).length / required.length
          : 0.5; // sin requisitos: abierta a cualquiera
        const barrioMatch = a.barrio === young.barrio ? 1 : 0;
        const affinityScore = Math.round(
          100 * (0.6 * skillCoverage + 0.4 * barrioMatch),
        );
        return { activityId: a.id, affinityScore };
      })
      .sort((x, y) => y.affinityScore - x.affinityScore);
  }

  private async suggestActivitiesWithGemini(
    young: { barrio: string; skillIds: string[] },
    activities: SocialActivity[],
  ): Promise<ActivitySuggestion[]> {
    const prompt = `Un joven de Cartagena vive en el barrio "${young.barrio}" y tiene las habilidades (ids): ${JSON.stringify(
      young.skillIds,
    )}.
Actividades sociales disponibles:
${JSON.stringify(
  activities.map((a) => ({
    id: a.id,
    title: a.title,
    barrio: a.barrio,
    requiredSkillIds: a.requiredSkillIds,
  })),
)}
Calculá la afinidad de cada actividad con el joven (cobertura de habilidades + cercanía de barrio + impacto).
Devolvé SOLO un array JSON [{"activityId": string, "affinityScore": number}] con score 0..100, una entrada por actividad.`;

    const raw = await this.gemini.generateJson<
      Array<{ activityId: string; affinityScore: number }>
    >(prompt);

    const validIds = new Set(activities.map((a) => a.id));
    const byId = new Map<string, number>();
    for (const item of raw) {
      if (validIds.has(item.activityId) && typeof item.affinityScore === 'number') {
        byId.set(item.activityId, this.clampScore100(item.affinityScore));
      }
    }
    if (byId.size !== activities.length) {
      throw new Error('Gemini no puntuó todas las actividades');
    }

    return activities
      .map((a) => ({ activityId: a.id, affinityScore: byId.get(a.id) ?? 0 }))
      .sort((x, y) => y.affinityScore - x.affinityScore);
  }

  // ─────────────────────────────── Utilidades ───────────────────────────────
  private clamp01(n: number): number {
    return Math.max(0, Math.min(1, n));
  }

  private clampScore100(n: number): number {
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  private warnFallback(hook: string, err: unknown): void {
    const message = err instanceof Error ? err.message : String(err);
    this.logger.warn(`${hook}: Gemini falló, usando heurística (${message})`);
  }
}
