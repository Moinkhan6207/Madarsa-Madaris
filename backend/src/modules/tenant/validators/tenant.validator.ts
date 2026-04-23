import { z } from 'zod';
import { CreateTenantSchema } from '../dto/create-tenant.dto';
import { UpdateTenantSchema } from '../dto/update-tenant.dto';
import { AppError } from '../../../common/errors/AppError';
import { TenantStatus } from '@prisma/client';

// =============================================================================
// Tenant Validators
// =============================================================================

export const tenantValidators = {
  create: CreateTenantSchema,
  update: UpdateTenantSchema,
  
  subdomain: z.object({
    subdomain: z.string().min(3).max(63),
  }),

  id: z.object({
    id: z.string().uuid('Invalid tenant ID'),
  }),

  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
    search: z.string().optional(),
    status: z.nativeEnum(TenantStatus).optional(),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
};

// =============================================================================
// Validation Helper
// =============================================================================

export const validateCreateTenant = (data: unknown): z.infer<typeof CreateTenantSchema> => {
  return CreateTenantSchema.parse(data);
};

export const validateUpdateTenant = (data: unknown): z.infer<typeof UpdateTenantSchema> => {
  return UpdateTenantSchema.parse(data);
};

export const validateTenantId = (data: unknown): { id: string } => {
  return tenantValidators.id.parse(data);
};

export const validateTenantQuery = (data: unknown): {
  page: number;
  limit: number;
  search?: string;
  status?: TenantStatus;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
} => {
  return tenantValidators.query.parse(data) as any;
};

/**
 * Validates if a tenant status transition is allowed.
 * 
 * Allowed:
 * - DRAFT -> PENDING_ACTIVATION
 * - PENDING_ACTIVATION -> ACTIVE
 * - ACTIVE -> SUSPENDED
 * - SUSPENDED -> ACTIVE
 * - ACTIVE -> ARCHIVED
 */
export const validateTenantStatusTransition = (
  currentStatus: TenantStatus,
  targetStatus: TenantStatus
): void => {
  const transitions: Record<TenantStatus, TenantStatus[]> = {
    [TenantStatus.DRAFT]: [TenantStatus.PENDING_ACTIVATION],
    [TenantStatus.PENDING_ACTIVATION]: [TenantStatus.ACTIVE],
    [TenantStatus.ACTIVE]: [TenantStatus.SUSPENDED, TenantStatus.ARCHIVED],
    [TenantStatus.SUSPENDED]: [TenantStatus.ACTIVE],
    [TenantStatus.ARCHIVED]: [],
  };

  const allowed = transitions[currentStatus];
  if (!allowed || !allowed.includes(targetStatus)) {
    throw new AppError(
      `Invalid status transition from ${currentStatus} to ${targetStatus}`,
      400,
      'INVALID_STATUS_TRANSITION'
    );
  }
};
