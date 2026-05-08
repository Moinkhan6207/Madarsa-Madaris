import { StudentHistoryEvent, StudentStatus } from '@prisma/client';
import { AppError } from '../../../common/errors/AppError';
import { StudentService } from '../services/student.service';

const tenantId = 'tenant-1';
const actorUserId = 'user-1';
const branchId = 'branch-1';
const studentId = 'student-1';
const sponsorId = 'sponsor-1';

function createPrismaMock() {
  const state = {
    latestAdmissionNumber: 'ADM-2026-00007',
    student: {
      id: studentId,
      tenantId,
      branchId,
      academicSessionId: null,
      admissionNumber: 'ADM-2026-00008',
      rollNumber: null,
      firstName: 'Abdullah',
      lastName: 'Khan',
      fullName: 'Abdullah Khan',
      status: StudentStatus.LEAD,
      isOrphan: false,
      isNeedy: false,
      isSponsored: false,
      currentProgram: null,
      currentClass: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      branch: { id: branchId, tenantId },
      academicSession: null,
      guardians: [],
      sponsors: [],
      history: [],
    },
    guardians: [] as Array<Record<string, unknown>>,
    mappings: [] as Array<Record<string, unknown>>,
    history: [] as Array<Record<string, unknown>>,
    audits: [] as Array<Record<string, unknown>>,
    listCalls: [] as Array<Record<string, unknown>>,
  };

  const tx = {
    branch: {
      findFirst: jest.fn(async ({ where }) =>
        where.id === branchId && where.tenantId === tenantId ? { id: branchId, tenantId } : null
      ),
    },
    academicSession: {
      findFirst: jest.fn(async () => null),
    },
    sponsor: {
      findMany: jest.fn(async ({ where }) =>
        (where.id.in as string[]).includes(sponsorId) ? [{ id: sponsorId, tenantId }] : []
      ),
      create: jest.fn(async ({ data }) => ({ id: sponsorId, ...data })),
      findFirst: jest.fn(async ({ where }) =>
        where.id === sponsorId && where.tenantId === tenantId ? { id: sponsorId, tenantId } : null
      ),
    },
    student: {
      findFirst: jest.fn(async ({ where, include, orderBy }) => {
        if (orderBy) {
          return state.latestAdmissionNumber
            ? { admissionNumber: state.latestAdmissionNumber }
            : null;
        }

        if (where.id && where.id !== state.student.id) {
          return null;
        }

        if (where.deletedAt === null && include) {
          return {
            ...state.student,
            guardians: state.guardians.filter((guardian) => guardian.deletedAt == null),
            sponsors: state.mappings.filter((mapping) => mapping.deletedAt == null),
            history: state.history,
          };
        }

        return state.student;
      }),
      create: jest.fn(async ({ data }) => {
        state.student = { ...state.student, ...data, id: studentId };
        return state.student;
      }),
      update: jest.fn(async ({ data }) => {
        state.student = { ...state.student, ...data };
        return state.student;
      }),
      findMany: jest.fn(async (args) => {
        state.listCalls.push(args);
        return [state.student];
      }),
      count: jest.fn(async () => 1),
    },
    studentGuardian: {
      createMany: jest.fn(async ({ data }) => {
        state.guardians.push(...data);
      }),
      create: jest.fn(async ({ data }) => {
        const guardian = { id: `guardian-${state.guardians.length + 1}`, ...data };
        state.guardians.push(guardian);
        return guardian;
      }),
      updateMany: jest.fn(async ({ where, data }) => {
        state.guardians = state.guardians.map((guardian) =>
          guardian.studentId === where.studentId && guardian.deletedAt == null
            ? { ...guardian, ...data }
            : guardian
        );
        return { count: 1 };
      }),
      update: jest.fn(async ({ where, data }) => {
        const index = state.guardians.findIndex((guardian) => guardian.id === where.id);
        state.guardians[index] = { ...state.guardians[index], ...data };
        return state.guardians[index];
      }),
      findFirst: jest.fn(async ({ where }) => {
        const guardian = state.guardians.find((item) => item.id === where.id && item.deletedAt == null);
        return guardian ? { ...guardian, student: state.student } : null;
      }),
      count: jest.fn(async ({ where }) =>
        state.guardians.filter(
          (guardian) =>
            guardian.studentId === where.studentId &&
            guardian.isPrimary === true &&
            guardian.deletedAt == null
        ).length
      ),
    },
    studentSponsor: {
      createMany: jest.fn(async ({ data }) => {
        state.mappings.push(...data);
      }),
      create: jest.fn(async ({ data }) => {
        const mapping = { id: `mapping-${state.mappings.length + 1}`, ...data, sponsor: { id: data.sponsorId } };
        state.mappings.push(mapping);
        return mapping;
      }),
      findFirst: jest.fn(async ({ where }) =>
        state.mappings.find(
          (mapping) =>
            mapping.tenantId === where.tenantId &&
            mapping.studentId === where.studentId &&
            mapping.sponsorId === where.sponsorId &&
            mapping.deletedAt == null
        ) ?? null
      ),
      findMany: jest.fn(async ({ where }) =>
        state.mappings.filter((mapping) => mapping.studentId === where.studentId && mapping.deletedAt == null)
      ),
      update: jest.fn(async ({ where, data }) => {
        const index = state.mappings.findIndex((mapping) => mapping.id === where.id);
        state.mappings[index] = { ...state.mappings[index], ...data };
        return state.mappings[index];
      }),
      updateMany: jest.fn(async ({ where, data }) => {
        state.mappings = state.mappings.map((mapping) =>
          mapping.studentId === where.studentId ? { ...mapping, ...data } : mapping
        );
        return { count: 1 };
      }),
    },
    studentHistory: {
      create: jest.fn(async ({ data }) => {
        state.history.push(data);
        return data;
      }),
      createMany: jest.fn(async ({ data }) => {
        state.history.push(...data);
      }),
    },
    auditLog: {
      create: jest.fn(async ({ data }) => {
        state.audits.push(data);
        return data;
      }),
      createMany: jest.fn(async ({ data }) => {
        state.audits.push(...data);
      }),
    },
    tenantStats: {
      upsert: jest.fn(async () => ({})),
    },
  };

  const prisma = {
    ...tx,
    $transaction: jest.fn(async (callback: (trx: typeof tx) => unknown) => callback(tx)),
  };

  return { prisma, state };
}

describe('StudentService integration flows', () => {
  it('creates students with unique admission numbers and audit history', async () => {
    const { prisma, state } = createPrismaMock();
    const service = new StudentService(prisma as any);

    const created = await service.createStudent(tenantId, actorUserId, {
      branchId,
      firstName: 'Abdullah',
      lastName: 'Khan',
      guardians: [
        {
          relation: 'FATHER' as any,
          fullName: 'Parent One',
          phone: '9999999999',
          isPrimary: true,
        },
      ],
    });

    expect(created.admissionNumber).toBe('ADM-2026-00008');
    expect(state.history.some((entry) => entry.event === StudentHistoryEvent.CREATED)).toBe(true);
    expect(state.audits.some((entry) => entry.action === 'STUDENT_CREATED')).toBe(true);
  });

  it('enforces tenant branch isolation during student creation', async () => {
    const { prisma } = createPrismaMock();
    prisma.branch.findFirst.mockResolvedValueOnce(null);
    const service = new StudentService(prisma as any);

    await expect(
      service.createStudent(tenantId, actorUserId, {
        branchId: 'foreign-branch',
        firstName: 'A',
      } as any)
    ).rejects.toBeInstanceOf(AppError);
  });

  it('keeps only one primary guardian', async () => {
    const { prisma, state } = createPrismaMock();
    state.guardians.push({
      id: 'guardian-1',
      tenantId,
      studentId,
      relation: 'FATHER',
      fullName: 'Parent One',
      phone: '9999999999',
      isPrimary: true,
      deletedAt: null,
    });
    const service = new StudentService(prisma as any);

    const guardian = await service.addGuardian(tenantId, actorUserId, studentId, {
      relation: 'MOTHER' as any,
      fullName: 'Parent Two',
      phone: '8888888888',
      isPrimary: true,
    });

    expect(guardian.isPrimary).toBe(true);
    expect(state.guardians.filter((item) => item.isPrimary === true)).toHaveLength(1);
  });

  it('prevents duplicate sponsor mappings and supports unlinking', async () => {
    const { prisma, state } = createPrismaMock();
    state.mappings.push({
      id: 'mapping-1',
      tenantId,
      studentId,
      sponsorId,
      deletedAt: null,
    });
    const service = new StudentService(prisma as any);

    await expect(
      service.mapSponsor(tenantId, actorUserId, studentId, { sponsorId })
    ).rejects.toBeInstanceOf(AppError);

    await service.unlinkSponsor(tenantId, actorUserId, studentId, sponsorId);
    expect(state.mappings[0].deletedAt).toBeInstanceOf(Date);
  });

  it('soft deletes students instead of removing them', async () => {
    const { prisma, state } = createPrismaMock();
    const service = new StudentService(prisma as any);

    await service.deleteStudent(tenantId, actorUserId, studentId);
    expect(state.student.deletedAt).toBeInstanceOf(Date);
  });

  it('builds search and filter queries for list API', async () => {
    const { prisma, state } = createPrismaMock();
    const service = new StudentService(prisma as any);

    await service.listStudents(tenantId, {
      page: 1,
      limit: 20,
      search: '9999',
      branchId,
      status: StudentStatus.LEAD,
      orphan: false,
      sponsored: false,
      needy: false,
      sortBy: 'fullName',
      sortOrder: 'asc',
    });

    const listArgs = state.listCalls[0];
    expect(listArgs.where.tenantId).toBe(tenantId);
    expect(listArgs.where.branchId).toBe(branchId);
    expect(listArgs.where.status).toBe(StudentStatus.LEAD);
    expect(listArgs.where.OR).toHaveLength(3);
  });
});
