'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../services/studentService';
import type { StudentListFilters, CreateStudentPayload, UpdateStudentPayload, ChangeStatusPayload, GuardianInput, UpdateGuardianPayload, SponsorMappingInput, CreateSponsorPayload } from '../types/student';

const STUDENTS_KEY = 'students';
const STUDENT_DETAIL_KEY = 'student';

export function useStudents(filters?: StudentListFilters) {
  return useQuery({
    queryKey: [STUDENTS_KEY, filters],
    queryFn: async () => {
      return await studentService.list(filters);
    },
    staleTime: 30 * 1000,
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: [STUDENT_DETAIL_KEY, id],
    queryFn: async () => {
      const res = await studentService.getById(id);
      return res.student;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateStudentPayload) => {
      return await studentService.create(data);
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
      return await studentService.update(id, data);
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
      return await studentService.changeStatus(id, data);
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
      return await studentService.addGuardian(studentId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENT_DETAIL_KEY, studentId] });
    },
  });
}

export function useUpdateGuardian(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ guardianId, data }: { guardianId: string; data: UpdateGuardianPayload }) => {
      return await studentService.updateGuardian(guardianId, data);
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

export function useCreateSponsor() {
  return useMutation({
    mutationFn: async (data: CreateSponsorPayload) => {
      return await studentService.createSponsor(data);
    },
  });
}

export function useMapSponsor(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SponsorMappingInput) => {
      return await studentService.mapSponsor(studentId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDENT_DETAIL_KEY, studentId] });
      queryClient.invalidateQueries({ queryKey: [STUDENTS_KEY] });
    },
  });
}

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
      return res.history;
    },
    enabled: !!studentId,
    staleTime: 30 * 1000,
  });
}
