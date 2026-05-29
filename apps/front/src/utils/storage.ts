const KEYS = {
  profile: 'rjb-young-profile',
  opportunities: 'rjb-opportunities',
  matches: 'rjb-matches',
  youngSkills: 'rjb-young-skills',
} as const;

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storageKeys = KEYS;
