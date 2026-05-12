import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../services';
import type {
  StudentListFilters,
  CreateStudentPayload,
  UpdateStudentPayload,
  ChangeStatusPayload,
  GuardianInput,
  UpdateGuardianPayload,
  SponsorMappingInput,
} from '../types';

const STUDENTS_KEY = 'students';
const STUDENT_DETAIL_KEY = 'student';

export function useStudents(filters?: StudentListFilters) {
  return useQuery({
    queryKey: [STUDENTS_KEY, filters],
    queryFn: async () => {
      const res = await studentService.list(filters);
      return res.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: [STUDENT_DETAIL_KEY, id],
    queryFn: async () => {
      const res = await studentService.getById(id);
      return res.data.student;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateStudentPayload) => {
      const res = await studentService.create(data);
      return res.data.student;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENTS_KEY] });
    },
  });
}

export function useUpdateStudent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateStudentPayload) => {
      const res = await studentService.update(id, data);
      return res.data.student;
    },
    onSuccess: (student) => {
      queryClient.invalidateQueries({ queryKey: [STUDENTS_KEY] });
      queryClient.setQueryData([STUDENT_DETAIL_KEY, id], student);
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studentId: string) => {
      await studentService.delete(studentId);
      return studentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENTS_KEY] });
    },
  });
}

export function useChangeStudentStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ChangeStatusPayload) => {
      const res = await studentService.changeStatus(id, data);
      return res.data.student;
    },
    onSuccess: (student) => {
      queryClient.invalidateQueries({ queryKey: [STUDENTS_KEY] });
      queryClient.setQueryData([STUDENT_DETAIL_KEY, id], student);
    },
  });
}

export function useAddGuardian(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: GuardianInput) => {
      const res = await studentService.addGuardian(studentId, data);
      return res.data.guardian;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENT_DETAIL_KEY, studentId] });
    },
  });
}

export function useUpdateGuardian(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateGuardianPayload }) => {
      const res = await studentService.updateGuardian(id, data);
      return res.data.guardian;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENT_DETAIL_KEY, studentId] });
    },
  });
}

export function useDeleteGuardian(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (guardianId: string) => {
      await studentService.deleteGuardian(guardianId);
      return guardianId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENT_DETAIL_KEY, studentId] });
    },
  });
}

export const useRemoveGuardian = useDeleteGuardian;

export function useMapSponsor(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SponsorMappingInput) => {
      const res = await studentService.mapSponsor(studentId, data);
      return res.data.mapping;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENT_DETAIL_KEY, studentId] });
      queryClient.invalidateQueries({ queryKey: [STUDENTS_KEY] });
    },
  });
}

export const useLinkSponsor = useMapSponsor;

export function useUnlinkSponsor(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sponsorId: string) => {
      await studentService.unlinkSponsor(studentId, sponsorId);
      return sponsorId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENT_DETAIL_KEY, studentId] });
      queryClient.invalidateQueries({ queryKey: [STUDENTS_KEY] });
    },
  });
}

export function useStudentHistory(studentId: string) {
  return useQuery({
    queryKey: [STUDENT_DETAIL_KEY, studentId, 'history'],
    queryFn: async () => {
      const res = await studentService.getHistory(studentId);
      return res.data.history;
    },
    enabled: !!studentId,
    staleTime: 30 * 1000,
  });
}

export function useAddDocument(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { documentUrl: string; documentType: string; title?: string; notes?: string }) => {
      const res = await studentService.addDocument(studentId, data);
      return res.data.document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENT_DETAIL_KEY, studentId] });
    },
  });
}

export function useDeleteDocument(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (documentId: string) => {
      await studentService.deleteDocument(studentId, documentId);
      return documentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENT_DETAIL_KEY, studentId] });
    },
  });
}
