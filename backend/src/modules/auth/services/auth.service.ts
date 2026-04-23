import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env';
import { AppError } from '../../../common/errors/AppError';
import { TenantService } from '../../tenant/services/tenant.service';
import { CreateTenantDto } from '../../tenant/dto/tenant.dto';

import { emailService } from '../../../common/email/email.service';

export class AuthService {
  private tenantService: TenantService;

  constructor(private readonly prisma: PrismaClient) {
    this.tenantService = new TenantService(prisma);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { email },
      include: {
        tenant: {
          select: { status: true, id: true }
        },
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
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

    const userWithDetails = user as any;

    return {
      user: {
        id: userWithDetails.id,
        fullName: userWithDetails.fullName,
        email: userWithDetails.email,
        tenantId: userWithDetails.tenantId,
        tenantStatus: userWithDetails.tenant?.status,
        roles: userWithDetails.userRoles.map((ur: any) => ur.role.code),
        permissions: Array.from(new Set(userWithDetails.userRoles.flatMap((ur: any) => ur.role.rolePermissions.map((rp: any) => rp.permission.code))))
      },
      token
    };
  }

  async register(payload: CreateTenantDto) {
    // 1. Create Tenant and Admin User
    const result = await this.tenantService.createTenant(payload, 'SELF_REGISTER');

    // 2. Issuing token for the newly created admin user
    const token = this.generateToken(result.adminUserId);

    // 3. Send Welcome Email
    emailService.sendTenantCreatedEmail(payload.adminUser.email, payload.displayName);

    return {
      tenantId: result.tenantId,
      adminUserId: result.adminUserId,
      token
    };
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET as string, {
      expiresIn: env.JWT_EXPIRES_IN as any
    });
  }
}
