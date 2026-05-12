import {
  Prisma,
  PrismaClient,
  Sponsor,
  Student,
  StudentGuardian,
  StudentHistoryEvent,
  StudentSponsor,
} from '@prisma/client';
import { StudentListQuery } from '../types/student.types';

type PrismaDbClient = PrismaClient | Prisma.TransactionClient;

const studentDetailInclude = {
  branch: true,
  academicSession: true,
  guardians: {
    where: {
      deletedAt: null,
    },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  },
  sponsors: {
    where: {
      deletedAt: null,
    },
    include: {
      sponsor: true,
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
  documents: {
    where: {
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
  history: {
    orderBy: {
      changedAt: 'desc' as const,
    },
    take: 100,
  },
} satisfies Prisma.StudentInclude;

export class StudentRepository {
  constructor(private readonly prisma: PrismaDbClient) {}

  async findBranchById(tenantId: string, branchId: string) {
    return this.prisma.branch.findFirst({
      where: {
        id: branchId,
        tenantId,
        deletedAt: null,
      },
    });
  }

  async findAcademicSessionById(tenantId: string, academicSessionId: string) {
    return this.prisma.academicSession.findFirst({
      where: {
        id: academicSessionId,
        tenantId,
        deletedAt: null,
      },
    });
  }

  async getLatestAdmissionNumber(tenantId: string) {
    const latestStudent = await this.prisma.student.findFirst({
      where: {
        tenantId,
        deletedAt: null,
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
        {
          admissionNumber: 'desc',
        },
      ],
      select: {
        admissionNumber: true,
      },
    });

    return latestStudent?.admissionNumber;
  }

  async createStudent(data: Prisma.StudentUncheckedCreateInput) {
    return this.prisma.student.create({
      data,
    });
  }

  async createGuardians(data: Prisma.StudentGuardianUncheckedCreateInput[]) {
    if (!data.length) {
      return;
    }

    await this.prisma.studentGuardian.createMany({
      data,
    });
  }

  async createStudentSponsors(data: Prisma.StudentSponsorUncheckedCreateInput[]) {
    if (!data.length) {
      return;
    }

    await this.prisma.studentSponsor.createMany({
      data,
    });
  }

  async findStudentById(tenantId: string, id: string) {
    return this.prisma.student.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
      include: studentDetailInclude,
    });
  }

  async findStudentBaseById(tenantId: string, id: string) {
    return this.prisma.student.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
    });
  }

  async listStudents(tenantId: string, query: StudentListQuery) {
    const where = this.buildStudentListWhere(tenantId, query);
    const orderBy = this.buildOrderBy(query);
    const skip = (query.page - 1) * query.limit;

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: query.limit,
        orderBy,
        include: {
          branch: true,
          guardians: {
            where: {
              deletedAt: null,
              isPrimary: true,
            },
            take: 1,
          },
          sponsors: {
            where: {
              deletedAt: null,
            },
            include: {
              sponsor: true,
            },
          },
          _count: {
            select: {
              guardians: true,
              sponsors: true,
              history: true,
            },
          },
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return { students, total };
  }

  async updateStudent(id: string, data: Prisma.StudentUncheckedUpdateInput) {
    return this.prisma.student.update({
      where: {
        id,
      },
      data,
    });
  }

  async softDeleteStudent(id: string) {
    return this.prisma.student.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async createHistory(data: Prisma.StudentHistoryUncheckedCreateInput) {
    return this.prisma.studentHistory.create({
      data,
    });
  }

  async createHistoryBatch(data: Prisma.StudentHistoryUncheckedCreateInput[]) {
    if (!data.length) {
      return;
    }

    await this.prisma.studentHistory.createMany({
      data,
    });
  }

  async createAuditLog(data: Prisma.AuditLogUncheckedCreateInput) {
    return this.prisma.auditLog.create({
      data,
    });
  }

  async createAuditLogs(data: Prisma.AuditLogUncheckedCreateInput[]) {
    if (!data.length) {
      return;
    }

    await this.prisma.auditLog.createMany({
      data,
    });
  }

  async findGuardianById(tenantId: string, guardianId: string) {
    return this.prisma.studentGuardian.findFirst({
      where: {
        id: guardianId,
        tenantId,
        deletedAt: null,
      },
      include: {
        student: true,
      },
    });
  }

  async countPrimaryGuardians(studentId: string, excludeGuardianId?: string) {
    return this.prisma.studentGuardian.count({
      where: {
        studentId,
        deletedAt: null,
        isPrimary: true,
        ...(excludeGuardianId
          ? {
              NOT: {
                id: excludeGuardianId,
              },
            }
          : {}),
      },
    });
  }

  async clearPrimaryGuardians(studentId: string, excludeGuardianId?: string) {
    await this.prisma.studentGuardian.updateMany({
      where: {
        studentId,
        deletedAt: null,
        isPrimary: true,
        ...(excludeGuardianId
          ? {
              NOT: {
                id: excludeGuardianId,
              },
            }
          : {}),
      },
      data: {
        isPrimary: false,
      },
    });
  }

  async createGuardian(data: Prisma.StudentGuardianUncheckedCreateInput) {
    return this.prisma.studentGuardian.create({
      data,
    });
  }

  async updateGuardian(id: string, data: Prisma.StudentGuardianUncheckedUpdateInput) {
    return this.prisma.studentGuardian.update({
      where: {
        id,
      },
      data,
    });
  }

  async softDeleteGuardian(id: string) {
    return this.prisma.studentGuardian.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
        isPrimary: false,
      },
    });
  }

  async createSponsor(data: Prisma.SponsorUncheckedCreateInput) {
    return this.prisma.sponsor.create({
      data,
    });
  }

  async listSponsors(tenantId: string) {
    return this.prisma.sponsor.findMany({
      where: {
        tenantId,
        deletedAt: null,
      },
      orderBy: [{ name: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findSponsorById(tenantId: string, sponsorId: string) {
    return this.prisma.sponsor.findFirst({
      where: {
        id: sponsorId,
        tenantId,
        deletedAt: null,
      },
    });
  }

  async findSponsorsByIds(tenantId: string, sponsorIds: string[]) {
    if (!sponsorIds.length) {
      return [];
    }

    return this.prisma.sponsor.findMany({
      where: {
        tenantId,
        id: {
          in: sponsorIds,
        },
        deletedAt: null,
      },
    });
  }

  async findActiveSponsorMapping(tenantId: string, studentId: string, sponsorId: string) {
    return this.prisma.studentSponsor.findFirst({
      where: {
        tenantId,
        studentId,
        sponsorId,
        deletedAt: null,
      },
    });
  }

  async mapSponsorToStudent(data: Prisma.StudentSponsorUncheckedCreateInput) {
    return this.prisma.studentSponsor.create({
      data,
    });
  }

  async getActiveSponsorMappings(studentId: string) {
    return this.prisma.studentSponsor.findMany({
      where: {
        studentId,
        deletedAt: null,
      },
      include: {
        sponsor: true,
      },
    });
  }

  async softDeleteSponsorMapping(id: string) {
    return this.prisma.studentSponsor.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async updateSponsorMapping(id: string, data: Prisma.StudentSponsorUncheckedUpdateInput) {
    return this.prisma.studentSponsor.update({
      where: {
        id,
      },
      data,
    });
  }

  async findSponsorMappingById(tenantId: string, mappingId: string) {
    return this.prisma.studentSponsor.findFirst({
      where: {
        id: mappingId,
        tenantId,
        deletedAt: null,
      },
      include: {
        student: true,
        sponsor: true,
      },
    });
  }

  async softDeleteSponsorMappingsForStudent(
    tenantId: string,
    studentId: string,
    excludeSponsorIds: string[] = []
  ) {
    return this.prisma.studentSponsor.updateMany({
      where: {
        tenantId,
        studentId,
        deletedAt: null,
        ...(excludeSponsorIds.length
          ? {
              sponsorId: {
                notIn: excludeSponsorIds,
              },
            }
          : {}),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async buildStudentCountForTenant(tenantId: string) {
    return this.prisma.student.count({
      where: {
        tenantId,
        deletedAt: null,
      },
    });
  }

  async getStudentHistory(tenantId: string, studentId: string) {
    return this.prisma.studentHistory.findMany({
      where: {
        tenantId,
        studentId,
      },
      orderBy: {
        changedAt: 'desc',
      },
    });
  }

  private buildStudentListWhere(tenantId: string, query: StudentListQuery): Prisma.StudentWhereInput {
    return {
      tenantId,
      deletedAt: null,
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(typeof query.orphan === 'boolean' ? { isOrphan: query.orphan } : {}),
      ...(typeof query.sponsored === 'boolean' ? { isSponsored: query.sponsored } : {}),
      ...(typeof query.needy === 'boolean' ? { isNeedy: query.needy } : {}),
      ...(query.search
        ? {
            OR: [
              {
                fullName: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                admissionNumber: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              ...( /\d/.test(query.search) ? [{
                guardians: {
                  some: {
                    deletedAt: null,
                    phone: {
                      contains: query.search,
                    },
                  },
                },
              }] : []),
            ],
          }
        : {}),
    };
  }

  private buildOrderBy(query: StudentListQuery): Prisma.StudentOrderByWithRelationInput[] {
    const field = query.sortBy;
    const order = query.sortOrder;

    if (field === 'fullName' || field === 'admissionNumber' || field === 'status') {
      return [
        {
          [field]: order,
        },
      ];
    }

    return [
      {
        [field]: order,
      },
      {
        createdAt: 'desc',
      },
    ];
  }

  async createStudentDocument(data: Prisma.StudentDocumentUncheckedCreateInput) {
    return this.prisma.studentDocument.create({
      data,
    });
  }

  async findStudentDocumentById(tenantId: string, documentId: string) {
    return this.prisma.studentDocument.findFirst({
      where: {
        id: documentId,
        tenantId,
        deletedAt: null,
      },
    });
  }

  async softDeleteStudentDocument(documentId: string) {
    return this.prisma.studentDocument.update({
      where: {
        id: documentId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

export type StudentDetailRecord = Prisma.StudentGetPayload<{
  include: typeof studentDetailInclude;
}>;

export type StudentListRecord = Prisma.StudentGetPayload<{
  include: {
    branch: true;
    guardians: true;
    sponsors: {
      include: {
        sponsor: true;
      };
    };
    _count: {
      select: {
        guardians: true;
        sponsors: true;
        history: true;
        documents: true;
      };
    };
  };
}>;

export type StudentGuardianRecord = StudentGuardian;
export type StudentRecord = Student;
export type SponsorRecord = Sponsor;
export type StudentSponsorRecord = StudentSponsor;
export type StudentHistoryPayload = {
  event: StudentHistoryEvent;
  fieldName?: string;
  oldValue?: unknown;
  newValue?: unknown;
  metadata?: Record<string, unknown>;
};
