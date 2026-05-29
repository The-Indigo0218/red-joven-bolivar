import { Injectable } from '@nestjs/common';
import { AiService, type MatchScore } from '../ai/ai.service';
import type { Opportunity } from '../opportunities/opportunity.entity';
import type { YoungProfile } from '../young/young.entity';

// Pesos de la heurística de afinidad. Suman 1 para que el score quede en 0..1.
const INTEREST_WEIGHT = 0.6;
const BARRIO_WEIGHT = 0.4;

// Lógica de conexión perfil ↔ oportunidad.
// Hoy: reglas (solape de intereses + barrio). Fase 4: delega en AIModule.
@Injectable()
export class MatchingService {
  constructor(private readonly aiService: AiService) {}

  // Afinidad por reglas entre un joven y una oportunidad, en [0, 1].
  // - Solape de intereses: fracción de los intereses de la oportunidad que el
  //   joven también declara.
  // - Barrio: bonus completo si coinciden (oportunidad en su territorio).
  score(profile: YoungProfile, opportunity: Opportunity): number {
    const wanted = opportunity.interests;
    const interestScore = wanted.length
      ? wanted.filter((i) => profile.interests.includes(i)).length /
        wanted.length
      : 0;

    const barrioScore = profile.barrio === opportunity.barrio ? 1 : 0;

    const raw = INTEREST_WEIGHT * interestScore + BARRIO_WEIGHT * barrioScore;
    return Math.round(raw * 100) / 100;
  }

  // Punto de delegación a IA (Fase 4). Hoy el flujo usa score() por reglas.
  scoreOpportunities(
    profileId: string,
    opportunityIds: string[],
  ): Promise<MatchScore[]> {
    // MCP_HOOK: AI_MATCHING
    return this.aiService.matchJovenToOpportunity(profileId, opportunityIds);
  }
}
