import { USE_MOCK } from './config';
import { httpClient } from './httpClient';
import { mockClient } from './mockClient';

export const api = USE_MOCK ? mockClient : httpClient;
export { ApiRequestError } from './errors';
export { API_BASE_URL, USE_MOCK } from './config';
