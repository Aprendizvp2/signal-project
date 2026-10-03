export const env = {
    API_URL: 'http://localhost:3000',
    USE_FAKE_API: true,
    PRIORITY_ENABLED: true,
    LOG_LEVEL: (__DEV__ ? 'debug' : 'warn') as 'debug' | 'info' | 'warn' | 'error',
  } as const;