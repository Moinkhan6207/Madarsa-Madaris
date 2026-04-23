// ─── Shared types ─────────────────────────────────────────────────────────────

export type StepStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';

export interface OnboardingProgress {
  id: string;
  tenantId: string;
  accountStep: StepStatus;
  profileStep: StepStatus;
  brandingStep: StepStatus;
  branchStep: StepStatus;
  sessionStep: StepStatus;
  adminStep: StepStatus;
  finalizationStep: StepStatus;
  completedAt: string | null;
}

export interface InstitutionProfile {
  id: string;
  tenantId: string;
  shortName: string | null;
  trustName: string | null;
  registrationNumber: string | null;
  email: string | null;
  phone: string | null;
  alternatePhone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  websiteUrl: string | null;
  establishedYear: number | null;
  principalName: string | null;
  description: string | null;
  divisionType: 'MALE' | 'FEMALE' | 'BOTH';
  hasHostel: boolean;
  hasTransport: boolean;
  hasMasjidLinkedOps: boolean;
  hasMultiBranch: boolean;
}

export interface TenantBranding {
  id: string;
  tenantId: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  tagline: string | null;
  publicContactEmail: string | null;
  publicContactPhone: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  whatsappNumber: string | null;
}

export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  code: string | null;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  headName: string | null;
  isPrimary: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AcademicSession {
  id: string;
  tenantId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}
