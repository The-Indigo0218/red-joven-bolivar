import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { labelForInterest } from '../common/interests';
import { affinityScore } from '../matching/affinity';
import { Opportunity } from '../opportunities/opportunity.entity';
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
}
