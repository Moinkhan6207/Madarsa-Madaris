import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { TenantStatus } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        tenantId?: string | null;
        tenantStatus?: TenantStatus;
        roles?: string[];
        permissions?: string[];
      };
      context?: {
        userId: string;
        tenantId?: string | null;
        tenantStatus?: TenantStatus;
        roles: string[];
        permissions: string[];
        requestId?: string;
      };
    }
  }
}

export function tenantContextMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const isSuperAdmin = req.user?.roles?.includes('SUPER_ADMIN');
  let tenantId = req.user?.tenantId || null;

  // Allow SuperAdmin to override tenant context via header
  if (isSuperAdmin) {
    const headerTenantId = req.headers['x-tenant-id'] as string;
    if (headerTenantId) {
      tenantId = headerTenantId;
    }
  }

  if (!tenantId && !isSuperAdmin) {
    throw new AppError('Tenant context is required', 403, 'TENANT_CONTEXT_REQUIRED');
  }

  req.context = {
    userId: req.user!.id,
    tenantId,
    tenantStatus: req.user?.tenantStatus,
    roles: req.user?.roles ?? [],
    permissions: req.user?.permissions ?? [],
    requestId: req.headers['x-request-id'] as string | undefined
  };

  // ─── Status-Based Access Control ───────────────────────────────────────────
  
  const isPlatformRoute = req.originalUrl.includes('/api/v1/platform');
  const isTenantSetupRoute = req.originalUrl.includes('/api/v1/tenant');

  // Allow DRAFT or PENDING_ACTIVATION tenants to access /tenant routes for setup
  const isAllowedOnboarding = 
    (req.user?.tenantStatus === TenantStatus.DRAFT || req.user?.tenantStatus === TenantStatus.PENDING_ACTIVATION) &&
    isTenantSetupRoute;

  if (
    req.user?.tenantId && 
    req.user.tenantStatus !== TenantStatus.ACTIVE &&
    !isSuperAdmin &&
    !isPlatformRoute &&
    !isAllowedOnboarding
  ) {
    throw new AppError(
      `Tenant is not active (Current Status: ${req.user.tenantStatus}). Access restricted.`,
      403,
      'TENANT_NOT_ACTIVE'
    );
  }

  next();
}
