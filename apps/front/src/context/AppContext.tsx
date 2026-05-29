import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { mockOpportunities } from '../data/mockOpportunities';
import type {
  CreateYoungProfileRequest,
  MatchResponse,
  Opportunity,
  YoungProfileResponse,
} from '../types';
import { computeMatchScore } from '../utils/filterOpportunities';
import { loadFromStorage, saveToStorage, storageKeys } from '../utils/storage';

interface AppContextValue {
  profile: YoungProfileResponse | null;
  opportunities: Opportunity[];
  matches: MatchResponse[];
  saveProfile: (request: CreateYoungProfileRequest) => YoungProfileResponse;
  clearProfile: () => void;
  expressInterest: (opportunityId: string) => MatchResponse | null;
  isInterestedIn: (opportunityId: string) => boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

function createProfileId(): string {
  return crypto.randomUUID();
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<YoungProfileResponse | null>(() =>
    loadFromStorage<YoungProfileResponse | null>(storageKeys.profile, null),
  );

  const [opportunities, setOpportunities] = useState<Opportunity[]>(() =>
    loadFromStorage<Opportunity[]>(storageKeys.opportunities, mockOpportunities),
  );

  const [matches, setMatches] = useState<MatchResponse[]>(() =>
    loadFromStorage<MatchResponse[]>(storageKeys.matches, []),
  );

  const saveProfile = useCallback((request: CreateYoungProfileRequest) => {
    const created: YoungProfileResponse = {
      id: createProfileId(),
      ...request,
      createdAt: new Date().toISOString(),
    };
    setProfile(created);
    saveToStorage(storageKeys.profile, created);
    return created;
  }, []);

  const clearProfile = useCallback(() => {
    setProfile(null);
    localStorage.removeItem(storageKeys.profile);
  }, []);

  const isInterestedIn = useCallback(
    (opportunityId: string) =>
      matches.some((m) => m.opportunityId === opportunityId),
    [matches],
  );

  const expressInterest = useCallback(
    (opportunityId: string): MatchResponse | null => {
      if (!profile) return null;
      if (isInterestedIn(opportunityId)) return null;

      const opportunity = opportunities.find((o) => o.id === opportunityId);
      if (!opportunity || opportunity.slotsAvailable <= 0) return null;

      const slotsAvailable = opportunity.slotsAvailable - 1;

      setOpportunities((prev) => {
        const next = prev.map((o) =>
          o.id === opportunityId ? { ...o, slotsAvailable } : o,
        );
        saveToStorage(storageKeys.opportunities, next);
        return next;
      });

      const match: MatchResponse = {
        id: createProfileId(),
        youngId: profile.id,
        opportunityId,
        status: 'interesado',
        score: computeMatchScore(opportunity, profile),
        slotsAvailable,
        createdAt: new Date().toISOString(),
      };

      setMatches((prev) => {
        const next = [...prev, match];
        saveToStorage(storageKeys.matches, next);
        return next;
      });

      return match;
    },
    [profile, opportunities, isInterestedIn],
  );

  const value = useMemo(
    () => ({
      profile,
      opportunities,
      matches,
      saveProfile,
      clearProfile,
      expressInterest,
      isInterestedIn,
    }),
    [
      profile,
      opportunities,
      matches,
      saveProfile,
      clearProfile,
      expressInterest,
      isInterestedIn,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp debe usarse dentro de AppProvider');
  }
  return ctx;
}
