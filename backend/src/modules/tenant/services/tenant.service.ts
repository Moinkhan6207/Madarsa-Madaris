import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AppError } from '../../../common/errors/AppError';
import { CreateTenantDto } from '../dto/tenant.dto';
import { logger } from '../../../common/logger/logger';

import { emailService } from '../../../common/email/email.service';

export class TenantService {
  constructor(private readonly prisma: PrismaClient) {}

  async createTenant(payload: CreateTenantDto, actorUserId: string) {
    let attempt = 0;
    const maxAttempts = 2;

    while (attempt < maxAttempts) {
      try {
        return await this.executeCreateTenant(payload, actorUserId);
      } catch (error: any) {
        attempt++;
        const isConnectionError = 
          error.message?.includes('Closed') || 
          error.message?.includes('socket') || 
          error.code === 'P2024' || 
          error.code === 'P2028';

        if (isConnectionError && attempt < maxAttempts) {
          logger.warn({ attempt, error: error.message }, 'Database connection error during tenant creation, retrying...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        throw error;
      }
    }
    
    throw new AppError('Institution creation failed due to database connection issues.', 500, 'DATABASE_CONNECTION_ERROR');
  }

  private async executeCreateTenant(payload: CreateTenantDto, actorUserId: string) {
    return this.prisma.$transaction(async (tx) => {
      const existingSlug = await tx.tenant.findUnique({
        where: { slug: payload.slug }
      });

      if (existingSlug) {
        throw new AppError('Tenant slug already exists', 409, 'TENANT_SLUG_ALREADY_EXISTS');
      }

      const plan = payload.planCode
        ? await tx.plan.findUnique({ where: { code: payload.planCode } })
        : null;

      if (payload.planCode && !plan) {
        throw new AppError('Plan not found', 404, 'PLAN_NOT_FOUND');
      }

      const tenant = await tx.tenant.create({
        data: {
          slug: payload.slug,
          displayName: payload.displayName,
          legalName: payload.legalName,
          institutionType: payload.institutionType,
          primaryEmail: payload.primaryEmail,
          primaryPhone: payload.primaryPhone,
          status: 'DRAFT',
        }
      });

      await tx.institutionProfile.create({
        data: { tenantId: tenant.id }
      });

      await tx.tenantSettings.create({
        data: { tenantId: tenant.id }
      });

      await tx.tenantBranding.create({
        data: { tenantId: tenant.id }
      });

      await tx.onboardingProgress.create({
        data: { tenantId: tenant.id }
      });

      // Module 2: Bootstrap Website Settings
      await tx.websiteSettings.create({
        data: { 
          tenantId: tenant.id,
          siteTitle: payload.displayName,
          contactEmail: payload.primaryEmail,
          contactPhone: payload.primaryPhone,
        }
      });

      // Module 2: Bootstrap Default Pages
      const defaultPages = [
        { title: 'Home', slug: 'home' },
        { title: 'About', slug: 'about' },
        { title: 'Courses', slug: 'courses' },
        { title: 'Admission', slug: 'admission' },
        { title: 'Donation', slug: 'donation' },
        { title: 'Contact', slug: 'contact' },
        { title: 'Events', slug: 'events' },
        { title: 'Results', slug: 'results' },
        { title: 'Gallery', slug: 'gallery' },
      ];

      for (const page of defaultPages) {
        await tx.page.create({
          data: {
            tenantId: tenant.id,
            title: page.title,
            slug: page.slug,
            isPublished: true, // Default pages are published by default
          }
        });
      }

      const passwordHash = await bcrypt.hash(payload.adminUser.password, 12);
      
      const adminUser = await tx.user.create({
        data: {
          tenantId: tenant.id,
          fullName: payload.adminUser.fullName,
          email: payload.adminUser.email,
          phone: payload.adminUser.phone,
          passwordHash,
          isActive: true
        }
      });

      let adminRole = await tx.role.findUnique({
        where: {
          tenantId_code: {
            tenantId: tenant.id,
            code: 'TENANT_OWNER'
          }
        }
      });

      if (!adminRole) {
        adminRole = await tx.role.create({
          data: {
            tenantId: tenant.id,
            code: 'TENANT_OWNER',
            name: 'Tenant Owner',
            isSystemRole: true
          }
        });

        // Seed basic permissions for this tenant owner
        const systemOwnerTemplate = await tx.role.findFirst({
          where: { code: 'TENANT_OWNER', tenantId: null },
          include: { rolePermissions: true }
        });

        if (systemOwnerTemplate) {
          const permissionIds = systemOwnerTemplate.rolePermissions.map(rp => rp.permissionId);
          await tx.rolePermission.createMany({
            data: permissionIds.map(id => ({
              roleId: adminRole!.id,
              permissionId: id
            }))
          });
        }
      }

      await tx.userRole.create({
        data: {
          userId: adminUser.id,
          roleId: adminRole.id
        }
      });

      if (plan) {
        await tx.planSubscription.create({
          data: {
            tenantId: tenant.id,
            planId: plan.id,
            startsAt: new Date(),
            isCurrent: true
          }
        });
      }

      await tx.auditLog.create({
        data: {
          tenantId: tenant.id,
          actorUserId,
          entityType: 'Tenant',
          entityId: tenant.id,
          action: 'TENANT_CREATED',
          newValue: {
            slug: tenant.slug,
            displayName: tenant.displayName
          }
        }
      });

      return {
        tenantId: tenant.id,
        adminUserId: adminUser.id
      };
    }, { timeout: 20000 });
  }

  async getTenantById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        profile: true,
        settings: true,
        branding: true,
        onboarding: true,
        subscriptions: { include: { plan: true } }
      }
    });

    if (!tenant) {
      throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
    }

    return tenant;
  }

  async getAllTenants(params: { page?: number; limit?: number; search?: string; status?: any }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (params.status) {
      where.status = params.status;
    }
    if (params.search) {
      where.OR = [
        { displayName: { contains: params.search, mode: 'insensitive' } },
        { slug: { contains: params.search, mode: 'insensitive' } }
      ];
    }

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { profile: true, branding: true, settings: true }
      }),
      this.prisma.tenant.count({ where })
    ]);

    return { tenants, total, page, limit };
  }

  // ─── Status Management ─────────────────────────────────────────────────────

  async approveTenant(tenantId: string, actorUserId: string) {
    return this.updateStatus(tenantId, 'ACTIVE', 'TENANT_APPROVED', actorUserId);
  }

  async suspendTenant(tenantId: string, actorUserId: string) {
    return this.updateStatus(tenantId, 'SUSPENDED', 'TENANT_SUSPENDED', actorUserId);
  }

  async activateTenant(tenantId: string, actorUserId: string) {
    return this.updateStatus(tenantId, 'ACTIVE', 'TENANT_ACTIVATED', actorUserId);
  }

  async archiveTenant(tenantId: string, actorUserId: string) {
    return this.updateStatus(tenantId, 'ARCHIVED', 'TENANT_ARCHIVED', actorUserId);
  }

  private async updateStatus(
    tenantId: string,
    targetStatus: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED' | 'PENDING_ACTIVATION',
    action: string,
    actorUserId: string
  ) {
    const { validateTenantStatusTransition } = await import('../validators/tenant.validator');
    
    const updatedTenant = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.findUnique({
        where: { id: tenantId }
      });

      if (!tenant) {
        throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
      }

      validateTenantStatusTransition(tenant.status, targetStatus as any);

      const updated = await tx.tenant.update({
        where: { id: tenantId },
        data: { status: targetStatus as any },
        include: { 
          users: { 
            where: { isActive: true },
            take: 1 
          } 
        }
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          actorUserId,
          entityType: 'Tenant',
          entityId: tenantId,
          action,
          oldValue: { status: tenant.status },
          newValue: { status: targetStatus }
        }
      });

      return updated;
    });

    // Send Approval Email if activated
    if (targetStatus === 'ACTIVE' && updatedTenant.users[0]) {
      emailService.sendTenantApprovedEmail(updatedTenant.users[0].email, updatedTenant.displayName);
    }

    return updatedTenant;
  }
}
