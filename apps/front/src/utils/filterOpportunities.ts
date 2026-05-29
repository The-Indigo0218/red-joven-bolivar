import type { Opportunity, OpportunityKind, YoungProfileResponse } from '../types';

export function filterOpportunities(
  opportunities: Opportunity[],
  kind: OpportunityKind,
  profile: YoungProfileResponse | null,
): Opportunity[] {
  return opportunities
    .filter((opp) => {
      if (opp.kind !== kind) return false;
      if (!profile) return false;

      const interestMatch = opp.interests.some((interest) =>
        profile.interests.includes(interest),
      );
      const barrioMatch = opp.barrio === profile.barrio;

      return interestMatch && barrioMatch;
    })
    .sort((a, b) => b.slotsAvailable - a.slotsAvailable);
}

export function computeMatchScore(
  opportunity: Opportunity,
  profile: YoungProfileResponse,
): number {
  const overlap = opportunity.interests.filter((i) =>
    profile.interests.includes(i),
  ).length;
  const maxInterests = Math.max(opportunity.interests.length, profile.interests.length);
  const barrioBonus = opportunity.barrio === profile.barrio ? 0.2 : 0;
  const base = maxInterests > 0 ? overlap / maxInterests : 0;
  return Math.min(1, Math.round((base + barrioBonus) * 100) / 100);
}
