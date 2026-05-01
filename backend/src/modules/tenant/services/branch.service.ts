import { PrismaClient } from '@prisma/client';
import { AppError } from '../../../common/errors/AppError';
import { createPaginationResult } from '../../../common/utils/pagination';

export interface CreateBranchDto {
  name: string;
  code?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  headName?: string;
  isPrimary?: boolean;
}

export interface UpdateBranchDto extends Partial<CreateBranchDto> {}

export class BranchService {
  constructor(private readonly prisma: PrismaClient) {}

  async listBranches(tenantId: string, params?: { page?: number; limit?: number }) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const [branches, total] = await Promise.all([
      this.prisma.branch.findMany({
        where: { tenantId, deletedAt: null },
        skip,
        take: limit,
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          code: true,
          name: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          state: true,
          country: true,
          postalCode: true,
          phone: true,
          email: true,
          headName: true,
          isPrimary: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        }
      }),
      this.prisma.branch.count({
        where: { tenantId, deletedAt: null }
      })
    ]);

    return createPaginationResult(branches, total, page, limit);
  }

  async createBranch(tenantId: string, data: CreateBranchDto) {
    // Rule: only one primary branch allowed
    if (data.isPrimary) {
      const existingPrimary = await this.prisma.branch.findFirst({
        where: { tenantId, isPrimary: true, deletedAt: null },
      });
      if (existingPrimary) {
        throw new AppError(
          'A primary branch already exists. Only one primary branch is allowed.',
          409,
          'PRIMARY_BRANCH_EXISTS'
        );
      }
    }

    return this.prisma.branch.create({
      data: { tenantId, ...data },
    });
  }

  async updateBranch(tenantId: string, branchId: string, data: UpdateBranchDto) {
    // If setting as primary, remove primary from others first
    if (data.isPrimary) {
      const existingPrimary = await this.prisma.branch.findFirst({
        where: { tenantId, isPrimary: true, deletedAt: null, NOT: { id: branchId } },
      });
      if (existingPrimary) {
        throw new AppError(
          'A primary branch already exists. Only one primary branch is allowed.',
          409,
          'PRIMARY_BRANCH_EXISTS'
        );
      }
    }

    return this.prisma.branch.update({
      where: { id: branchId },
      data,
    });
  }

  async deleteBranch(tenantId: string, branchId: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id: branchId, tenantId, deletedAt: null },
    });
    if (!branch) throw new AppError('Branch not found', 404, 'BRANCH_NOT_FOUND');
    if (branch.isPrimary) throw new AppError('Cannot delete primary branch', 400, 'CANNOT_DELETE_PRIMARY_BRANCH');

    return this.prisma.branch.update({
      where: { id: branchId },
      data: { deletedAt: new Date() },
    });
  }
}
