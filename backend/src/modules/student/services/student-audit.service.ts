import { Prisma, PrismaClient, StudentHistoryEvent } from '@prisma/client';
import { StudentRepository } from '../repositories/student.repository';
import { StudentHistoryLogInput } from '../types/student.types';

type PrismaDbClient = PrismaClient | Prisma.TransactionClient;

export class StudentAuditService {
  private readonly repository: StudentRepository;

  constructor(prisma: PrismaDbClient) {
    this.repository = new StudentRepository(prisma);
  }

  async logHistory(input: StudentHistoryLogInput) {
    await this.repository.createHistory({
      tenantId: input.tenantId,
      studentId: input.studentId,
      event: input.event,
      fieldName: input.fieldName,
      oldValue: this.toJsonValue(input.oldValue),
      newValue: this.toJsonValue(input.newValue),
      metadata: this.toJsonValue(input.metadata),
      changedBy: input.changedBy,
      changedAt: new Date(),
    });
  }

  async logAudit(
    tenantId: string,
    actorUserId: string | undefined,
    entityType: string,
    entityId: string,
    action: string,
    oldValue?: unknown,
    newValue?: unknown,
    metadata?: Record<string, unknown>
  ) {
    await this.repository.createAuditLog({
      tenantId,
      actorUserId,
      entityType,
      entityId,
      action,
      oldValue: this.toJsonValue(oldValue),
      newValue: this.toJsonValue(newValue),
      metadata: this.toJsonValue(metadata),
    });
  }

  async logStatusChange(
    tenantId: string,
    studentId: string,
    changedBy: string | undefined,
    fromStatus: string,
    toStatus: string,
    notes?: string
  ) {
    await this.logHistory({
      tenantId,
      studentId,
      event: StudentHistoryEvent.STATUS_CHANGED,
      fieldName: 'status',
      oldValue: {
        status: fromStatus,
      },
      newValue: {
        status: toStatus,
        notes,
      },
      changedBy,
      metadata: notes ? { notes } : undefined,
    });
  }

  private toJsonValue(value: unknown): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
    if (typeof value === 'undefined') {
      return undefined;
    }

    if (value === null) {
      return Prisma.JsonNull;
    }

    return value as Prisma.InputJsonValue;
  }
}
