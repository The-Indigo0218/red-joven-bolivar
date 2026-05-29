import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from '../api';
import { ApiRequestError } from '../api';
import type {
  CreateYoungProfileRequest,
  MatchResponse,
  Opportunity,
  YoungProfileResponse,
} from '../types';
import { loadFromStorage, saveToStorage, storageKeys } from '../utils/storage';
import { AppContext } from './app-context';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<YoungProfileResponse | null>(() =>
    loadFromStorage<YoungProfileResponse | null>(storageKeys.profile, null),
  );
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [matches, setMatches] = useState<MatchResponse[]>(() =>
    loadFromStorage(storageKeys.matches, []),
  );
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(true);
  const [opportunitiesError, setOpportunitiesError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [interestLoadingId, setInterestLoadingId] = useState<string | null>(null);

  const refreshOpportunities = useCallback(async () => {
    setIsLoadingOpportunities(true);
    try {
      const response = await api.opportunities.list({});
      setOpportunities(response.items);
      setOpportunitiesError(null);
    } catch (error) {
      setOpportunitiesError(getErrorMessage(error, 'No pudimos cargar las oportunidades.'));
    } finally {
      setIsLoadingOpportunities(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await api.opportunities.list({});
        if (!cancelled) {
          setOpportunities(response.items);
          setOpportunitiesError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setOpportunitiesError(
            getErrorMessage(error, 'No pudimos cargar las oportunidades.'),
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOpportunities(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const saveProfile = useCallback(async (request: CreateYoungProfileRequest) => {
    setIsSavingProfile(true);
    try {
      const created = await api.young.createProfile(request);
      setProfile(created);
      saveToStorage(storageKeys.profile, created);
      return created;
    } finally {
      setIsSavingProfile(false);
    }
  }, []);

  const clearProfile = useCallback(() => {
    setProfile(null);
    localStorage.removeItem(storageKeys.profile);
  }, []);

  const isInterestedIn = useCallback(
    (opportunityId: string) => matches.some((m) => m.opportunityId === opportunityId),
    [matches],
  );

  const expressInterest = useCallback(
    async (opportunityId: string): Promise<MatchResponse | null> => {
      if (!profile) return null;
      if (isInterestedIn(opportunityId)) return null;

      const opportunity = opportunities.find((o) => o.id === opportunityId);
      if (!opportunity || opportunity.slotsAvailable <= 0) return null;

      setInterestLoadingId(opportunityId);
      try {
        const match = await api.opportunities.expressInterest(opportunityId, {
          youngId: profile.id,
        });

        setOpportunities((prev) =>
          prev.map((o) =>
            o.id === opportunityId ? { ...o, slotsAvailable: match.slotsAvailable } : o,
          ),
        );

        setMatches((prev) => {
          const next = [...prev, match];
          saveToStorage(storageKeys.matches, next);
          return next;
        });

        return match;
      } catch {
        return null;
      } finally {
        setInterestLoadingId(null);
      }
    },
    [profile, opportunities, isInterestedIn],
  );

  const value = useMemo(
    () => ({
      profile,
      opportunities,
      matches,
      isLoadingOpportunities,
      opportunitiesError,
      isSavingProfile,
      interestLoadingId,
      saveProfile,
      clearProfile,
      expressInterest,
      isInterestedIn,
      refreshOpportunities,
    }),
    [
      profile,
      opportunities,
      matches,
      isLoadingOpportunities,
      opportunitiesError,
      isSavingProfile,
      interestLoadingId,
      saveProfile,
      clearProfile,
      expressInterest,
      isInterestedIn,
      refreshOpportunities,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
