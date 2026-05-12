import { api } from '@/services/api';
import type {
  CreateStudentPayload,
  UpdateStudentPayload,
  ChangeStatusPayload,
  GuardianInput,
  UpdateGuardianPayload,
  CreateSponsorPayload,
  SponsorMappingInput,
  StudentListFilters,
  PaginatedStudentsResponse,
  Student,
  StudentGuardian,
  Sponsor,
  StudentSponsorMapping,
  StudentHistory,
  StudentDocument,
} from '../types';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  timestamp?: string;
}

interface PaginatedEnvelope<T> {
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

export const studentService = {
  list: async (params?: StudentListFilters) => {
    const res = await api.get<ApiEnvelope<PaginatedEnvelope<Student>>>('/tenant/students', { params });
    return {
      data: {
        students: res.data.data.data,
        total: res.data.data.pagination.total,
        page: res.data.data.pagination.page,
        limit: res.data.data.pagination.limit,
        totalPages: res.data.data.pagination.totalPages,
      },
    };
  },

  getById: async (id: string) => {
    const res = await api.get<ApiEnvelope<Student>>(`/tenant/students/${id}`);
    return { data: { student: res.data.data } };
  },

  create: async (data: CreateStudentPayload) => {
    const res = await api.post<ApiEnvelope<Student>>('/tenant/students', data);
    return { data: { student: res.data.data } };
  },

  update: async (id: string, data: UpdateStudentPayload) => {
    const res = await api.put<ApiEnvelope<Student>>(`/tenant/students/${id}`, data);
    return { data: { student: res.data.data } };
  },

  delete: (id: string) => api.delete<void>(`/tenant/students/${id}`),

  changeStatus: async (id: string, data: ChangeStatusPayload) => {
    const res = await api.patch<ApiEnvelope<Student>>(`/tenant/students/${id}/status`, data);
    return { data: { student: res.data.data } };
  },

  addGuardian: async (studentId: string, data: GuardianInput) => {
    const res = await api.post<ApiEnvelope<StudentGuardian>>(`/tenant/students/${studentId}/guardians`, data);
    return { data: { guardian: res.data.data } };
  },

  updateGuardian: async (guardianId: string, data: UpdateGuardianPayload) => {
    const res = await api.put<ApiEnvelope<StudentGuardian>>(`/tenant/guardians/${guardianId}`, data);
    return { data: { guardian: res.data.data } };
  },

  deleteGuardian: (guardianId: string) => api.delete<void>(`/tenant/guardians/${guardianId}`),

  createSponsor: async (data: CreateSponsorPayload) => {
    const res = await api.post<ApiEnvelope<Sponsor>>('/tenant/sponsors', data);
    return { data: { sponsor: res.data.data } };
  },

  listSponsors: async () => {
    const res = await api.get<ApiEnvelope<Sponsor[]>>('/tenant/sponsors');
    return { data: { sponsors: res.data.data } };
  },

  mapSponsor: async (studentId: string, data: SponsorMappingInput) => {
    const res = await api.post<ApiEnvelope<StudentSponsorMapping>>(`/tenant/students/${studentId}/sponsors`, data);
    return { data: { mapping: res.data.data } };
  },

  unlinkSponsor: (studentId: string, sponsorId: string) =>
    api.delete<void>(`/tenant/students/${studentId}/sponsors/${sponsorId}`),

  getHistory: async (studentId: string) => {
    const res = await api.get<ApiEnvelope<StudentHistory[]>>(`/tenant/students/${studentId}/history`);
    return { data: { history: res.data.data } };
  },

  addDocument: async (studentId: string, data: { documentUrl: string; documentType: string; title?: string; notes?: string }) => {
    const res = await api.post<ApiEnvelope<StudentDocument>>(`/tenant/students/${studentId}/documents`, data);
    return { data: { document: res.data.data } };
  },

  deleteDocument: (studentId: string, documentId: string) =>
    api.delete<void>(`/tenant/students/${studentId}/documents/${documentId}`),
};
