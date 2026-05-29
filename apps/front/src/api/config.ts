export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const MOCK_DELAY_MS = 300;
