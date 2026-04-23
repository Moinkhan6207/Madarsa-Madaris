import { PrismaClient } from '@prisma/client';
import { AppError } from '../../../common/errors/AppError';

export interface CreateSessionDto {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

export class AcademicSessionService {
  constructor(private readonly prisma: PrismaClient) {}

  async listSessions(tenantId: string) {
    return this.prisma.academicSession.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { startDate: 'desc' },
    });
  }

  async createSession(tenantId: string, data: CreateSessionDto) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (start >= end) {
      throw new AppError('Start date must be before end date', 400, 'INVALID_SESSION_DATES');
    }

    // Rule: only one current/active session at a time
    if (data.isCurrent) {
      const existing = await this.prisma.academicSession.findFirst({
        where: { tenantId, isCurrent: true, deletedAt: null },
      });
      if (existing) {
        throw new AppError(
          'An active session already exists. Only one active session is allowed.',
          409,
          'ACTIVE_SESSION_EXISTS'
        );
      }
    }

    return this.prisma.academicSession.create({
      data: {
        tenantId,
        name: data.name,
        startDate: start,
        endDate: end,
        isCurrent: data.isCurrent ?? false,
      },
    });
  }

  async deleteSession(tenantId: string, sessionId: string) {
    const session = await this.prisma.academicSession.findFirst({
      where: { id: sessionId, tenantId, deletedAt: null },
    });
    if (!session) throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
    if (session.isCurrent) throw new AppError('Cannot delete the active session', 400, 'CANNOT_DELETE_ACTIVE_SESSION');

    return this.prisma.academicSession.update({
      where: { id: sessionId },
      data: { deletedAt: new Date() },
    });
  }
}
