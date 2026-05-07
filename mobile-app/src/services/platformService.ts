import { api } from '@/services/api';
import { Tenant, TenantListResponse, TenantStatus } from '@/types/tenant';

export interface GetTenantsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TenantStatus;
}

export const platformService = {
  async getTenants(params: GetTenantsParams = {}): Promise<TenantListResponse> {
    const res = await api.get('/platform/tenants', { params });
    return res.data.data;
  },

  async getTenant(id: string): Promise<Tenant> {
    const res = await api.get(`/platform/tenants/${id}`);
    return res.data.data;
  },

  async approveTenant(id: string): Promise<Tenant> {
    const res = await api.patch(`/platform/tenants/${id}/approve`);
    return res.data.data;
  },

  async suspendTenant(id: string): Promise<Tenant> {
    const res = await api.patch(`/platform/tenants/${id}/suspend`);
    return res.data.data;
  },

  async activateTenant(id: string): Promise<Tenant> {
    const res = await api.patch(`/platform/tenants/${id}/activate`);
    return res.data.data;
  },

  async archiveTenant(id: string): Promise<Tenant> {
    const res = await api.patch(`/platform/tenants/${id}/archive`);
    return res.data.data;
  },
};
