import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStudents, useStudent, useCreateStudent, useUpdateStudent, useDeleteStudent, useChangeStudentStatus, useAddGuardian, useUpdateGuardian, useDeleteGuardian, useMapSponsor, useUnlinkSponsor, useStudentHistory } from '../useStudents';
import { studentService } from '../../services/studentService';

jest.mock('../../services/studentService', () => ({
  studentService: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    changeStatus: jest.fn(),
    addGuardian: jest.fn(),
    updateGuardian: jest.fn(),
    deleteGuardian: jest.fn(),
    mapSponsor: jest.fn(),
    unlinkSponsor: jest.fn(),
    getHistory: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useStudents hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useStudents', () => {
    it('fetches student list', async () => {
      const mockResponse = { students: [{ id: '1', firstName: 'Ali' }], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } };
      (studentService.list as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useStudents({ page: 1 }), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe('useStudent', () => {
    it('fetches a single student', async () => {
      const student = { id: '1', firstName: 'Ali', lastName: 'Khan' };
      (studentService.getById as jest.Mock).mockResolvedValue({ student });

      const { result } = renderHook(() => useStudent('1'), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(student);
    });

    it('does not fetch when id is empty', () => {
      (studentService.getById as jest.Mock).mockResolvedValue({ student: null });

      const { result } = renderHook(() => useStudent(''), { wrapper: createWrapper() });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('useCreateStudent', () => {
    it('creates a student and invalidates list', async () => {
      const student = { id: '1', firstName: 'Ali' };
      (studentService.create as jest.Mock).mockResolvedValue({ student });

      const { result } = renderHook(() => useCreateStudent(), { wrapper: createWrapper() });

      await result.current.mutateAsync({ firstName: 'Ali', lastName: 'Khan', gender: 'MALE', dateOfBirth: '2000-01-01', branchId: 'b1' });

      expect(studentService.create).toHaveBeenCalledWith({ firstName: 'Ali', lastName: 'Khan', gender: 'MALE', dateOfBirth: '2000-01-01', branchId: 'b1' });
    });
  });

  describe('useUpdateStudent', () => {
    it('updates a student', async () => {
      const student = { id: '1', firstName: 'Ali Updated' };
      (studentService.update as jest.Mock).mockResolvedValue({ student });

      const { result } = renderHook(() => useUpdateStudent('1'), { wrapper: createWrapper() });

      await result.current.mutateAsync({ firstName: 'Ali Updated' });

      expect(studentService.update).toHaveBeenCalledWith('1', { firstName: 'Ali Updated' });
    });
  });

  describe('useDeleteStudent', () => {
    it('deletes a student', async () => {
      (studentService.delete as jest.Mock).mockResolvedValue({ message: 'Deleted' });

      const { result } = renderHook(() => useDeleteStudent(), { wrapper: createWrapper() });

      await result.current.mutateAsync('1');

      expect(studentService.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('useChangeStudentStatus', () => {
    it('changes student status', async () => {
      const student = { id: '1', status: 'INACTIVE' };
      (studentService.changeStatus as jest.Mock).mockResolvedValue({ student });

      const { result } = renderHook(() => useChangeStudentStatus('1'), { wrapper: createWrapper() });

      await result.current.mutateAsync({ status: 'DROPPED', reason: 'Test' });

      expect(studentService.changeStatus).toHaveBeenCalledWith('1', { status: 'DROPPED', reason: 'Test' });
    });
  });

  describe('useAddGuardian', () => {
    it('adds a guardian', async () => {
      const guardian = { id: 'g1', relation: 'FATHER', fullName: 'Khan' };
      (studentService.addGuardian as jest.Mock).mockResolvedValue({ guardian });

      const { result } = renderHook(() => useAddGuardian('1'), { wrapper: createWrapper() });

      await result.current.mutateAsync({ relation: 'FATHER', fullName: 'Khan', phone: '123' });

      expect(studentService.addGuardian).toHaveBeenCalledWith('1', { relation: 'FATHER', fullName: 'Khan', phone: '123' });
    });
  });

  describe('useUpdateGuardian', () => {
    it('updates a guardian', async () => {
      const guardian = { id: 'g1', fullName: 'Khan Updated' };
      (studentService.updateGuardian as jest.Mock).mockResolvedValue({ guardian });

      const { result } = renderHook(() => useUpdateGuardian('1'), { wrapper: createWrapper() });

      await result.current.mutateAsync({ guardianId: 'g1', data: { fullName: 'Khan Updated' } });

      expect(studentService.updateGuardian).toHaveBeenCalledWith('g1', { fullName: 'Khan Updated' });
    });
  });

  describe('useDeleteGuardian', () => {
    it('deletes a guardian', async () => {
      (studentService.deleteGuardian as jest.Mock).mockResolvedValue({ message: 'Deleted' });

      const { result } = renderHook(() => useDeleteGuardian('1'), { wrapper: createWrapper() });

      await result.current.mutateAsync('g1');

      expect(studentService.deleteGuardian).toHaveBeenCalledWith('g1');
    });
  });

  describe('useMapSponsor', () => {
    it('maps a sponsor', async () => {
      const mapping = { id: 'm1', sponsorId: 's1' };
      (studentService.mapSponsor as jest.Mock).mockResolvedValue({ mapping });

      const { result } = renderHook(() => useMapSponsor('1'), { wrapper: createWrapper() });

      await result.current.mutateAsync({ sponsorId: 's1', amount: 1000 });

      expect(studentService.mapSponsor).toHaveBeenCalledWith('1', { sponsorId: 's1', amount: 1000 });
    });
  });

  describe('useUnlinkSponsor', () => {
    it('unlinks a sponsor', async () => {
      (studentService.unlinkSponsor as jest.Mock).mockResolvedValue({ message: 'Unlinked' });

      const { result } = renderHook(() => useUnlinkSponsor('1'), { wrapper: createWrapper() });

      await result.current.mutateAsync('s1');

      expect(studentService.unlinkSponsor).toHaveBeenCalledWith('1', 's1');
    });
  });

  describe('useStudentHistory', () => {
    it('fetches student history', async () => {
      const history = [{ id: 'h1', event: 'CREATED' as const, studentId: '1' }];
      (studentService.getHistory as jest.Mock).mockResolvedValue({ history });

      const { result } = renderHook(() => useStudentHistory('1'), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(history);
    });

    it('does not fetch when studentId is empty', () => {
      (studentService.getHistory as jest.Mock).mockResolvedValue({ history: [] });

      const { result } = renderHook(() => useStudentHistory(''), { wrapper: createWrapper() });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.fetchStatus).toBe('idle');
    });
  });
});
