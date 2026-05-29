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
  InterestResult,
  OpportunitiesQuery,
  OpportunitiesResponse,
  Opportunity,
  RedemptionCatalogResponse,
  RedemptionResponse,
  SuggestedActivitiesResponse,
  UploadCvRequest,
  UploadCvResponse,
  WaitlistItem,
  WaitlistResponse,
  YoungProfileResponse,
} from '../types';
import {
  buildMockRoute,
  mockCivicCoinsBalance,
  mockRedemptionCatalog,
  mockSuggestedActivities,
} from '../data/mockRoute';
import { extractSkillsFromText } from '../data/skillCatalog';
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

function getInterests(): InterestResult[] {
  const stored = loadFromStorage<unknown[]>(storageKeys.matches, []);
  return stored
    .map(normalizeInterest)
    .filter((item): item is InterestResult => item !== null);
}

function saveInterests(items: InterestResult[]): void {
  saveToStorage(storageKeys.matches, items);
}

function normalizeInterest(raw: unknown): InterestResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  if (!item.youngId || !item.opportunityId) return null;

  if ('waitlisted' in item) {
    return item as unknown as InterestResult;
  }

  return {
    status: 'interesado',
    waitlisted: false,
    youngId: item.youngId as string,
    opportunityId: item.opportunityId as string,
    score: (item.score as number) ?? 0,
    slotsAvailable: (item.slotsAvailable as number) ?? 0,
    matchId: item.id as string | undefined,
    createdAt: (item.createdAt as string) ?? new Date().toISOString(),
  };
}

function createId(): string {
  return crypto.randomUUID();
}

function filterOpportunities(query: OpportunitiesQuery, items: Opportunity[]): Opportunity[] {
  return items.filter((item) => {
    if (query.type && item.kind !== query.type) return false;
    if (query.interest && !item.interests.includes(query.interest)) return false;
    if (query.barrio && item.barrio !== query.barrio) return false;
    if (query.modalidad && item.modalidad !== query.modalidad) return false;
    return true;
  });
}

function waitlistForOpportunity(opportunityId: string): InterestResult[] {
  return getInterests()
    .filter((i) => i.opportunityId === opportunityId && i.status === 'en-espera')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
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
    async uploadCv(body: UploadCvRequest): Promise<UploadCvResponse> {
      const skills = extractSkillsFromText(body.cvText);
      const confidence = skills.length
        ? Math.min(0.95, Math.round((0.6 + (0.4 * skills.length) / 9) * 100) / 100)
        : 0.2;
      return delay({ skills, confidence });
    },
  },
  opportunities: {
    async list(query: OpportunitiesQuery = {}): Promise<OpportunitiesResponse> {
      const items = filterOpportunities(query, getOpportunities());
      return delay({ items, total: items.length });
    },
    async expressInterest(id: string, body: ExpressInterestRequest): Promise<InterestResult> {
      const opportunities = getOpportunities();
      const opportunity = opportunities.find((o) => o.id === id);
      if (!opportunity) {
        throw new Error('Oportunidad no encontrada');
      }

      const interests = getInterests();
      const existing = interests.find(
        (i) => i.youngId === body.youngId && i.opportunityId === id,
      );
      if (existing) {
        throw new Error('Ya registraste interés en esta oportunidad');
      }

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
      const score = computeMatchScore(opportunity, profileStub);

      if (opportunity.slotsAvailable <= 0) {
        const queue = waitlistForOpportunity(id);
        const position = queue.length + 1;
        const result: InterestResult = {
          status: 'en-espera',
          waitlisted: true,
          youngId: body.youngId,
          opportunityId: id,
          score,
          slotsAvailable: 0,
          waitlistId: createId(),
          waitlistPosition: position,
          createdAt: new Date().toISOString(),
        };
        saveInterests([...interests, result]);
        return delay(result);
      }

      const slotsAvailable = opportunity.slotsAvailable - 1;
      const nextOpportunities = opportunities.map((o) =>
        o.id === id ? { ...o, slotsAvailable } : o,
      );
      saveOpportunities(nextOpportunities);

      const result: InterestResult = {
        status: 'interesado',
        waitlisted: false,
        youngId: body.youngId,
        opportunityId: id,
        score,
        slotsAvailable,
        matchId: createId(),
        createdAt: new Date().toISOString(),
      };

      saveInterests([...interests, result]);
      return delay(result);
    },
    async getWaitlist(id: string): Promise<WaitlistResponse> {
      const opportunity = getOpportunities().find((o) => o.id === id);
      if (!opportunity) {
        throw new Error('Oportunidad no encontrada');
      }

      const items: WaitlistItem[] = waitlistForOpportunity(id).map((entry, index) => ({
        id: entry.waitlistId ?? createId(),
        youngId: entry.youngId,
        youngName: `Joven ${entry.youngId.slice(0, 8)}`,
        position: entry.waitlistPosition ?? index + 1,
        createdAt: entry.createdAt,
      }));

      return delay({ opportunityId: id, items, total: items.length });
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
