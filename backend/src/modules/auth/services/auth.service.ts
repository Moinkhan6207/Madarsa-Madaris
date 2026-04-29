import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import NodeCache from 'node-cache';
import { env } from '../../../config/env';
import { AppError } from '../../../common/errors/AppError';
import { TenantService } from '../../tenant/services/tenant.service';
import { CreateTenantDto } from '../../tenant/dto/tenant.dto';

import { emailService } from '../../../common/email/email.service';

// Cache for user permissions - 5 minutes TTL
const permissionsCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export class AuthService {
  private tenantService: TenantService;

  constructor(private readonly prisma: PrismaClient) {
    this.tenantService = new TenantService(prisma);
  }

  async login(email: string, password: string) {
    // First, fetch user with minimal data for authentication
    const user = await this.prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        passwordHash: true,
        isActive: true,
        deletedAt: true,
        tenantId: true,
        tenant: {
          select: { status: true, id: true, slug: true }
        }
      }
    });

    if (!user || user.deletedAt) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AppError('User account is inactive', 401, 'USER_INACTIVE');
    }

    const token = this.generateToken(user.id);

    // Fetch roles and permissions separately with caching
    const cacheKey = `user-perms:${user.id}`;
    let rolesAndPermissions = permissionsCache.get(cacheKey) as { roles: string[], permissions: string[] } | undefined;
    
    if (!rolesAndPermissions) {
      // Fetch roles with optimized query
      const userRolesData = await this.prisma.userRole.findMany({
        where: { userId: user.id },
        select: {
          role: {
            select: {
              code: true,
              rolePermissions: {
                select: {
                  permission: {
                    select: { code: true }
                  }
                }
              }
            }
          }
        }
      });

      const roles = userRolesData.map((ur) => ur.role.code);
      const permissions = Array.from(new Set(
        userRolesData.flatMap((ur) => 
          ur.role.rolePermissions.map((rp) => rp.permission.code)
        )
      ));

      rolesAndPermissions = { roles, permissions };
      permissionsCache.set(cacheKey, rolesAndPermissions);
    }

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        tenantId: user.tenantId,
        tenantSlug: user.tenant?.slug,
        tenantStatus: user.tenant?.status,
        roles: rolesAndPermissions.roles,
        permissions: rolesAndPermissions.permissions
      },
      token
    };
  }

  // Clear permissions cache when roles change
  clearPermissionsCache(userId: string) {
    permissionsCache.del(`user-perms:${userId}`);
  }

  async register(payload: CreateTenantDto) {
    // 1. Create Tenant and Admin User
    const result = await this.tenantService.createTenant(payload, 'SELF_REGISTER');

    // 2. Issuing token for the newly created admin user
    const token = this.generateToken(result.adminUserId);

    // 3. Send Welcome Email
    emailService.sendTenantCreatedEmail(payload.adminUser.email, payload.displayName);

    return {
      user: {
        id: result.adminUserId,
        fullName: payload.adminUser.fullName,
        email: payload.adminUser.email,
        tenantId: result.tenantId,
        tenantSlug: payload.slug,
        tenantStatus: 'DRAFT',
        roles: ['TENANT_OWNER'],

        permissions: [] // New tenant owners get permissions via their role later
      },
      token
    };
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET as string, {
      expiresIn: env.JWT_EXPIRES_IN as any
    });
  }
}
