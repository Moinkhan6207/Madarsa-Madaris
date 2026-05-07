const trimSlash = (value: string) => value.replace(/\/+$/, '');
const baseFromEnv = process.env.EXPO_PUBLIC_API_URL || 'https://madarsa-backend-k4yz.onrender.com';

export const API_BASE_URL = `${trimSlash(baseFromEnv)}/api/v1`;
