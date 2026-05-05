import { ApiErrorResponse, FrontendApiError } from '@/types/api-error';
import { removeCookie } from '@/lib/cookies';
import { getApiBaseUrl } from '@/lib/api-config';

const API_BASE_URL = getApiBaseUrl();

type RequestConfig = {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | null | undefined>;
  timeout?: number;
};

type MaybeConfig = RequestConfig | Record<string, any> | undefined;

const normalizeConfig = (config?: MaybeConfig): RequestConfig => {
  if (!config) return {};
  if ('headers' in config || 'params' in config || 'timeout' in config) {
    return config as RequestConfig;
  }
  return { params: config as Record<string, string | number | boolean | null | undefined> };
};

const buildUrl = (path: string, params?: RequestConfig['params']) => {
  const base = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  if (!params) return base;
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) qs.append(k, String(v));
  });
  const query = qs.toString();
  return query ? `${base}${base.includes('?') ? '&' : '?'}${query}` : base;
};

const normalizeHttpError = async (res: Response): Promise<FrontendApiError> => {
  let payload: ApiErrorResponse | undefined;
  try {
    payload = await res.json();
  } catch {
    payload = undefined;
  }

  if (payload?.error) {
    return new FrontendApiError(
      payload.error.message || 'An error occurred',
      payload.error.code || 'UNKNOWN_ERROR',
      res.status || 500,
      payload.error.details,
      payload.requestId,
      payload.timestamp || new Date().toISOString(),
      true
    );
  }

  return new FrontendApiError(`Request failed with status ${res.status}`, 'UNKNOWN_ERROR', res.status || 500);
};

const handle401 = (error: FrontendApiError) => {
  if (error.statusCode === 401 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    removeCookie('auth_token');
    removeCookie('user_role');
    window.location.href = '/login?error=session_expired';
  }
};

const getCachedApiResponse = async <T>(url: string): Promise<T | null> => {
  if (typeof window === 'undefined' || !('caches' in window)) return null;
  const cache = await caches.open('api-cache');
  const response = await cache.match(url);
  if (!response) return null;

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const request = async <T>(method: string, path: string, body?: any, inputConfig?: MaybeConfig): Promise<T> => {
  const config = normalizeConfig(inputConfig);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') : null;

  const headers: Record<string, string> = {
    ...(config?.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;
  if (tenantId) headers['x-tenant-id'] = tenantId;

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (!isFormData && body !== undefined && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config?.timeout ?? 30000);

  const requestUrl = buildUrl(path, config?.params);

  try {
    const res = await fetch(requestUrl, {
      method,
      headers,
      credentials: 'include',
      signal: controller.signal,
      body: body === undefined ? undefined : (isFormData ? body : JSON.stringify(body)),
    });

    if (!res.ok) {
      const err = await normalizeHttpError(res);
      handle401(err);
      throw err;
    }

    return (await res.json()) as T;
  } catch (error: any) {
    if (method === 'GET') {
      const cached = await getCachedApiResponse<T>(requestUrl);
      if (cached) return cached;
    }

    if (error instanceof FrontendApiError) throw error;
    if (error?.name === 'AbortError') {
      throw new FrontendApiError('Request timed out. Please try again.', 'TIMEOUT_ERROR', 0);
    }
    throw new FrontendApiError('Network connection failed. Please check your internet connection.', 'NETWORK_ERROR', 0);
  } finally {
    clearTimeout(timeout);
  }
};

export const apiClient = {
  get: <T>(url: string, config?: MaybeConfig) => request<T>('GET', url, undefined, config),
  post: <T>(url: string, data?: any, config?: MaybeConfig) => request<T>('POST', url, data, config),
  put: <T>(url: string, data?: any, config?: MaybeConfig) => request<T>('PUT', url, data, config),
  patch: <T>(url: string, data?: any, config?: MaybeConfig) => request<T>('PATCH', url, data, config),
  delete: <T>(url: string, config?: MaybeConfig) => request<T>('DELETE', url, undefined, config),
};

export const api = {
  get: async (url: string, config?: MaybeConfig) => ({ data: await request<any>('GET', url, undefined, config) }),
  post: async (url: string, data?: any, config?: MaybeConfig) => ({ data: await request<any>('POST', url, data, config) }),
  put: async (url: string, data?: any, config?: MaybeConfig) => ({ data: await request<any>('PUT', url, data, config) }),
  patch: async (url: string, data?: any, config?: MaybeConfig) => ({ data: await request<any>('PATCH', url, data, config) }),
  delete: async (url: string, config?: MaybeConfig) => ({ data: await request<any>('DELETE', url, undefined, config) }),
};

export default apiClient;
