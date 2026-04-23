import { api } from '../lib/api';
import { setCookie, removeCookie } from '../lib/cookies';
import type { TenantStatus } from '../types/tenant';

export interface User {
  id: string;
  fullName: string;
  email: string;
  tenantId: string | null;
  tenantStatus?: TenantStatus;
  roles: string[];
  permissions: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await api.post('/auth/login', { email, password });
  const data = res.data.data;
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Set cookies for middleware protection
    setCookie('auth_token', data.token);
    setCookie('user_role', data.user.roles?.includes('SUPER_ADMIN') ? 'SUPER_ADMIN' : 'TENANT_ADMIN');
  }
  
  return data;
};

export const registerTenant = async (payload: any): Promise<any> => {
  const res = await api.post('/auth/register', payload);
  const data = res.data.data;
  
  if (typeof window !== 'undefined' && data.token) {
    localStorage.setItem('token', data.token);
    setCookie('auth_token', data.token);
    if (data.user) {
       setCookie('user_role', data.user.roles?.includes('SUPER_ADMIN') ? 'SUPER_ADMIN' : 'TENANT_ADMIN');
    }
  }
  
  return data;
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    removeCookie('auth_token');
    removeCookie('user_role');
    window.location.href = '/login';
  }
};

export const getCurrentUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};
