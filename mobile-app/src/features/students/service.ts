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
} from './types';

export const studentService = {
  list: (params?: StudentListFilters) =>
    api.get<PaginatedStudentsResponse>('/tenant/students', { params }),

  getById: (id: string) =>
    api.get<{ student: Student }>(`/tenant/students/${id}`),

  create: (data: CreateStudentPayload) =>
    api.post<{ student: Student }>('/tenant/students', data),

  update: (id: string, data: UpdateStudentPayload) =>
    api.put<{ student: Student }>(`/tenant/students/${id}`, data),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/tenant/students/${id}`),

  changeStatus: (id: string, data: ChangeStatusPayload) =>
    api.patch<{ student: Student }>(`/tenant/students/${id}/status`, data),

  addGuardian: (studentId: string, data: GuardianInput) =>
    api.post<{ guardian: StudentGuardian }>(`/tenant/students/${studentId}/guardians`, data),

  updateGuardian: (guardianId: string, data: UpdateGuardianPayload) =>
    api.put<{ guardian: StudentGuardian }>(`/tenant/guardians/${guardianId}`, data),

  deleteGuardian: (guardianId: string) =>
    api.delete<{ message: string }>(`/tenant/guardians/${guardianId}`),

  createSponsor: (data: CreateSponsorPayload) =>
    api.post<{ sponsor: Sponsor }>('/tenant/sponsors', data),

  mapSponsor: (studentId: string, data: SponsorMappingInput) =>
    api.post<{ mapping: StudentSponsorMapping }>(`/tenant/students/${studentId}/sponsors`, data),

  unlinkSponsor: (studentId: string, sponsorId: string) =>
    api.delete<{ message: string }>(`/tenant/students/${studentId}/sponsors/${sponsorId}`),

  getHistory: (studentId: string) =>
    api.get<{ history: StudentHistory[] }>(`/tenant/students/${studentId}/history`),
};
