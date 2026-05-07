const trimSlash = (value: string) => value.replace(/\/+$/, '');

// Production builds MUST set EXPO_PUBLIC_API_URL. The localhost fallback is dev-only.
const baseFromEnv = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001';

export const API_BASE_URL = `${trimSlash(baseFromEnv)}/api/v1`;
