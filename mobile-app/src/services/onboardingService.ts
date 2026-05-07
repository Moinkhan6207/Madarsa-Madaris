import { api } from '@/services/api';
import type {
  OnboardingProgress,
  InstitutionProfile,
  TenantBranding,
  Branch,
  AcademicSession,
  StepStatus,
} from '@/types/onboarding';

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

export const getProfile = async (): Promise<InstitutionProfile> => {
  const res = await api.get('/tenant/profile');
  return res.data.data;
};

export const updateProfile = async (data: Partial<InstitutionProfile>): Promise<InstitutionProfile> => {
  const res = await api.put('/tenant/profile', data);
  return res.data.data;
};

export const getBranding = async (): Promise<TenantBranding> => {
  const res = await api.get('/tenant/branding');
  return res.data.data;
};

export const updateBranding = async (data: Partial<TenantBranding>): Promise<TenantBranding> => {
  const res = await api.put('/tenant/branding', data);
  return res.data.data;
};

export const uploadBrandingImage = async (type: 'logo' | 'cover' | 'favicon', uri: string): Promise<{ url: string }> => {
  const formData = new FormData();
  const filename = uri.split('/').pop() || 'image.jpg';
  const match = /\.([^.]+)$/.exec(filename);
  const ext = match ? match[1] : 'jpg';
  const mimeType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';

  formData.append('file', {
    uri,
    name: filename,
    type: mimeType,
  } as any);

  const res = await api.post(`/tenant/branding/upload/${type}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
};

export const getBranches = async (): Promise<Branch[]> => {
  const res = await api.get('/tenant/branches');
  const payload = res.data.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
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

export const getSessions = async (): Promise<AcademicSession[]> => {
  const res = await api.get('/tenant/academic-sessions');
  const payload = res.data.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const createSession = async (data: { name: string; startDate: string; endDate: string; isCurrent: boolean }): Promise<AcademicSession> => {
  const res = await api.post('/tenant/academic-sessions', data);
  return res.data.data;
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  await api.delete(`/tenant/academic-sessions/${sessionId}`);
};
