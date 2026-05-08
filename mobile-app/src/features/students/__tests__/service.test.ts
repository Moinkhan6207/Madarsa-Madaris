import { studentService } from '../service';
import { api } from '@/services/api';

jest.mock('@/services/api', () => ({
  api: {
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
      (api.get as jest.Mock).mockResolvedValue({ data: { students: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } } });
      await studentService.list({ page: 1, limit: 20 });
      expect(api.get).toHaveBeenCalledWith('/tenant/students', { params: { page: 1, limit: 20 } });
    });
  });

  describe('getById', () => {
    it('calls GET /tenant/students/:id', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { student: { id: '1' } } });
      await studentService.getById('1');
      expect(api.get).toHaveBeenCalledWith('/tenant/students/1');
    });
  });

  describe('create', () => {
    it('calls POST /tenant/students with data', async () => {
      (api.post as jest.Mock).mockResolvedValue({ data: { student: { id: '1' } } });
      await studentService.create({ firstName: 'Ali', lastName: 'Khan', gender: 'MALE', dateOfBirth: '2000-01-01', branchId: 'b1' });
      expect(api.post).toHaveBeenCalledWith('/tenant/students', { firstName: 'Ali', lastName: 'Khan', gender: 'MALE', dateOfBirth: '2000-01-01', branchId: 'b1' });
    });
  });

  describe('update', () => {
    it('calls PUT /tenant/students/:id with data', async () => {
      (api.put as jest.Mock).mockResolvedValue({ data: { student: { id: '1' } } });
      await studentService.update('1', { firstName: 'Ali Updated' });
      expect(api.put).toHaveBeenCalledWith('/tenant/students/1', { firstName: 'Ali Updated' });
    });
  });

  describe('delete', () => {
    it('calls DELETE /tenant/students/:id', async () => {
      (api.delete as jest.Mock).mockResolvedValue({ data: { message: 'Deleted' } });
      await studentService.delete('1');
      expect(api.delete).toHaveBeenCalledWith('/tenant/students/1');
    });
  });

  describe('changeStatus', () => {
    it('calls PATCH /tenant/students/:id/status with data', async () => {
      (api.patch as jest.Mock).mockResolvedValue({ data: { student: { id: '1' } } });
      await studentService.changeStatus('1', { status: 'ACTIVE', reason: 'Test' });
      expect(api.patch).toHaveBeenCalledWith('/tenant/students/1/status', { status: 'ACTIVE', reason: 'Test' });
    });
  });

  describe('addGuardian', () => {
    it('calls POST /tenant/students/:studentId/guardians', async () => {
      (api.post as jest.Mock).mockResolvedValue({ data: { guardian: { id: 'g1' } } });
      await studentService.addGuardian('1', { relation: 'FATHER', fullName: 'Khan', phone: '123' });
      expect(api.post).toHaveBeenCalledWith('/tenant/students/1/guardians', { relation: 'FATHER', fullName: 'Khan', phone: '123' });
    });
  });

  describe('updateGuardian', () => {
    it('calls PUT /tenant/guardians/:guardianId', async () => {
      (api.put as jest.Mock).mockResolvedValue({ data: { guardian: { id: 'g1' } } });
      await studentService.updateGuardian('g1', { fullName: 'Khan Updated' });
      expect(api.put).toHaveBeenCalledWith('/tenant/guardians/g1', { fullName: 'Khan Updated' });
    });
  });

  describe('deleteGuardian', () => {
    it('calls DELETE /tenant/guardians/:guardianId', async () => {
      (api.delete as jest.Mock).mockResolvedValue({ data: { message: 'Deleted' } });
      await studentService.deleteGuardian('g1');
      expect(api.delete).toHaveBeenCalledWith('/tenant/guardians/g1');
    });
  });

  describe('mapSponsor', () => {
    it('calls POST /tenant/students/:studentId/sponsors', async () => {
      (api.post as jest.Mock).mockResolvedValue({ data: { mapping: { id: 'm1' } } });
      await studentService.mapSponsor('1', { sponsorId: 's1', amount: 1000 });
      expect(api.post).toHaveBeenCalledWith('/tenant/students/1/sponsors', { sponsorId: 's1', amount: 1000 });
    });
  });

  describe('unlinkSponsor', () => {
    it('calls DELETE /tenant/students/:studentId/sponsors/:sponsorId', async () => {
      (api.delete as jest.Mock).mockResolvedValue({ data: { message: 'Unlinked' } });
      await studentService.unlinkSponsor('1', 's1');
      expect(api.delete).toHaveBeenCalledWith('/tenant/students/1/sponsors/s1');
    });
  });

  describe('getHistory', () => {
    it('calls GET /tenant/students/:studentId/history', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { history: [] } });
      await studentService.getHistory('1');
      expect(api.get).toHaveBeenCalledWith('/tenant/students/1/history');
    });
  });
});
