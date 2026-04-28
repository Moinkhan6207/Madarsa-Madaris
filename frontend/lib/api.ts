import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  ApiErrorResponse, 
  FrontendApiError, 
} from '@/types/api-error';
import { removeCookie } from '@/lib/cookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    // We remove the default Content-Type to allow Axios to automatically
    // set the correct header (e.g., multipart/form-data for FormData)
  },
  withCredentials: true,
});

// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && config.headers) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    // Add tenant context if available
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') : null;
    if (tenantId && config.headers) {
      config.headers.set('x-tenant-id', tenantId);
    }

    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError<ApiErrorResponse>): Promise<never> => {
    const normalizedError = normalizeAxiosError(error);
    
    // Handle specific error scenarios (Redirect to login)
    if (normalizedError.statusCode === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        removeCookie('auth_token');
        removeCookie('user_role');
        window.location.href = '/login?error=session_expired';
      }
    }

    return Promise.reject(normalizedError);
  }
);

// Error Normalization Helper
const normalizeAxiosError = (error: AxiosError<ApiErrorResponse>): FrontendApiError => {
  if (error.response?.data) {
    const apiError = error.response.data;
    return new FrontendApiError(
      apiError.error?.message || 'An error occurred',
      apiError.error?.code || 'UNKNOWN_ERROR',
      error.response.status || 500,
      apiError.error?.details,
      apiError.requestId || (error.response.headers['x-request-id'] as string),
      apiError.timestamp || new Date().toISOString(),
      true
    );
  }

  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return new FrontendApiError('Request timed out. Please try again.', 'TIMEOUT_ERROR', 0);
  }

  if (!error.response) {
    return new FrontendApiError('Network connection failed. Please check your internet connection.', 'NETWORK_ERROR', 0);
  }

  return new FrontendApiError(error.message || 'An unexpected error occurred', 'UNKNOWN_ERROR', error.response?.status || 500);
};

// Typed API Client
export const apiClient = {
  get: <T>(url: string, config?: any) => api.get<T>(url, config).then((r) => r.data),
  post: <T>(url: string, data?: any, config?: any) => api.post<T>(url, data, config).then((r) => r.data),
  put: <T>(url: string, data?: any, config?: any) => api.put<T>(url, data, config).then((r) => r.data),
  patch: <T>(url: string, data?: any, config?: any) => api.patch<T>(url, data, config).then((r) => r.data),
  delete: <T>(url: string, config?: any) => api.delete<T>(url, config).then((r) => r.data),
};

export default api;
