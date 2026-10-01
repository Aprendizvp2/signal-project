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
    debug: (msg: string, meta?: unknown) => env.LOG_LEVEL === 'debug' && console.log(msg, scrub(meta)),
    info: (msg: string, meta?: unknown) => console.log(msg, scrub(meta)),
    warn: (msg: string, meta?: unknown) => console.warn(msg, scrub(meta)),
    error: (msg: string, meta?: unknown) => console.error(msg, scrub(meta)),
};