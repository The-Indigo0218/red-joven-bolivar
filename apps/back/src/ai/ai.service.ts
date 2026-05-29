import { Injectable, NotImplementedException } from '@nestjs/common';
import type { InterestSlug } from '../young/young.entity';

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

// Módulo vacío con interfaces. Stubs listos para integrar (MCP).
@Injectable()
export class AiService implements AiServiceContract {
  // MCP_HOOK: AI_MATCHING
  matchJovenToOpportunity(
    _profileId: string,
    _opportunityIds: string[],
  ): Promise<MatchScore[]> {
    throw new NotImplementedException('AI_MATCHING no implementado todavía');
  }

  // MCP_HOOK: DEMAND_PREDICTION
  predictDemandByZone(
    _barrio: string,
    _horizonMonths: number,
  ): Promise<DemandForecast[]> {
    throw new NotImplementedException('DEMAND_PREDICTION no implementado todavía');
  }

  suggestGroupFormation(
    _barrio: string,
    _interest: InterestSlug,
  ): Promise<GroupSuggestion[]> {
    throw new NotImplementedException(
      'suggestGroupFormation no implementado todavía',
    );
  }
}
