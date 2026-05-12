import { studentService } from '../studentService';
import { apiClient } from '@lib/api';

jest.mock('@lib/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('studentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('calls GET /tenant/students with params', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } } });
      await studentService.list({ page: 1, limit: 20, status: 'ACTIVE' });
      expect(apiClient.get).toHaveBeenCalledWith('/tenant/students', { params: { page: 1, limit: 20, status: 'ACTIVE' } });
    });

    it('calls GET /tenant/students without params', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } } });
      await studentService.list();
      expect(apiClient.get).toHaveBeenCalledWith('/tenant/students', { params: undefined });
    });
  });

  describe('getById', () => {
    it('calls GET /tenant/students/:id', async () => {
      const student = { id: '1', firstName: 'Ali', lastName: 'Khan', status: 'ACTIVE' };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: student });
      await studentService.getById('1');
      expect(apiClient.get).toHaveBeenCalledWith('/tenant/students/1');
    });
  });

  describe('create', () => {
    it('calls POST /tenant/students with data', async () => {
      const payload = { firstName: 'Ali', lastName: 'Khan', gender: 'male', dateOfBirth: '2000-01-01', branchId: 'branch-1' };
      const student = { id: '1', ...payload };
      (apiClient.post as jest.Mock).mockResolvedValue({ data: student });
      await studentService.create(payload);
      expect(apiClient.post).toHaveBeenCalledWith('/tenant/students', payload);
    });
  });

  describe('update', () => {
    it('calls PUT /tenant/students/:id with data', async () => {
      const payload = { firstName: 'Ali Updated' };
      const student = { id: '1', firstName: 'Ali Updated', lastName: 'Khan' };
      (apiClient.put as jest.Mock).mockResolvedValue({ data: student });
      await studentService.update('1', payload);
      expect(apiClient.put).toHaveBeenCalledWith('/tenant/students/1', payload);
    });
  });

  describe('delete', () => {
    it('calls DELETE /tenant/students/:id', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({ data: { message: 'Deleted' } });
      await studentService.delete('1');
      expect(apiClient.delete).toHaveBeenCalledWith('/tenant/students/1');
    });
  });

  describe('changeStatus', () => {
    it('calls PATCH /tenant/students/:id/status with data', async () => {
      const payload = { status: 'DROPPED' as const, notes: 'Graduated' };
      const student = { id: '1', status: 'DROPPED' };
      (apiClient.patch as jest.Mock).mockResolvedValue({ data: student });
      await studentService.changeStatus('1', payload);
      expect(apiClient.patch).toHaveBeenCalledWith('/tenant/students/1/status', payload);
    });
  });

  describe('addGuardian', () => {
    it('calls POST /tenant/students/:studentId/guardians', async () => {
      const payload = { relation: 'FATHER' as const, fullName: 'Khan', phone: '1234567890' };
      (apiClient.post as jest.Mock).mockResolvedValue({ data: { id: 'g1', ...payload } });
      await studentService.addGuardian('1', payload);
      expect(apiClient.post).toHaveBeenCalledWith('/tenant/students/1/guardians', payload);
    });
  });

  describe('updateGuardian', () => {
    it('calls PUT /tenant/guardians/:guardianId', async () => {
      const payload = { fullName: 'Khan Updated' };
      (apiClient.put as jest.Mock).mockResolvedValue({ data: { id: 'g1', ...payload } });
      await studentService.updateGuardian('g1', payload);
      expect(apiClient.put).toHaveBeenCalledWith('/tenant/guardians/g1', payload);
    });
  });

  describe('deleteGuardian', () => {
    it('calls DELETE /tenant/guardians/:guardianId', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({ data: { message: 'Deleted' } });
      await studentService.deleteGuardian('g1');
      expect(apiClient.delete).toHaveBeenCalledWith('/tenant/guardians/g1');
    });
  });

  describe('mapSponsor', () => {
    it('calls POST /tenant/students/:studentId/sponsors', async () => {
      const payload = { sponsorId: 's1', amount: 1000, currencyCode: 'INR' };
      (apiClient.post as jest.Mock).mockResolvedValue({ data: { id: 'm1', ...payload } });
      await studentService.mapSponsor('1', payload);
      expect(apiClient.post).toHaveBeenCalledWith('/tenant/students/1/sponsors', payload);
    });
  });

  describe('unlinkSponsor', () => {
    it('calls DELETE /tenant/students/:studentId/sponsors/:sponsorId', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({ data: { message: 'Unlinked' } });
      await studentService.unlinkSponsor('1', 's1');
      expect(apiClient.delete).toHaveBeenCalledWith('/tenant/students/1/sponsors/s1');
    });
  });

  describe('getHistory', () => {
    it('calls GET /tenant/students/:studentId/history', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });
      await studentService.getHistory('1');
      expect(apiClient.get).toHaveBeenCalledWith('/tenant/students/1/history');
    });
  });
});
