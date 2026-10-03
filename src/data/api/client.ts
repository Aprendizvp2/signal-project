import axios, { AxiosError, AxiosInstance } from 'axios';
import { env } from '../../config/env';
import { AppError, fromHttpStatus } from '../../core/errors';
import { logger } from '../../core/logger';

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const setAuthToken = (token: string | null) => { authToken = token; };
export const setUnauthorizedHandler = (fn: () => void) => { onUnauthorized = fn; };

export const http: AxiosInstance = axios.create({
  baseURL: env.API_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// request: agrega token
http.interceptors.request.use(cfg => {
  if (authToken) cfg.headers.Authorization = `Bearer ${authToken}`;
  logger.debug('[http] →', { method: cfg.method, url: cfg.url });
  return cfg;
});

// response: normaliza errores
http.interceptors.response.use(
  res => {
    logger.debug('[http] ←', { status: res.status, url: res.config.url });
    return res;
  },
  (err: AxiosError) => {
    if (err.code === 'ECONNABORTED') {
      return Promise.reject(new AppError('timeout', 'Request timeout', undefined, err));
    }
    if (!err.response) {
      return Promise.reject(new AppError('network', 'Sin conexión', undefined, err));
    }
    const status = err.response.status;
    if (status === 401) onUnauthorized?.();
    return Promise.reject(fromHttpStatus(status, err.message));
  },
);

export interface RequestOptions {
  idempotencyKey?: string;
  signal?: AbortSignal;
}

export const api = {
  get:  <T>(url: string, opts: RequestOptions = {}) =>
    http.get<T>(url, { signal: opts.signal }).then(r => r.data),

  post: <T>(url: string, body?: unknown, opts: RequestOptions = {}) =>
    http.post<T>(url, body, {
      signal: opts.signal,
      headers: opts.idempotencyKey ? { 'Idempotency-Key': opts.idempotencyKey } : undefined,
    }).then(r => r.data),

  patch: <T>(url: string, body?: unknown) =>
    http.patch<T>(url, body).then(r => r.data),

  delete: <T>(url: string) => http.delete<T>(url).then(r => r.data),
};