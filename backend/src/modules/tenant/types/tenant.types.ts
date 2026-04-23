import { Tenant, InstitutionProfile, TenantSettings, TenantBranding } from '@prisma/client';

// =============================================================================
// Tenant Entity Types
// =============================================================================

export interface TenantWithRelations extends Tenant {
  institutionProfile?: InstitutionProfile | null;
  settings?: TenantSettings | null;
  branding?: TenantBranding | null;
}

// =============================================================================
// Tenant Response Types
// =============================================================================

export interface TenantResponse {
  id: string;
  subdomain: string;
  name: string;
  status: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantDetailResponse extends TenantResponse {
  institutionProfile?: {
    institutionType: string;
    establishedYear: number | null;
    description: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
  } | null;
  settings?: {
    timezone: string;
    dateFormat: string;
    language: string;
    currency: string;
  } | null;
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl: string | null;
  } | null;
}

// =============================================================================
// Tenant Query Types
// =============================================================================

export interface TenantQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// =============================================================================
// Tenant Context Type (exported from middleware)
// =============================================================================

export interface TenantContext {
  tenantId: string;
  subdomain: string;
  isActive: boolean;
  features: string[];
}
