import { api } from '../lib/api';
import type {
  OnboardingProgress,
  InstitutionProfile,
  TenantBranding,
  Branch,
  AcademicSession,
  StepStatus,
} from '../types/onboarding';

// ── Onboarding Progress ────────────────────────────────────────────────────
export const getOnboardingStatus = async (): Promise<OnboardingProgress> => {
  const res = await api.get('/tenant/onboarding');
  return res.data.data;
};

export const updateOnboardingStep = async (stepName: string, status: StepStatus): Promise<OnboardingProgress> => {
  const res = await api.patch('/tenant/onboarding/step', { stepName, status });
  return res.data.data;
};

export const finalizeOnboarding = async (): Promise<{ finalized: boolean }> => {
  const res = await api.post('/tenant/onboarding/finalize');
  return res.data.data;
};

// ── Institution Profile ────────────────────────────────────────────────────
export const getProfile = async (): Promise<InstitutionProfile> => {
  const res = await api.get('/tenant/profile');
  return res.data.data;
};

export const updateProfile = async (data: Partial<InstitutionProfile>): Promise<InstitutionProfile> => {
  const res = await api.put('/tenant/profile', data);
  return res.data.data;
};

// ── Branding ───────────────────────────────────────────────────────────────
export const getBranding = async (): Promise<TenantBranding> => {
  const res = await api.get('/tenant/branding');
  return res.data.data;
};

export const updateBranding = async (data: Partial<TenantBranding>): Promise<TenantBranding> => {
  const res = await api.put('/tenant/branding', data);
  return res.data.data;
};

export const uploadBrandingImage = async (file: File, type: 'logo' | 'cover' | 'favicon'): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await api.post(`/tenant/branding/upload/${type}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data.data;
};

// ── Branches ───────────────────────────────────────────────────────────────
export const getBranches = async (): Promise<Branch[]> => {
  const res = await api.get('/tenant/branches');
  return res.data.data;
};

export const createBranch = async (data: Omit<Branch, 'id' | 'tenantId' | 'status'>): Promise<Branch> => {
  const res = await api.post('/tenant/branches', data);
  return res.data.data;
};

export const updateBranch = async (branchId: string, data: Partial<Branch>): Promise<Branch> => {
  const res = await api.patch(`/tenant/branches/${branchId}`, data);
  return res.data.data;
};

export const deleteBranch = async (branchId: string): Promise<void> => {
  await api.delete(`/tenant/branches/${branchId}`);
};

// ── Academic Sessions ──────────────────────────────────────────────────────
export const getSessions = async (): Promise<AcademicSession[]> => {
  const res = await api.get('/tenant/academic-sessions');
  return res.data.data;
};

export const createSession = async (data: { name: string; startDate: string; endDate: string; isCurrent: boolean }): Promise<AcademicSession> => {
  const res = await api.post('/tenant/academic-sessions', data);
  return res.data.data;
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  await api.delete(`/tenant/academic-sessions/${sessionId}`);
};
