import { Injectable } from '@nestjs/common';
import { AiService, type MatchScore } from '../ai/ai.service';
import type { Opportunity } from '../opportunities/opportunity.entity';
import type { YoungProfile } from '../young/young.entity';
import { affinityScore } from './affinity';

// Lógica de conexión perfil ↔ oportunidad.
// - score(): heurística síncrona usada por el "Me interesa".
// - scoreOpportunities(): ranking en lote delegado a AIModule (AI_MATCHING).
@Injectable()
export class MatchingService {
  constructor(private readonly aiService: AiService) {}

  // Afinidad por reglas de un par concreto (no toca BD).
  score(profile: YoungProfile, opportunity: Opportunity): number {
    return affinityScore(profile, opportunity);
  }

  // Ranking de varias oportunidades para un joven, vía IA.
  scoreOpportunities(
    profileId: string,
    opportunityIds: string[],
  ): Promise<MatchScore[]> {
    // MCP_HOOK: AI_MATCHING
    return this.aiService.matchJovenToOpportunity(profileId, opportunityIds);
  }
}
