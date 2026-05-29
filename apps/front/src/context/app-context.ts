import { createContext } from 'react';
import type {
  CreateYoungProfileRequest,
  InterestResult,
  Opportunity,
  YoungProfileResponse,
} from '../types';

export interface AppContextValue {
  profile: YoungProfileResponse | null;
  opportunities: Opportunity[];
  interests: InterestResult[];
  cvSkillsRevision: number;
  isHydratingProfile: boolean;
  isLoadingOpportunities: boolean;
  opportunitiesError: string | null;
  isSavingProfile: boolean;
  interestLoadingId: string | null;
  saveProfile: (request: CreateYoungProfileRequest) => Promise<YoungProfileResponse>;
  clearProfile: () => void;
  expressInterest: (opportunityId: string) => Promise<InterestResult | null>;
  isInterestedIn: (opportunityId: string) => boolean;
  isWaitlisted: (opportunityId: string) => boolean;
  getWaitlistPosition: (opportunityId: string) => number | null;
  notifyCvSkillsUpdated: () => void;
  refreshOpportunities: () => Promise<void>;
}

export const AppContext = createContext<AppContextValue | null>(null);
