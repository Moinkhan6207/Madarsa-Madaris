import {
  Prisma,
  PrismaClient,
  StudentHistoryEvent,
  StudentStatus,
} from '@prisma/client';
import { AppError } from '../../../common/errors/AppError';
import { createPaginationResult } from '../../../common/utils/pagination';
import { CmsValidationService } from '../../cms/services/cms-validation.service';
import { TenantStatsService } from '../../tenant/services/tenant-stats.service';
import { StudentRepository } from '../repositories/student.repository';
import { ChangeStudentStatusInput, CreateStudentInput, GuardianInput, SponsorMappingInput, StudentListQuery, UpdateStudentInput } from '../types/student.types';
import { StudentAuditService } from './student-audit.service';
import { StudentLifecycleService } from './student-lifecycle.service';

export class StudentService {
  private readonly lifecycleService = new StudentLifecycleService();
  private readonly statsService: TenantStatsService;

  constructor(private readonly prisma: PrismaClient) {
    this.statsService = new TenantStatsService(prisma);
  }

  async createStudent(tenantId: string, actorUserId: string, input: CreateStudentInput) {
    if (input.status && input.status !== StudentStatus.LEAD) {
      throw new AppError(
        'Students must start in LEAD status. Use the status transition API after creation.',
        400,
        'INVALID_INITIAL_STUDENT_STATUS'
      );
    }

    const sanitized = this.sanitizePayload(input) as CreateStudentInput;
    this.ensureSinglePrimaryGuardian(sanitized.guardians);

    const maxAttempts = 3;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const student = await this.prisma.$transaction(async (tx) => {
          const repository = new StudentRepository(tx);
          const auditService = new StudentAuditService(tx);

          await this.assertBranchOwnership(repository, tenantId, sanitized.branchId);
          if (sanitized.academicSessionId) {
            await this.assertSessionOwnership(repository, tenantId, sanitized.academicSessionId);
          }

          const sponsorIds = sanitized.sponsorMappings?.map((mapping) => mapping.sponsorId) ?? [];
          await this.assertSponsorOwnership(repository, tenantId, sponsorIds);

          const admissionNumber = await this.generateAdmissionNumber(repository, tenantId);
          const studentRecord = await repository.createStudent({
            tenantId,
            branchId: sanitized.branchId,
            academicSessionId: sanitized.academicSessionId,
            admissionNumber,
            rollNumber: sanitized.rollNumber,
            firstName: sanitized.firstName,
            lastName: sanitized.lastName,
            fullName: this.buildFullName(sanitized.firstName, sanitized.lastName),
            arabicName: sanitized.arabicName,
            gender: sanitized.gender,
            dateOfBirth: this.toDate(sanitized.dateOfBirth),
            bloodGroup: sanitized.bloodGroup,
            admissionDate: this.toDate(sanitized.admissionDate) ?? new Date(),
            phone: sanitized.phone,
            email: sanitized.email,
            identityNumber: sanitized.identityNumber,
            addressLine1: sanitized.addressLine1,
            addressLine2: sanitized.addressLine2,
            city: sanitized.city,
            state: sanitized.state,
            country: sanitized.country,
            postalCode: sanitized.postalCode,
            status: StudentStatus.LEAD,
            isOrphan: sanitized.isOrphan ?? false,
            isNeedy: sanitized.isNeedy ?? false,
            isSponsored: Boolean(sanitized.sponsorMappings?.length),
            currentProgram: sanitized.currentProgram,
            currentClass: sanitized.currentClass,
            currentSection: sanitized.currentSection,
            leadSource: sanitized.leadSource,
            photoUrl: sanitized.photoUrl,
            notes: sanitized.notes,
          });

          await repository.createGuardians(
            (sanitized.guardians ?? []).map((guardian) => ({
              tenantId,
              studentId: studentRecord.id,
              relation: guardian.relation,
              fullName: guardian.fullName,
              phone: guardian.phone,
              alternatePhone: guardian.alternatePhone,
              email: guardian.email,
              occupation: guardian.occupation,
              addressLine1: guardian.addressLine1,
              addressLine2: guardian.addressLine2,
              city: guardian.city,
              state: guardian.state,
              country: guardian.country,
              postalCode: guardian.postalCode,
              isPrimary: guardian.isPrimary ?? false,
              notes: guardian.notes,
            }))
          );

          await repository.createStudentSponsors(
            (sanitized.sponsorMappings ?? []).map((mapping) => ({
              tenantId,
              studentId: studentRecord.id,
              sponsorId: mapping.sponsorId,
              supportLabel: mapping.supportLabel,
              amount: this.toDecimal(mapping.amount),
              currencyCode: mapping.currencyCode ?? 'INR',
              startDate: this.toDate(mapping.startDate),
              endDate: this.toDate(mapping.endDate),
              notes: mapping.notes,
            }))
          );

          await auditService.logHistory({
            tenantId,
            studentId: studentRecord.id,
            event: StudentHistoryEvent.CREATED,
            changedBy: actorUserId,
            newValue: {
              admissionNumber,
              status: StudentStatus.LEAD,
            },
          });

          await auditService.logAudit(
            tenantId,
            actorUserId,
            'Student',
            studentRecord.id,
            'STUDENT_CREATED',
            undefined,
            {
              admissionNumber,
              status: StudentStatus.LEAD,
              branchId: studentRecord.branchId,
            }
          );

          await tx.tenantStats.upsert({
            where: { tenantId },
            create: {
              tenantId,
              totalStudents: 1,
              lastUpdatedAt: new Date(),
            },
            update: {
              totalStudents: { increment: 1 },
              lastUpdatedAt: new Date(),
            },
          });

          return repository.findStudentById(tenantId, studentRecord.id);
        }, { maxWait: 15000, timeout: 30000 });

        await this.statsService.clearCache(tenantId);
        if (!student) {
          throw new AppError('Student creation failed', 500, 'STUDENT_CREATION_FAILED');
        }

        return student;
      } catch (error) {
        if (this.isUniqueAdmissionConflict(error) && attempt < maxAttempts - 1) {
          continue;
        }

        throw error;
      }
    }

    throw new AppError('Student creation failed after retrying admission number generation', 500, 'STUDENT_CREATION_FAILED');
  }

  async listStudents(tenantId: string, query: StudentListQuery) {
    if (query.branchId) {
      const repository = new StudentRepository(this.prisma);
      await this.assertBranchOwnership(repository, tenantId, query.branchId);
    }

    const repository = new StudentRepository(this.prisma);
    const result = await repository.listStudents(tenantId, query);
    return createPaginationResult(result.students, result.total, query.page, query.limit);
  }

  async getStudentById(tenantId: string, id: string) {
    const repository = new StudentRepository(this.prisma);
    const student = await repository.findStudentById(tenantId, id);
    if (!student) {
      throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
    }

    return student;
  }

  async getStudentHistory(tenantId: string, id: string) {
    const repository = new StudentRepository(this.prisma);
    const student = await repository.findStudentBaseById(tenantId, id);

    if (!student) {
      throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
    }

    return repository.getStudentHistory(tenantId, id);
  }

  async updateStudent(tenantId: string, actorUserId: string, id: string, input: UpdateStudentInput) {
    const sanitized = this.sanitizePayload(input) as UpdateStudentInput;
    this.ensureNoDirectStatusMutation(sanitized);
    this.ensureSinglePrimaryGuardian(sanitized.guardians);

    const updatedStudent = await this.prisma.$transaction(async (tx) => {
      const repository = new StudentRepository(tx);
      const auditService = new StudentAuditService(tx);
      const currentStudent = await repository.findStudentById(tenantId, id);

      if (!currentStudent) {
        throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
      }

      if (sanitized.branchId && sanitized.branchId !== currentStudent.branchId) {
        await this.assertBranchOwnership(repository, tenantId, sanitized.branchId);
      }

      if (sanitized.academicSessionId && sanitized.academicSessionId !== currentStudent.academicSessionId) {
        await this.assertSessionOwnership(repository, tenantId, sanitized.academicSessionId);
      }

      if (sanitized.sponsorMappings) {
        await this.assertSponsorOwnership(
          repository,
          tenantId,
          sanitized.sponsorMappings.map((mapping) => mapping.sponsorId)
        );
      }

      const updateData: Prisma.StudentUncheckedUpdateInput = {
        ...(sanitized.branchId ? { branchId: sanitized.branchId } : {}),
        ...(typeof sanitized.academicSessionId !== 'undefined'
          ? { academicSessionId: sanitized.academicSessionId }
          : {}),
        ...(typeof sanitized.rollNumber !== 'undefined' ? { rollNumber: sanitized.rollNumber } : {}),
        ...(typeof sanitized.firstName !== 'undefined' ? { firstName: sanitized.firstName } : {}),
        ...(typeof sanitized.lastName !== 'undefined' ? { lastName: sanitized.lastName } : {}),
        ...(typeof sanitized.firstName !== 'undefined' || typeof sanitized.lastName !== 'undefined'
          ? {
              fullName: this.buildFullName(
                sanitized.firstName ?? currentStudent.firstName,
                sanitized.lastName ?? currentStudent.lastName ?? undefined
              ),
            }
          : {}),
        ...(typeof sanitized.gender !== 'undefined' ? { gender: sanitized.gender } : {}),
        ...(typeof sanitized.arabicName !== 'undefined' ? { arabicName: sanitized.arabicName } : {}),
        ...(typeof sanitized.dateOfBirth !== 'undefined'
          ? { dateOfBirth: this.toDate(sanitized.dateOfBirth) }
          : {}),
        ...(typeof sanitized.bloodGroup !== 'undefined' ? { bloodGroup: sanitized.bloodGroup } : {}),
        ...(typeof sanitized.admissionDate !== 'undefined'
          ? { admissionDate: this.toDate(sanitized.admissionDate) }
          : {}),
        ...(typeof sanitized.phone !== 'undefined' ? { phone: sanitized.phone } : {}),
        ...(typeof sanitized.email !== 'undefined' ? { email: sanitized.email } : {}),
        ...(typeof sanitized.identityNumber !== 'undefined' ? { identityNumber: sanitized.identityNumber } : {}),
        ...(typeof sanitized.addressLine1 !== 'undefined' ? { addressLine1: sanitized.addressLine1 } : {}),
        ...(typeof sanitized.addressLine2 !== 'undefined' ? { addressLine2: sanitized.addressLine2 } : {}),
        ...(typeof sanitized.city !== 'undefined' ? { city: sanitized.city } : {}),
        ...(typeof sanitized.state !== 'undefined' ? { state: sanitized.state } : {}),
        ...(typeof sanitized.country !== 'undefined' ? { country: sanitized.country } : {}),
        ...(typeof sanitized.postalCode !== 'undefined' ? { postalCode: sanitized.postalCode } : {}),
        ...(typeof sanitized.isOrphan !== 'undefined' ? { isOrphan: sanitized.isOrphan } : {}),
        ...(typeof sanitized.isNeedy !== 'undefined' ? { isNeedy: sanitized.isNeedy } : {}),
        ...(typeof sanitized.currentProgram !== 'undefined' ? { currentProgram: sanitized.currentProgram } : {}),
        ...(typeof sanitized.currentClass !== 'undefined' ? { currentClass: sanitized.currentClass } : {}),
        ...(typeof sanitized.currentSection !== 'undefined' ? { currentSection: sanitized.currentSection } : {}),
        ...(typeof sanitized.leadSource !== 'undefined' ? { leadSource: sanitized.leadSource } : {}),
        ...(typeof sanitized.photoUrl !== 'undefined' ? { photoUrl: sanitized.photoUrl } : {}),
        ...(typeof sanitized.notes !== 'undefined' ? { notes: sanitized.notes } : {}),
      };

      await repository.updateStudent(id, updateData);

      if (sanitized.sponsorMappings) {
        await this.syncSponsorMappings(repository, auditService, tenantId, actorUserId, id, sanitized.sponsorMappings);
      }

      const refreshedStudent = await repository.findStudentById(tenantId, id);
      if (!refreshedStudent) {
        throw new AppError('Student not found after update', 404, 'STUDENT_NOT_FOUND');
      }

      await this.logStudentFieldChanges(auditService, tenantId, actorUserId, currentStudent, refreshedStudent);
      await auditService.logAudit(
        tenantId,
        actorUserId,
        'Student',
        id,
        'STUDENT_UPDATED',
        this.buildAuditSnapshot(currentStudent),
        this.buildAuditSnapshot(refreshedStudent)
      );

      return refreshedStudent;
    }, { maxWait: 15000, timeout: 30000 });

    await this.statsService.clearCache(tenantId);
    return updatedStudent;
  }

  async changeStudentStatus(
    tenantId: string,
    actorUserId: string,
    id: string,
    input: ChangeStudentStatusInput
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        const repository = new StudentRepository(tx);
        const auditService = new StudentAuditService(tx);
      const student = await repository.findStudentBaseById(tenantId, id);

      if (!student) {
        throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
      }

      this.lifecycleService.validateTransition(student.status, input.status);

      await repository.updateStudent(id, {
        status: input.status,
      });

      await auditService.logStatusChange(
        tenantId,
        id,
        actorUserId,
        student.status,
        input.status,
        input.notes
      );
      await auditService.logAudit(
        tenantId,
        actorUserId,
        'Student',
        id,
        'STUDENT_STATUS_CHANGED',
        { status: student.status },
        { status: input.status },
        input.notes ? { notes: input.notes } : undefined
      );

      const updatedStudent = await repository.findStudentById(tenantId, id);
      if (!updatedStudent) {
        throw new AppError('Student not found after status change', 404, 'STUDENT_NOT_FOUND');
      }

      return updatedStudent;
    },
    { maxWait: 35000, timeout: 30000 }
    );
  }

  async addGuardian(tenantId: string, actorUserId: string, studentId: string, guardian: GuardianInput) {
    const sanitized = this.sanitizePayload(guardian) as GuardianInput;

    return this.prisma.$transaction(async (tx) => {
      const repository = new StudentRepository(tx);
      const auditService = new StudentAuditService(tx);
      const student = await repository.findStudentBaseById(tenantId, studentId);

      if (!student) {
        throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
      }

      if (sanitized.isPrimary) {
        await repository.clearPrimaryGuardians(studentId);
      }

      const createdGuardian = await repository.createGuardian({
        tenantId,
        studentId,
        relation: sanitized.relation,
        fullName: sanitized.fullName,
        phone: sanitized.phone,
        alternatePhone: sanitized.alternatePhone,
        email: sanitized.email,
        occupation: sanitized.occupation,
        addressLine1: sanitized.addressLine1,
        addressLine2: sanitized.addressLine2,
        city: sanitized.city,
        state: sanitized.state,
        country: sanitized.country,
        postalCode: sanitized.postalCode,
        isPrimary: sanitized.isPrimary ?? false,
        notes: sanitized.notes,
      });

      await auditService.logHistory({
        tenantId,
        studentId,
        event: StudentHistoryEvent.GUARDIAN_ADDED,
        changedBy: actorUserId,
        fieldName: 'guardians',
        newValue: createdGuardian,
      });
      await auditService.logAudit(
        tenantId,
        actorUserId,
        'StudentGuardian',
        createdGuardian.id,
        'STUDENT_GUARDIAN_CREATED',
        undefined,
        createdGuardian
      );

      return createdGuardian;
    });
  }

  async updateGuardian(tenantId: string, actorUserId: string, guardianId: string, guardian: Partial<GuardianInput>) {
    const sanitized = this.sanitizePayload(guardian) as Partial<GuardianInput>;

    return this.prisma.$transaction(async (tx) => {
      const repository = new StudentRepository(tx);
      const auditService = new StudentAuditService(tx);
      const existingGuardian = await repository.findGuardianById(tenantId, guardianId);

      if (!existingGuardian) {
        throw new AppError('Guardian not found', 404, 'GUARDIAN_NOT_FOUND');
      }

      if (sanitized.isPrimary) {
        await repository.clearPrimaryGuardians(existingGuardian.studentId, guardianId);
      }

      const updatedGuardian = await repository.updateGuardian(guardianId, {
        ...(typeof sanitized.relation !== 'undefined' ? { relation: sanitized.relation } : {}),
        ...(typeof sanitized.fullName !== 'undefined' ? { fullName: sanitized.fullName } : {}),
        ...(typeof sanitized.phone !== 'undefined' ? { phone: sanitized.phone } : {}),
        ...(typeof sanitized.alternatePhone !== 'undefined' ? { alternatePhone: sanitized.alternatePhone } : {}),
        ...(typeof sanitized.email !== 'undefined' ? { email: sanitized.email } : {}),
        ...(typeof sanitized.occupation !== 'undefined' ? { occupation: sanitized.occupation } : {}),
        ...(typeof sanitized.addressLine1 !== 'undefined' ? { addressLine1: sanitized.addressLine1 } : {}),
        ...(typeof sanitized.addressLine2 !== 'undefined' ? { addressLine2: sanitized.addressLine2 } : {}),
        ...(typeof sanitized.city !== 'undefined' ? { city: sanitized.city } : {}),
        ...(typeof sanitized.state !== 'undefined' ? { state: sanitized.state } : {}),
        ...(typeof sanitized.country !== 'undefined' ? { country: sanitized.country } : {}),
        ...(typeof sanitized.postalCode !== 'undefined' ? { postalCode: sanitized.postalCode } : {}),
        ...(typeof sanitized.isPrimary !== 'undefined' ? { isPrimary: sanitized.isPrimary } : {}),
        ...(typeof sanitized.notes !== 'undefined' ? { notes: sanitized.notes } : {}),
      });

      await auditService.logHistory({
        tenantId,
        studentId: existingGuardian.studentId,
        event: StudentHistoryEvent.GUARDIAN_UPDATED,
        changedBy: actorUserId,
        fieldName: 'guardians',
        oldValue: existingGuardian,
        newValue: updatedGuardian,
      });
      await auditService.logAudit(
        tenantId,
        actorUserId,
        'StudentGuardian',
        guardianId,
        'STUDENT_GUARDIAN_UPDATED',
        existingGuardian,
        updatedGuardian
      );

      return updatedGuardian;
    });
  }

  async deleteGuardian(tenantId: string, actorUserId: string, guardianId: string) {
    return this.prisma.$transaction(async (tx) => {
      const repository = new StudentRepository(tx);
      const auditService = new StudentAuditService(tx);
      const existingGuardian = await repository.findGuardianById(tenantId, guardianId);

      if (!existingGuardian) {
        throw new AppError('Guardian not found', 404, 'GUARDIAN_NOT_FOUND');
      }

      await repository.softDeleteGuardian(guardianId);
      await auditService.logHistory({
        tenantId,
        studentId: existingGuardian.studentId,
        event: StudentHistoryEvent.GUARDIAN_REMOVED,
        changedBy: actorUserId,
        fieldName: 'guardians',
        oldValue: existingGuardian,
      });
      await auditService.logAudit(
        tenantId,
        actorUserId,
        'StudentGuardian',
        guardianId,
        'STUDENT_GUARDIAN_DELETED',
        existingGuardian
      );
    });
  }

  async createSponsor(
    tenantId: string,
    actorUserId: string,
    input: { name: string; phone?: string; email?: string; organization?: string; notes?: string }
  ) {
    const sanitized = this.sanitizePayload(input) as typeof input;
    const repository = new StudentRepository(this.prisma);
    const sponsor = await repository.createSponsor({
      tenantId,
      name: sanitized.name,
      phone: sanitized.phone,
      email: sanitized.email,
      organization: sanitized.organization,
      notes: sanitized.notes,
    });

    const auditService = new StudentAuditService(this.prisma);
    await auditService.logAudit(tenantId, actorUserId, 'Sponsor', sponsor.id, 'SPONSOR_CREATED', undefined, sponsor);

    return sponsor;
  }

  async listSponsors(tenantId: string) {
    const repository = new StudentRepository(this.prisma);
    return repository.listSponsors(tenantId);
  }

  async mapSponsor(tenantId: string, actorUserId: string, studentId: string, mapping: SponsorMappingInput) {
    const sanitized = this.sanitizePayload(mapping) as SponsorMappingInput;

    return this.prisma.$transaction(async (tx) => {
      const repository = new StudentRepository(tx);
      const auditService = new StudentAuditService(tx);
      const student = await repository.findStudentBaseById(tenantId, studentId);
      if (!student) {
        throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
      }

      await this.assertSponsorOwnership(repository, tenantId, [sanitized.sponsorId]);

      const duplicateMapping = await repository.findActiveSponsorMapping(tenantId, studentId, sanitized.sponsorId);
      if (duplicateMapping) {
        throw new AppError('Sponsor already mapped to student', 409, 'DUPLICATE_STUDENT_SPONSOR_MAPPING');
      }

      const createdMapping = await repository.mapSponsorToStudent({
        tenantId,
        studentId,
        sponsorId: sanitized.sponsorId,
        supportLabel: sanitized.supportLabel,
        amount: this.toDecimal(sanitized.amount),
        currencyCode: sanitized.currencyCode ?? 'INR',
        startDate: this.toDate(sanitized.startDate),
        endDate: this.toDate(sanitized.endDate),
        notes: sanitized.notes,
      });

      await repository.updateStudent(studentId, {
        isSponsored: true,
      });

      await auditService.logHistory({
        tenantId,
        studentId,
        event: StudentHistoryEvent.SPONSOR_LINKED,
        changedBy: actorUserId,
        fieldName: 'sponsors',
        newValue: createdMapping,
      });
      await auditService.logAudit(
        tenantId,
        actorUserId,
        'StudentSponsor',
        createdMapping.id,
        'STUDENT_SPONSOR_LINKED',
        undefined,
        createdMapping
      );

      return createdMapping;
    });
  }

  async unlinkSponsor(tenantId: string, actorUserId: string, studentId: string, sponsorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const repository = new StudentRepository(tx);
      const auditService = new StudentAuditService(tx);
      const student = await repository.findStudentBaseById(tenantId, studentId);
      if (!student) {
        throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
      }

      const mapping = await repository.findActiveSponsorMapping(tenantId, studentId, sponsorId);
      if (!mapping) {
        throw new AppError('Sponsor mapping not found', 404, 'SPONSOR_MAPPING_NOT_FOUND');
      }

      await repository.softDeleteSponsorMapping(mapping.id);
      const activeMappings = await repository.getActiveSponsorMappings(studentId);
      await repository.updateStudent(studentId, {
        isSponsored: activeMappings.length > 0,
      });

      await auditService.logHistory({
        tenantId,
        studentId,
        event: StudentHistoryEvent.SPONSOR_UNLINKED,
        changedBy: actorUserId,
        fieldName: 'sponsors',
        oldValue: mapping,
      });
      await auditService.logAudit(
        tenantId,
        actorUserId,
        'StudentSponsor',
        mapping.id,
        'STUDENT_SPONSOR_UNLINKED',
        mapping
      );
    });
  }

  async addDocument(tenantId: string, actorUserId: string, studentId: string, input: { documentUrl: string; documentType: string; title?: string; notes?: string }) {
    const sanitized = this.sanitizePayload(input) as typeof input;

    return this.prisma.$transaction(async (tx) => {
      const repository = new StudentRepository(tx);
      const auditService = new StudentAuditService(tx);
      const student = await repository.findStudentBaseById(tenantId, studentId);
      if (!student) {
        throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
      }

      const createdDocument = await repository.createStudentDocument({
        tenantId,
        studentId,
        documentUrl: sanitized.documentUrl,
        documentType: sanitized.documentType as any,
        title: sanitized.title,
        notes: sanitized.notes,
      });

      await auditService.logAudit(
        tenantId,
        actorUserId,
        'StudentDocument',
        createdDocument.id,
        'STUDENT_DOCUMENT_CREATED',
        undefined,
        createdDocument
      );

      return createdDocument;
    });
  }

  async deleteDocument(tenantId: string, actorUserId: string, studentId: string, documentId: string) {
    return this.prisma.$transaction(async (tx) => {
      const repository = new StudentRepository(tx);
      const auditService = new StudentAuditService(tx);
      
      const document = await repository.findStudentDocumentById(tenantId, documentId);
      if (!document || document.studentId !== studentId) {
        throw new AppError('Document not found', 404, 'DOCUMENT_NOT_FOUND');
      }

      await repository.softDeleteStudentDocument(documentId);
      
      await auditService.logAudit(
        tenantId,
        actorUserId,
        'StudentDocument',
        documentId,
        'STUDENT_DOCUMENT_DELETED',
        document
      );
    });
  }

  async deleteStudent(tenantId: string, actorUserId: string, id: string) {
    await this.prisma.$transaction(async (tx) => {
      const repository = new StudentRepository(tx);
      const auditService = new StudentAuditService(tx);
      const student = await repository.findStudentBaseById(tenantId, id);
      if (!student) {
        throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
      }

      await repository.softDeleteStudent(id);
      await auditService.logHistory({
        tenantId,
        studentId: id,
        event: StudentHistoryEvent.SOFT_DELETED,
        changedBy: actorUserId,
        oldValue: student,
      });
      await auditService.logAudit(tenantId, actorUserId, 'Student', id, 'STUDENT_DELETED', student);
      await tx.tenantStats.upsert({
        where: { tenantId },
        create: {
          tenantId,
          totalStudents: 0,
          lastUpdatedAt: new Date(),
        },
        update: {
          totalStudents: {
            decrement: 1,
          },
          lastUpdatedAt: new Date(),
        },
      });
    });

    await this.statsService.clearCache(tenantId);
  }

  private sanitizePayload<T>(payload: T): T {
    return CmsValidationService.sanitizeContent(payload) as T;
  }

  private ensureSinglePrimaryGuardian(guardians?: GuardianInput[]) {
    if (!guardians?.length) {
      return;
    }

    const primaryCount = guardians.filter((guardian) => guardian.isPrimary).length;
    if (primaryCount > 1) {
      throw new AppError('Only one primary guardian is allowed', 400, 'MULTIPLE_PRIMARY_GUARDIANS');
    }
  }

  private ensureNoDirectStatusMutation(input: UpdateStudentInput) {
    if (typeof input.status !== 'undefined') {
      throw new AppError(
        'Student status must be changed through the status transition API',
        400,
        'DIRECT_STUDENT_STATUS_UPDATE_FORBIDDEN'
      );
    }
  }

  private async assertBranchOwnership(repository: StudentRepository, tenantId: string, branchId: string) {
    const branch = await repository.findBranchById(tenantId, branchId);
    if (!branch) {
      throw new AppError('Branch not found for tenant', 404, 'BRANCH_NOT_FOUND');
    }
  }

  private async assertSessionOwnership(repository: StudentRepository, tenantId: string, sessionId: string) {
    const session = await repository.findAcademicSessionById(tenantId, sessionId);
    if (!session) {
      throw new AppError('Academic session not found for tenant', 404, 'ACADEMIC_SESSION_NOT_FOUND');
    }
  }

  private async assertSponsorOwnership(repository: StudentRepository, tenantId: string, sponsorIds: string[]) {
    if (!sponsorIds.length) {
      return;
    }

    const sponsors = await repository.findSponsorsByIds(tenantId, sponsorIds);
    if (sponsors.length !== new Set(sponsorIds).size) {
      throw new AppError('One or more sponsors were not found for tenant', 404, 'SPONSOR_NOT_FOUND');
    }
  }

  private async generateAdmissionNumber(repository: StudentRepository, tenantId: string) {
    const year = new Date().getUTCFullYear();
    const latestAdmissionNumber = await repository.getLatestAdmissionNumber(tenantId);
    const lastSequence = latestAdmissionNumber ? Number(latestAdmissionNumber.split('-').pop()) || 0 : 0;
    return `ADM-${year}-${String(lastSequence + 1).padStart(5, '0')}`;
  }

  private buildFullName(firstName: string, lastName?: string) {
    return [firstName, lastName].filter(Boolean).join(' ').trim();
  }

  private toDate(value?: string) {
    return value ? new Date(value) : undefined;
  }

  private toDecimal(value?: number) {
    return typeof value === 'number' ? new Prisma.Decimal(value) : undefined;
  }

  private isUniqueAdmissionConflict(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    );
  }

  private async syncSponsorMappings(
    repository: StudentRepository,
    auditService: StudentAuditService,
    tenantId: string,
    actorUserId: string,
    studentId: string,
    desiredMappings: SponsorMappingInput[]
  ) {
    const activeMappings = await repository.getActiveSponsorMappings(studentId);
    const desiredSponsorIds = desiredMappings.map((mapping) => mapping.sponsorId);

    for (const existingMapping of activeMappings) {
      if (!desiredSponsorIds.includes(existingMapping.sponsorId)) {
        await repository.softDeleteSponsorMapping(existingMapping.id);
        await auditService.logHistory({
          tenantId,
          studentId,
          event: StudentHistoryEvent.SPONSOR_UNLINKED,
          changedBy: actorUserId,
          fieldName: 'sponsors',
          oldValue: existingMapping,
        });
      }
    }

    for (const desiredMapping of desiredMappings) {
      const existingMapping = activeMappings.find((mapping) => mapping.sponsorId === desiredMapping.sponsorId);
      if (!existingMapping) {
        await repository.mapSponsorToStudent({
          tenantId,
          studentId,
          sponsorId: desiredMapping.sponsorId,
          supportLabel: desiredMapping.supportLabel,
          amount: this.toDecimal(desiredMapping.amount),
          currencyCode: desiredMapping.currencyCode ?? 'INR',
          startDate: this.toDate(desiredMapping.startDate),
          endDate: this.toDate(desiredMapping.endDate),
          notes: desiredMapping.notes,
        });
        await auditService.logHistory({
          tenantId,
          studentId,
          event: StudentHistoryEvent.SPONSOR_LINKED,
          changedBy: actorUserId,
          fieldName: 'sponsors',
          newValue: desiredMapping,
        });
        continue;
      }

      const nextPayload = {
        supportLabel: desiredMapping.supportLabel,
        amount: this.toDecimal(desiredMapping.amount),
        currencyCode: desiredMapping.currencyCode ?? 'INR',
        startDate: this.toDate(desiredMapping.startDate),
        endDate: this.toDate(desiredMapping.endDate),
        notes: desiredMapping.notes,
      };
      await repository.updateSponsorMapping(existingMapping.id, nextPayload);
    }

    await repository.updateStudent(studentId, {
      isSponsored: desiredMappings.length > 0,
    });
  }

  private async logStudentFieldChanges(
    auditService: StudentAuditService,
    tenantId: string,
    actorUserId: string,
    before: Record<string, unknown>,
    after: Record<string, unknown>
  ) {
    const trackedFields = [
      'firstName',
      'lastName',
      'fullName',
      'rollNumber',
      'phone',
      'email',
      'branchId',
      'academicSessionId',
      'currentProgram',
      'currentClass',
      'isOrphan',
      'isNeedy',
      'notes',
    ];

    for (const field of trackedFields) {
      if (before[field] !== after[field]) {
        const event =
          field === 'branchId'
            ? StudentHistoryEvent.BRANCH_CHANGED
            : field === 'academicSessionId'
              ? StudentHistoryEvent.SESSION_CHANGED
              : field === 'currentProgram'
                ? StudentHistoryEvent.PROGRAM_CHANGED
                : field === 'currentClass'
                  ? StudentHistoryEvent.CLASS_CHANGED
                  : StudentHistoryEvent.PROFILE_UPDATED;

        await auditService.logHistory({
          tenantId,
          studentId: String(after.id),
          event,
          changedBy: actorUserId,
          fieldName: field,
          oldValue: before[field],
          newValue: after[field],
        });
      }
    }
  }

  private buildAuditSnapshot(student: Record<string, unknown>) {
    return {
      id: student.id,
      branchId: student.branchId,
      academicSessionId: student.academicSessionId,
      admissionNumber: student.admissionNumber,
      rollNumber: student.rollNumber,
      fullName: student.fullName,
      status: student.status,
      isOrphan: student.isOrphan,
      isNeedy: student.isNeedy,
      isSponsored: student.isSponsored,
      currentProgram: student.currentProgram,
      currentClass: student.currentClass,
    };
  }
}
