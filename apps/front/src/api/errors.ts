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
