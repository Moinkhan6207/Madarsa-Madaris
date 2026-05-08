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

export const studentService = {
  list: (params?: StudentListFilters) =>
    apiClient.get<PaginatedStudentsResponse>('/tenant/students', { params }),

  getById: (id: string) =>
    apiClient.get<{ student: Student }>(`/tenant/students/${id}`),

  create: (data: CreateStudentPayload) =>
    apiClient.post<{ student: Student }>('/tenant/students', data),

  update: (id: string, data: UpdateStudentPayload) =>
    apiClient.put<{ student: Student }>(`/tenant/students/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/tenant/students/${id}`),

  changeStatus: (id: string, data: ChangeStatusPayload) =>
    apiClient.patch<{ student: Student }>(`/tenant/students/${id}/status`, data),

  addGuardian: (studentId: string, data: GuardianInput) =>
    apiClient.post<{ guardian: StudentGuardian }>(`/tenant/students/${studentId}/guardians`, data),

  updateGuardian: (guardianId: string, data: UpdateGuardianPayload) =>
    apiClient.put<{ guardian: StudentGuardian }>(`/tenant/guardians/${guardianId}`, data),

  deleteGuardian: (guardianId: string) =>
    apiClient.delete<{ message: string }>(`/tenant/guardians/${guardianId}`),

  createSponsor: (data: CreateSponsorPayload) =>
    apiClient.post<{ sponsor: Sponsor }>('/tenant/sponsors', data),

  mapSponsor: (studentId: string, data: SponsorMappingInput) =>
    apiClient.post<{ mapping: StudentSponsorMapping }>(`/tenant/students/${studentId}/sponsors`, data),

  unlinkSponsor: (studentId: string, sponsorId: string) =>
    apiClient.delete<{ message: string }>(`/tenant/students/${studentId}/sponsors/${sponsorId}`),

  getHistory: (studentId: string) =>
    apiClient.get<{ history: StudentHistory[] }>(`/tenant/students/${studentId}/history`),
};
