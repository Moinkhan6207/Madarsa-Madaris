import { api } from '@/services/api';
import { LoginResponse, User } from '@/types/auth';
import { Tenant } from '@/types/tenant';

export type InstitutionType =
  | 'SMALL_LOCAL_MADARSA'
  | 'RESIDENTIAL_MADARSA'
  | 'HYBRID_DEENI_SCHOOL'
  | 'TRUST_RUN_IDARA'
  | 'MASJID_MADARSA_COMBINED'
  | 'OTHER';

export interface RegisterPayload {
  displayName: string;
  slug: string;
  institutionType: InstitutionType;
  adminUser: {
    fullName: string;
    email: string;
    password: string;
  };
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data;
  },
  async registerTenant(payload: RegisterPayload): Promise<LoginResponse> {
    const response = await api.post('/auth/register', payload);
    return response.data.data;
  },
  async getProfile(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.data;
  },
  async getTenantMe(): Promise<Tenant> {
    const response = await api.get('/tenant/me');
    return response.data.data;
  },
};
