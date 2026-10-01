export const env = {
    API_URL: 'http://localhost:3000',
    USE_FAKE_API: true,
    PRIORITY_ENABLED: true, // feature flag / kill switch
    LOG_LEVEL: __DEV__ ? 'debug' : 'warn',
} as const;