export interface User {
  id: string;
  fullName: string;
  email: string;
  tenantId: string | null;
  tenantSlug?: string;
  tenantStatus?: string;
  roles: string[];
  permissions: string[];
}

export interface LoginResponse {
  user: User;
  token: string;
}
