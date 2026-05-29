import { MOCK_DELAY_MS } from './config';
import { mockDemand } from '../data/mockDemand';
import { mockOpportunities } from '../data/mockOpportunities';
import type {
  CivicCoinsBalanceResponse,
  CreateRedemptionRequest,
  CreateYoungProfileRequest,
  DemandDashboardResponse,
  EarnCivicCoinsRequest,
  EarnCivicCoinsResponse,
  ExpressInterestRequest,
  GrowthRouteResponse,
  MatchResponse,
  OpportunitiesQuery,
  OpportunitiesResponse,
  Opportunity,
  RedemptionCatalogResponse,
  RedemptionResponse,
  SuggestedActivitiesResponse,
  YoungProfileResponse,
} from '../types';
import {
  buildMockRoute,
  mockCivicCoinsBalance,
  mockRedemptionCatalog,
  mockSuggestedActivities,
} from '../data/mockRoute';
import { computeMatchScore } from '../utils/filterOpportunities';
import { loadFromStorage, saveToStorage, storageKeys } from '../utils/storage';

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), MOCK_DELAY_MS);
  });
}

function getOpportunities(): Opportunity[] {
  return loadFromStorage<Opportunity[]>(storageKeys.opportunities, mockOpportunities);
}

function saveOpportunities(items: Opportunity[]): void {
  saveToStorage(storageKeys.opportunities, items);
}

function getMatches(): MatchResponse[] {
  return loadFromStorage<MatchResponse[]>(storageKeys.matches, []);
}

function saveMatches(items: MatchResponse[]): void {
  saveToStorage(storageKeys.matches, items);
}

function createId(): string {
  return crypto.randomUUID();
}

function filterOpportunities(query: OpportunitiesQuery, items: Opportunity[]): Opportunity[] {
  return items.filter((item) => {
    if (query.type && item.kind !== query.type) return false;
    if (query.interest && !item.interests.includes(query.interest)) return false;
    if (query.barrio && item.barrio !== query.barrio) return false;
    return true;
  });
}

export const mockClient = {
  young: {
    async createProfile(body: CreateYoungProfileRequest): Promise<YoungProfileResponse> {
      const created: YoungProfileResponse = {
        id: createId(),
        ...body,
        createdAt: new Date().toISOString(),
      };
      return delay(created);
    },
  },
  opportunities: {
    async list(query: OpportunitiesQuery = {}): Promise<OpportunitiesResponse> {
      const items = filterOpportunities(query, getOpportunities());
      return delay({ items, total: items.length });
    },
    async expressInterest(id: string, body: ExpressInterestRequest): Promise<MatchResponse> {
      const opportunities = getOpportunities();
      const opportunity = opportunities.find((o) => o.id === id);
      if (!opportunity || opportunity.slotsAvailable <= 0) {
        throw new Error('Sin cupos disponibles');
      }

      const matches = getMatches();
      if (matches.some((m) => m.youngId === body.youngId && m.opportunityId === id)) {
        throw new Error('Interes ya registrado');
      }

      const slotsAvailable = opportunity.slotsAvailable - 1;
      const nextOpportunities = opportunities.map((o) =>
        o.id === id ? { ...o, slotsAvailable } : o,
      );
      saveOpportunities(nextOpportunities);

      const profileStub: YoungProfileResponse = {
        id: body.youngId,
        name: '',
        age: 18,
        barrio: opportunity.barrio,
        educationLevel: 'ninguno',
        seeking: 'todos',
        availability: [],
        interests: opportunity.interests,
        createdAt: new Date().toISOString(),
      };

      const match: MatchResponse = {
        id: createId(),
        youngId: body.youngId,
        opportunityId: id,
        status: 'interesado',
        score: computeMatchScore(opportunity, profileStub),
        slotsAvailable,
        createdAt: new Date().toISOString(),
      };

      saveMatches([...matches, match]);
      return delay(match);
    },
    async getRoute(opportunityId: string, youngId: string): Promise<GrowthRouteResponse> {
      const opportunity = getOpportunities().find((o) => o.id === opportunityId);
      const route = buildMockRoute(opportunityId, youngId);
      if (opportunity) {
        route.headline = `Ruta hacia "${opportunity.title}" — ${route.affinityScore}% de afinidad.`;
      }
      return delay(route);
    },
  },
  civiccoins: {
    async getBalance(youngId: string): Promise<CivicCoinsBalanceResponse> {
      return delay(mockCivicCoinsBalance(youngId));
    },
    async suggestActivities(youngId: string): Promise<SuggestedActivitiesResponse> {
      void youngId;
      return delay(mockSuggestedActivities);
    },
    async earn(body: EarnCivicCoinsRequest): Promise<EarnCivicCoinsResponse> {
      const activity = mockSuggestedActivities.items.find((a) => a.id === body.activityId);
      const points = activity?.pointsReward ?? 30;
      const balance = mockCivicCoinsBalance(body.youngId).balance + points;
      return delay({
        transactionId: createId(),
        pointsEarned: points,
        newBalance: balance,
        activity: activity?.title ?? 'Actividad social',
      });
    },
  },
  redemptions: {
    async getCatalog(): Promise<RedemptionCatalogResponse> {
      return delay(mockRedemptionCatalog);
    },
    async redeem(body: CreateRedemptionRequest): Promise<RedemptionResponse> {
      const item = mockRedemptionCatalog.items.find((i) => i.id === body.catalogItemId);
      const cost = item?.pointsCost ?? 100;
      const balance = mockCivicCoinsBalance(body.youngId).balance - cost;
      return delay({
        redemptionId: createId(),
        partner: item?.partner ?? 'Aliado',
        pointsSpent: cost,
        newBalance: Math.max(0, balance),
        voucherCode: `RJB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      });
    },
  },
  demand: {
    async getDashboard(): Promise<DemandDashboardResponse> {
      return delay({
        ...mockDemand,
        generatedAt: new Date().toISOString(),
      });
    },
  },
};
