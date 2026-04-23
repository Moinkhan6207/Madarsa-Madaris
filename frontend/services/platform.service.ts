import { api } from '../lib/api';
import { Tenant, TenantStatus } from '../types/tenant';

export interface GetTenantsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TenantStatus;
}

export const getTenants = async (params: GetTenantsParams = {}): Promise<{ tenants: Tenant[]; total: number }> => {
  const res = await api.get('/platform/tenants', { params });
  // Currently backend might return absolute format or nested in data.data
  return res.data.data;
};

export const getTenant = async (id: string): Promise<Tenant> => {
  const res = await api.get(`/platform/tenants/${id}`);
  return res.data.data;
};

export const approveTenant = async (id: string): Promise<Tenant> => {
  const res = await api.patch(`/platform/tenants/${id}/approve`);
  return res.data.data;
};

export const suspendTenant = async (id: string): Promise<Tenant> => {
  const res = await api.patch(`/platform/tenants/${id}/suspend`);
  return res.data.data;
};

export const activateTenant = async (id: string): Promise<Tenant> => {
  const res = await api.patch(`/platform/tenants/${id}/activate`);
  return res.data.data;
};

export const archiveTenant = async (id: string): Promise<Tenant> => {
  const res = await api.patch(`/platform/tenants/${id}/archive`);
  return res.data.data;
};
