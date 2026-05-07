const DEFAULT_DEV_API_URL = 'http://localhost:5001/api/v1';

const trimSlash = (value: string) => value.replace(/\/+$/, '');

export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  // Production deployments MUST set NEXT_PUBLIC_API_URL. Fallback is dev-only.
  const resolved = trimSlash(fromEnv || DEFAULT_DEV_API_URL);
  if (resolved.endsWith('/api/v1')) return resolved;
  return `${resolved}/api/v1`;
}

export function getApiOrigin(): string {
  return getApiBaseUrl().replace(/\/api\/v1$/, '');
}
