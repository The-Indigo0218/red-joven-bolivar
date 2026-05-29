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
  InterestResult,
  Opportunity,
  YoungProfileResponse,
} from '../types';
import { loadFromStorage, saveToStorage, storageKeys } from '../utils/storage';
import { AppContext } from './app-context';

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

function loadInterestsForProfile(profile: YoungProfileResponse | null): InterestResult[] {
  const stored = loadFromStorage<unknown[]>(storageKeys.matches, []);
  const interests = stored
    .map(normalizeInterest)
    .filter((item): item is InterestResult => item !== null);
  if (!profile) return [];
  return interests.filter((i) => i.youngId === profile.id);
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError) {
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

function isStaleProfileError(error: unknown): boolean {
  return error instanceof ApiRequestError && error.statusCode === 404;
}

function clearStoredSession(
  setProfile: (profile: YoungProfileResponse | null) => void,
  setInterests: (interests: InterestResult[]) => void,
): void {
  setProfile(null);
  setInterests([]);
  localStorage.removeItem(storageKeys.profile);
  localStorage.removeItem(storageKeys.matches);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<YoungProfileResponse | null>(null);
  const [interests, setInterests] = useState<InterestResult[]>([]);
  const [isHydratingProfile, setIsHydratingProfile] = useState(true);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(true);
  const [opportunitiesError, setOpportunitiesError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [interestLoadingId, setInterestLoadingId] = useState<string | null>(null);
  const [cvSkillsRevision, setCvSkillsRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function hydrateProfile() {
      const stored = loadFromStorage<YoungProfileResponse | null>(storageKeys.profile, null);
      if (!stored?.id) {
        if (!cancelled) setIsHydratingProfile(false);
        return;
      }

      try {
        const fresh = await api.young.getProfile(stored.id);
        if (!cancelled) {
          setProfile(fresh);
          saveToStorage(storageKeys.profile, fresh);
          setInterests(loadInterestsForProfile(fresh));
        }
      } catch (error) {
        if (!cancelled && isStaleProfileError(error)) {
          clearStoredSession(setProfile, setInterests);
        }
      } finally {
        if (!cancelled) setIsHydratingProfile(false);
      }
    }

    void hydrateProfile();

    return () => {
      cancelled = true;
    };
  }, []);

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

  const clearProfile = useCallback(() => {
    clearStoredSession(setProfile, setInterests);
  }, []);

  const saveProfile = useCallback(async (request: CreateYoungProfileRequest) => {
    setIsSavingProfile(true);
    try {
      let saved: YoungProfileResponse;

      if (profile?.id) {
        try {
          saved = await api.young.updateProfile(profile.id, request);
        } catch (error) {
          if (isStaleProfileError(error)) {
            saved = await api.young.createProfile(request);
            clearStoredSession(setProfile, setInterests);
          } else {
            throw error;
          }
        }
      } else {
        saved = await api.young.createProfile(request);
      }

      setProfile(saved);
      setInterests([]);
      saveToStorage(storageKeys.profile, saved);
      localStorage.removeItem(storageKeys.matches);
      return saved;
    } finally {
      setIsSavingProfile(false);
    }
  }, [profile?.id]);

  const notifyCvSkillsUpdated = useCallback(() => {
    setCvSkillsRevision((n) => n + 1);
  }, []);

  const findInterest = useCallback(
    (opportunityId: string) => {
      if (!profile) return undefined;
      return interests.find(
        (i) => i.youngId === profile.id && i.opportunityId === opportunityId,
      );
    },
    [interests, profile],
  );

  const isInterestedIn = useCallback(
    (opportunityId: string) => findInterest(opportunityId)?.status === 'interesado',
    [findInterest],
  );

  const isWaitlisted = useCallback(
    (opportunityId: string) => findInterest(opportunityId)?.status === 'en-espera',
    [findInterest],
  );

  const getWaitlistPosition = useCallback(
    (opportunityId: string) => findInterest(opportunityId)?.waitlistPosition ?? null,
    [findInterest],
  );

  const expressInterest = useCallback(
    async (opportunityId: string): Promise<InterestResult | null> => {
      if (!profile) return null;
      if (findInterest(opportunityId)) return null;

      setInterestLoadingId(opportunityId);
      try {
        const result = await api.opportunities.expressInterest(opportunityId, {
          youngId: profile.id,
        });

        setOpportunities((prev) =>
          prev.map((o) =>
            o.id === opportunityId ? { ...o, slotsAvailable: result.slotsAvailable } : o,
          ),
        );

        setInterests((prev) => {
          const next = [...prev, result];
          saveToStorage(storageKeys.matches, next);
          return next;
        });

        return result;
      } catch (error) {
        if (isStaleProfileError(error)) {
          clearStoredSession(setProfile, setInterests);
          throw new Error('Tu perfil ya no existe en el servidor. Volvé a crearlo en Mi perfil.');
        }
        throw error;
      } finally {
        setInterestLoadingId(null);
      }
    },
    [profile, findInterest],
  );

  const value = useMemo(
    () => ({
      profile,
      opportunities,
      interests,
      cvSkillsRevision,
      isHydratingProfile,
      isLoadingOpportunities,
      opportunitiesError,
      isSavingProfile,
      interestLoadingId,
      saveProfile,
      clearProfile,
      expressInterest,
      isInterestedIn,
      isWaitlisted,
      getWaitlistPosition,
      notifyCvSkillsUpdated,
      refreshOpportunities,
    }),
    [
      profile,
      opportunities,
      interests,
      cvSkillsRevision,
      isHydratingProfile,
      isLoadingOpportunities,
      opportunitiesError,
      isSavingProfile,
      interestLoadingId,
      saveProfile,
      clearProfile,
      expressInterest,
      isInterestedIn,
      isWaitlisted,
      getWaitlistPosition,
      notifyCvSkillsUpdated,
      refreshOpportunities,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
