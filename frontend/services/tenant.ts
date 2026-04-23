import { apiClient } from '@/lib/api';

// Config type doesn't exist in new simple api client for now, 
// if needed we can add it back, but let's stick to the migration goal.
type ApiClientConfig = any;


// =============================================================================
// Tenant Types
// =============================================================================

export interface Tenant {
  id: string;
  subdomain: string;
  name: string;
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  institutionType?: string;
  settings?: Record<string, unknown>;
}

export interface CreateTenantDto {
  subdomain: string;
  name: string;
  institutionType?: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminPassword: string;
}

export interface UpdateTenantDto {
  name?: string;
  status?: Tenant['status'];
  settings?: Record<string, unknown>;
}

export interface TenantApiResponse<T> {
  success: boolean;
  data: T;
  requestId?: string;
  timestamp: string;
}

export interface SubdomainCheckResponse {
  available: boolean;
  subdomain: string;
}

// =============================================================================
// Tenant Service
// =============================================================================

export const tenantService = {
  /**
   * Get all tenants (admin only)
   */
  getAll: (config?: ApiClientConfig) => 
    apiClient.get<TenantApiResponse<Tenant[]>>('/tenants', config),
  
  /**
   * Get tenant by ID
   */
  getById: (id: string, config?: ApiClientConfig) => 
    apiClient.get<TenantApiResponse<Tenant>>(`/tenants/${id}`, config),
  
  /**
   * Get tenant by subdomain (public)
   */
  getBySubdomain: (subdomain: string, config?: ApiClientConfig) => 
    apiClient.get<TenantApiResponse<Tenant>>(`/tenants/subdomain/${subdomain}`, config),
  
  /**
   * Create new tenant
   */
  create: (data: CreateTenantDto, config?: ApiClientConfig) => 
    apiClient.post<TenantApiResponse<Tenant>>('/tenants', data, config),
  
  /**
   * Update tenant
   */
  update: (id: string, data: UpdateTenantDto, config?: ApiClientConfig) =>
    apiClient.patch<TenantApiResponse<Tenant>>(`/tenants/${id}`, data, config),
  
  /**
   * Delete tenant
   */
  delete: (id: string, config?: ApiClientConfig) =>
    apiClient.delete<TenantApiResponse<void>>(`/tenants/${id}`, config),
  
  /**
   * Check subdomain availability
   */
  checkSubdomain: (subdomain: string, config?: ApiClientConfig) =>
    apiClient.get<SubdomainCheckResponse>(`/tenants/check-subdomain/${subdomain}`, config),
  
  /**
   * Verify tenant (admin only)
   */
  verify: (id: string, config?: ApiClientConfig) =>
    apiClient.post<TenantApiResponse<Tenant>>(`/tenants/${id}/verify`, {}, config),
  
  /**
   * Suspend tenant (admin only)
   */
  suspend: (id: string, reason?: string, config?: ApiClientConfig) =>
    apiClient.post<TenantApiResponse<Tenant>>(`/tenants/${id}/suspend`, { reason }, config),
};

// =============================================================================
// Legacy API Compatibility
// =============================================================================

/**
 * @deprecated Use tenantService directly
 */
export const tenantApi = {
  getAll: tenantService.getAll,
  getById: tenantService.getById,
  getBySubdomain: tenantService.getBySubdomain,
  create: tenantService.create,
  checkSubdomain: tenantService.checkSubdomain,
};
