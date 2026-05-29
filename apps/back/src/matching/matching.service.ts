import { Injectable } from '@nestjs/common';
import { AiService, type MatchScore } from '../ai/ai.service';

// Lógica de conexión perfil ↔ oportunidad.
// Hoy: reglas (intereses + barrio + disponibilidad). Mañana: delega en AIModule.
@Injectable()
export class MatchingService {
  constructor(private readonly aiService: AiService) {}

  scoreOpportunities(
    profileId: string,
    opportunityIds: string[],
  ): Promise<MatchScore[]> {
    // MCP_HOOK: AI_MATCHING
    return this.aiService.matchJovenToOpportunity(profileId, opportunityIds);
  }
}
