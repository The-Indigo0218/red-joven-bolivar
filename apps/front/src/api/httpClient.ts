import { API_BASE_URL } from './config';
import { ApiRequestError, messageFromApiBody } from './errors';
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
  RedemptionCatalogResponse,
  RedemptionResponse,
  SuggestedActivitiesResponse,
  UploadCvRequest,
  UploadCvResponse,
  WaitlistResponse,
  YoungProfileResponse,
  ApiError,
} from '../types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    let body = null;
    try {
      body = await response.json();
    } catch {
      // respuesta no JSON
    }
    throw new ApiRequestError(
      messageFromApiBody(body, `Error ${response.status} en ${path}`),
      response.status,
      body as ApiError | null,
    );
  }
  return response.json() as Promise<T>;
}

function toQueryString(query: OpportunitiesQuery): string {
  const params = new URLSearchParams();
  if (query.type) params.set('type', query.type);
  if (query.interest) params.set('interest', query.interest);
  if (query.barrio) params.set('barrio', query.barrio);
  if (query.modalidad) params.set('modalidad', query.modalidad);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const httpClient = {
  young: {
    createProfile(body: CreateYoungProfileRequest): Promise<YoungProfileResponse> {
      return request<YoungProfileResponse>('/young/profile', { method: 'POST', body: JSON.stringify(body) });
    },
    updateProfile(id: string, body: CreateYoungProfileRequest): Promise<YoungProfileResponse> {
      return request<YoungProfileResponse>(`/young/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
    },
    getProfile(id: string): Promise<YoungProfileResponse> {
      return request<YoungProfileResponse>(`/young/${id}`);
    },
    uploadCv(body: UploadCvRequest): Promise<UploadCvResponse> {
      return request<UploadCvResponse>('/young/cv', { method: 'POST', body: JSON.stringify(body) });
    },
  },
  opportunities: {
    list(query: OpportunitiesQuery = {}): Promise<OpportunitiesResponse> {
      return request<OpportunitiesResponse>(`/opportunities${toQueryString(query)}`);
    },
    expressInterest(id: string, body: ExpressInterestRequest): Promise<InterestResult> {
      return request<InterestResult>(`/opportunities/${id}/interest`, { method: 'POST', body: JSON.stringify(body) });
    },
    getWaitlist(id: string): Promise<WaitlistResponse> {
      return request<WaitlistResponse>(`/opportunities/${id}/waitlist`);
    },
    getRoute(opportunityId: string, youngId: string): Promise<GrowthRouteResponse> {
      return request<GrowthRouteResponse>(
        `/opportunities/${opportunityId}/route?youngId=${encodeURIComponent(youngId)}`,
      );
    },
  },
  civiccoins: {
    getBalance(youngId: string): Promise<CivicCoinsBalanceResponse> {
      return request<CivicCoinsBalanceResponse>(`/civiccoins/${youngId}`);
    },
    suggestActivities(youngId: string): Promise<SuggestedActivitiesResponse> {
      return request<SuggestedActivitiesResponse>(
        `/civiccoins/activities?youngId=${encodeURIComponent(youngId)}`,
      );
    },
    earn(body: EarnCivicCoinsRequest): Promise<EarnCivicCoinsResponse> {
      return request<EarnCivicCoinsResponse>('/civiccoins/earn', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
  },
  redemptions: {
    getCatalog(): Promise<RedemptionCatalogResponse> {
      return request<RedemptionCatalogResponse>('/redemptions/catalog');
    },
    redeem(body: CreateRedemptionRequest): Promise<RedemptionResponse> {
      return request<RedemptionResponse>('/redemptions', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
  },
  demand: {
    getDashboard(): Promise<DemandDashboardResponse> {
      return request<DemandDashboardResponse>('/demand/dashboard');
    },
  },
};
