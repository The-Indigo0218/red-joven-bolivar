import { API_BASE_URL } from './config';
import { ApiRequestError } from './errors';
import type {
  CreateYoungProfileRequest,
  DemandDashboardResponse,
  ExpressInterestRequest,
  MatchResponse,
  OpportunitiesQuery,
  OpportunitiesResponse,
  YoungProfileResponse,
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
    throw new ApiRequestError(`Error ${response.status} en ${path}`, response.status, body);
  }
  return response.json() as Promise<T>;
}

function toQueryString(query: OpportunitiesQuery): string {
  const params = new URLSearchParams();
  if (query.type) params.set('type', query.type);
  if (query.interest) params.set('interest', query.interest);
  if (query.barrio) params.set('barrio', query.barrio);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const httpClient = {
  young: {
    createProfile(body: CreateYoungProfileRequest): Promise<YoungProfileResponse> {
      return request<YoungProfileResponse>('/young/profile', { method: 'POST', body: JSON.stringify(body) });
    },
  },
  opportunities: {
    list(query: OpportunitiesQuery = {}): Promise<OpportunitiesResponse> {
      return request<OpportunitiesResponse>(`/opportunities${toQueryString(query)}`);
    },
    expressInterest(id: string, body: ExpressInterestRequest): Promise<MatchResponse> {
      return request<MatchResponse>(`/opportunities/${id}/interest`, { method: 'POST', body: JSON.stringify(body) });
    },
  },
  demand: {
    getDashboard(): Promise<DemandDashboardResponse> {
      return request<DemandDashboardResponse>('/demand/dashboard');
    },
  },
};
