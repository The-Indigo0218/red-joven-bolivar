import { createContext } from 'react';
import type {
  CreateYoungProfileRequest,
  MatchResponse,
  Opportunity,
  YoungProfileResponse,
} from '../types';

export interface AppContextValue {
  profile: YoungProfileResponse | null;
  opportunities: Opportunity[];
  matches: MatchResponse[];
  isLoadingOpportunities: boolean;
  opportunitiesError: string | null;
  isSavingProfile: boolean;
  interestLoadingId: string | null;
  saveProfile: (request: CreateYoungProfileRequest) => Promise<YoungProfileResponse>;
  clearProfile: () => void;
  expressInterest: (opportunityId: string) => Promise<MatchResponse | null>;
  isInterestedIn: (opportunityId: string) => boolean;
  refreshOpportunities: () => Promise<void>;
}

export const AppContext = createContext<AppContextValue | null>(null);
