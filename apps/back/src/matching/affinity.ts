import type { Opportunity } from '../opportunities/opportunity.entity';
import type { YoungProfile } from '../young/young.entity';

// Pesos de la heurística de afinidad. Suman 1 para que el score quede en 0..1.
const INTEREST_WEIGHT = 0.6;
const BARRIO_WEIGHT = 0.4;

// Afinidad por reglas entre un joven y una oportunidad, en [0, 1].
// - Solape de intereses: fracción de los intereses de la oportunidad que el
//   joven también declara.
// - Barrio: bonus completo si la oportunidad está en su territorio.
//
// Función pura compartida por MatchingService (camino síncrono del "Me
// interesa") y AiService (camino AI_MATCHING). Es la heurística que la
// integración MCP/LLM puede sustituir detrás de // MCP_HOOK: AI_MATCHING.
export function affinityScore(
  profile: YoungProfile,
  opportunity: Opportunity,
): number {
  const wanted = opportunity.interests;
  const interestScore = wanted.length
    ? wanted.filter((i) => profile.interests.includes(i)).length / wanted.length
    : 0;

  const barrioScore = profile.barrio === opportunity.barrio ? 1 : 0;

  const raw = INTEREST_WEIGHT * interestScore + BARRIO_WEIGHT * barrioScore;
  return Math.round(raw * 100) / 100;
}
