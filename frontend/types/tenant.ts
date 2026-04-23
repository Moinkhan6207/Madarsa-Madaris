export enum TenantStatus {
  DRAFT = 'DRAFT',
  PENDING_ACTIVATION = 'PENDING_ACTIVATION',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

export interface Tenant {
  id: string;
  slug: string;
  displayName: string;
  legalName: string | null;
  institutionType: string;
  primaryEmail: string;
  primaryPhone: string | null;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TenantListResponse {
  tenants: Tenant[];
  total: number;
  page: number;
  limit: number;
}
