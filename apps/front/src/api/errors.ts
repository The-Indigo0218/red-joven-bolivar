import type { ApiError } from '../types';

export class ApiRequestError extends Error {
  readonly statusCode: number;
  readonly body: ApiError | null;

  constructor(message: string, statusCode: number, body: ApiError | null = null) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
    this.body = body;
  }
}

export function messageFromApiBody(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object' || !('message' in body)) return fallback;
  const message = (body as ApiError).message;
  if (Array.isArray(message)) return message.join(', ');
  if (typeof message === 'string' && message.trim()) return message;
  return fallback;
}
