import { apiClient } from '@lib/api';
import type { Branch, AcademicSession } from '../types/student';
import type { Sponsor } from '../types/student';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export const referenceService = {
  getBranches: async (): Promise<Branch[]> => {
    const res = await apiClient.get<ApiEnvelope<any>>('/tenant/branches');
    const payload = res.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  },

  getSessions: async (): Promise<AcademicSession[]> => {
    const res = await apiClient.get<ApiEnvelope<any>>('/tenant/academic-sessions');
    const payload = res.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  },

  getSponsors: async (): Promise<Sponsor[]> => {
    const res = await apiClient.get<ApiEnvelope<any>>('/tenant/sponsors');
    const payload = res.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  },
};
