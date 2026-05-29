import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { labelForInterest } from '../common/interests';
import { affinityScore } from '../matching/affinity';
import { Opportunity } from '../opportunities/opportunity.entity';
import { Skill } from '../skills/skill.entity';
import type { SocialActivity } from '../social-activity/social-activity.entity';
import { YoungProfile, type InterestSlug } from '../young/young.entity';

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

// Implementación por reglas detrás de cada // MCP_HOOK. Funciona hoy de forma
// determinista y deja el punto exacto donde una integración MCP/LLM puede
// reemplazar la heurística sin tocar a los consumidores (matching, demanda,
// grupos). El front nunca llama aquí directo.
@Injectable()
export class AiService implements AiServiceContract {
  constructor(
    @InjectRepository(YoungProfile)
    private readonly youngRepo: Repository<YoungProfile>,
    @InjectRepository(Opportunity)
    private readonly opportunityRepo: Repository<Opportunity>,
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,
  ) {}

  // MCP_HOOK: AI_MATCHING
  // Hoy: afinidad por reglas (intereses + barrio), ordenada de mayor a menor.
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

    return opportunities
      .map((opp) => ({
        opportunityId: opp.id,
        score: affinityScore(profile, opp),
      }))
      .sort((a, b) => b.score - a.score);
  }

  // MCP_HOOK: DEMAND_PREDICTION
  // Hoy: proyección lineal de la demanda actual del barrio por interés.
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

    const factor = 1 + MONTHLY_GROWTH * horizonMonths;
    return rows.map((r) => ({
      interest: r.interest,
      barrio,
      predictedYoungCount: Math.round(r.youngCount * factor),
      horizonMonths,
    }));
  }

  // Hoy: candidatos = jóvenes del barrio que declararon ese interés.
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

    return [
      {
        barrio,
        interest,
        suggestedName: `${labelForInterest(interest)} ${barrio}`,
        candidateYoungIds: rows.map((r) => r.id),
      },
    ];
  }

  // MCP_HOOK: CV_PARSING
  // Hoy: empareja el texto del CV (case-insensitive) contra el catálogo de
  // habilidades por label/slug. Una integración LLM lo reemplaza aquí.
  async extractSkillsFromCV(cvText: string): Promise<CvExtractionResult> {
    const catalog = await this.skillRepo.find();
    const haystack = cvText.toLowerCase();

    const skills = catalog.filter((s) => {
      const label = s.label.toLowerCase();
      const slugWords = s.slug.replace(/-/g, ' ');
      return haystack.includes(label) || haystack.includes(slugWords);
    });

    const confidence = skills.length
      ? Math.min(0.95, Math.round((0.6 + (0.4 * skills.length) / catalog.length) * 100) / 100)
      : 0.2;

    return { skills, confidence };
  }

  // MCP_HOOK: GAP_ANALYSIS
  // Diferencia de conjuntos por id: lo que el joven tiene vs. lo que la
  // oportunidad exige.
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

  // MCP_HOOK: ROUTE_GENERATION
  // Hoy: score por cobertura de requisitos + titular generado a partir de la
  // brecha y la oferta de cierre disponible.
  generateGrowthRoute(input: GrowthRouteGenerationInput): GrowthRouteGeneration {
    const total = input.matchingSkills.length + input.missingSkills.length;
    const affinityScore = total
      ? Math.round((100 * input.matchingSkills.length) / total)
      : 100;

    let headline: string;
    if (input.missingSkills.length === 0) {
      headline = `¡Ya cumplís el perfil para «${input.targetTitle}»! Postúlate.`;
    } else {
      const missingLabels = input.missingSkills.map((s) => s.label).join(', ');
      const closing = input.closingOpportunities[0];
      headline = closing
        ? `Para «${input.targetTitle}» te falta ${missingLabels}. ${closing.opportunityTitle} en ${closing.barrio} tiene ${closing.slotsAvailable} cupos — ¿te conectamos?`
        : `Para «${input.targetTitle}» te falta ${missingLabels}. Aún no hay un curso de cierre disponible en tu zona.`;
    }

    return { affinityScore, headline };
  }

  // MCP_HOOK: SOCIAL_MATCHING
  // Hoy: afinidad de cada actividad según cobertura de habilidades requeridas
  // y cercanía de barrio.
  suggestSocialActivities(
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
}
