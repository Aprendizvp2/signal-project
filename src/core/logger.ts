import { env } from '../config/env';

const REDACT = ['token', 'authorization', 'audio', 'url', 'text', 'content'];

const scrub = (v: unknown): unknown => {
  if (v == null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(scrub);
  return Object.fromEntries(
    Object.entries(v as Record<string, unknown>).map(([k, val]) =>
      REDACT.some(r => k.toLowerCase().includes(r)) ? [k, '[REDACTED]'] : [k, scrub(val)],
    ),
  );
};

export const logger = {
  debug: (m: string, meta?: unknown) => env.LOG_LEVEL === 'debug' && console.log(m, scrub(meta)),
  info:  (m: string, meta?: unknown) => console.log(m, scrub(meta)),
  warn:  (m: string, meta?: unknown) => console.warn(m, scrub(meta)),
  error: (m: string, meta?: unknown) => console.error(m, scrub(meta)),
};