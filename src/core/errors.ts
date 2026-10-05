export type AppErrorKind =
  | 'network'
  | 'timeout'
  | 'auth'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'validation'
  | 'server'
  | 'unknown';

export class AppError extends Error {
  constructor(
    public kind: AppErrorKind,
    message: string,
    public status?: number,
    public cause?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const fromHttpStatus = (status: number, msg = 'Request failed') => {
  const map: Record<number, AppErrorKind> = {
    401: 'auth', 403: 'forbidden', 404: 'not_found',
    409: 'conflict', 422: 'validation', 500: 'server',
  };
  return new AppError(map[status] ?? 'unknown', msg, status);
};