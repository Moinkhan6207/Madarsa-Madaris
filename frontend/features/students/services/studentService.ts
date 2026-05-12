import { apiClient } from '@lib/api';
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
} from '../types/student';

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
  list: async (params?: StudentListFilters): Promise<PaginatedStudentsResponse> => {
    const res = await apiClient.get<ApiEnvelope<PaginatedEnvelope<Student>>>('/tenant/students', { params });
    return {
      students: res.data.data,
      total: res.data.pagination.total,
      page: res.data.pagination.page,
      limit: res.data.pagination.limit,
      totalPages: res.data.pagination.totalPages,
    };
  },

  getById: async (id: string): Promise<Student> => {
    const res = await apiClient.get<ApiEnvelope<Student>>(`/tenant/students/${id}`);
    return res.data;
  },

  create: async (data: CreateStudentPayload): Promise<Student> => {
    const res = await apiClient.post<ApiEnvelope<Student>>('/tenant/students', data);
    return res.data;
  },

  update: async (id: string, data: UpdateStudentPayload): Promise<Student> => {
    const res = await apiClient.put<ApiEnvelope<Student>>(`/tenant/students/${id}`, data);
    return res.data;
  },

  delete: (id: string) => apiClient.delete<void>(`/tenant/students/${id}`),

  changeStatus: async (id: string, data: ChangeStatusPayload): Promise<Student> => {
    const res = await apiClient.patch<ApiEnvelope<Student>>(`/tenant/students/${id}/status`, data);
    return res.data;
  },

  addGuardian: async (studentId: string, data: GuardianInput): Promise<StudentGuardian> => {
    const res = await apiClient.post<ApiEnvelope<StudentGuardian>>(`/tenant/students/${studentId}/guardians`, data);
    return res.data;
  },

  updateGuardian: async (guardianId: string, data: UpdateGuardianPayload): Promise<StudentGuardian> => {
    const res = await apiClient.put<ApiEnvelope<StudentGuardian>>(`/tenant/guardians/${guardianId}`, data);
    return res.data;
  },

  deleteGuardian: (guardianId: string) => apiClient.delete<void>(`/tenant/guardians/${guardianId}`),

  createSponsor: async (data: CreateSponsorPayload): Promise<Sponsor> => {
    const res = await apiClient.post<ApiEnvelope<Sponsor>>('/tenant/sponsors', data);
    return res.data;
  },

  mapSponsor: async (studentId: string, data: SponsorMappingInput): Promise<StudentSponsorMapping> => {
    const res = await apiClient.post<ApiEnvelope<StudentSponsorMapping>>(`/tenant/students/${studentId}/sponsors`, data);
    return res.data;
  },

  unlinkSponsor: (studentId: string, sponsorId: string) =>
    apiClient.delete<void>(`/tenant/students/${studentId}/sponsors/${sponsorId}`),

  getHistory: async (studentId: string): Promise<StudentHistory[]> => {
    const res = await apiClient.get<ApiEnvelope<StudentHistory[]>>(`/tenant/students/${studentId}/history`);
    return res.data;
  },
};
