// =============================================================================
// Shared Types - Used by both backend and frontend
// =============================================================================

// =============================================================================
// Tenant Types
// =============================================================================

export interface TenantResponse {
  id: string;
  subdomain: string;
  name: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantRequest {
  subdomain: string;
  name: string;
  institutionType?: InstitutionType;
  establishedYear?: number;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminPassword: string;
  planCode?: string;
}

export type InstitutionType = 
  | 'MADRASA'
  | 'ISLAMIC_SCHOOL'
  | 'IDARA'
  | 'DARUL_ULOOM'
  | 'QURAN_CENTER'
  | 'ISLAMIC_CENTER'
  | 'OTHER';

export type TenantStatus = 
  | 'PENDING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'PENDING_DELETION';

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  requestId?: string;
  responseTime?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// =============================================================================
// User Types
// =============================================================================

export type UserType = 
  | 'SYSTEM_ADMIN'
  | 'TENANT_ADMIN'
  | 'PRINCIPAL'
  | 'VICE_PRINCIPAL'
  | 'ADMINISTRATOR'
  | 'TEACHER'
  | 'STUDENT'
  | 'GUARDIAN'
  | 'ACCOUNTANT'
  | 'LIBRARIAN'
  | 'RECEPTIONIST'
  | 'STAFF';

export type UserStatus = 
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'PENDING_VERIFICATION'
  | 'DELETED';

// =============================================================================
// Permission Types
// =============================================================================

export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  module: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: Permission[];
}
