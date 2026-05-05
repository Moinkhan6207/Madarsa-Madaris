const DEPLOYED_API_BASE_URL = 'https://madarsa-backend-k4yz.onrender.com/api/v1';

const trimSlash = (value: string) => value.replace(/\/+$/, '');

export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  const resolved = trimSlash(fromEnv || DEPLOYED_API_BASE_URL);
  if (resolved.endsWith('/api/v1')) return resolved;
  return `${resolved}/api/v1`;
}

export function getApiOrigin(): string {
  return getApiBaseUrl().replace(/\/api\/v1$/, '');
}
