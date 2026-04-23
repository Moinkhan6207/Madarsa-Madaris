import { z } from 'zod';

// =============================================================================
// Update Tenant DTO Schema
// =============================================================================

export const UpdateTenantSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .optional(),

  status: z.enum([
    'PENDING',
    'ACTIVE',
    'SUSPENDED',
    'CANCELLED',
    'PENDING_DELETION',
  ]).optional(),

  isVerified: z.boolean().optional(),
}).strict();

export type UpdateTenantDto = z.infer<typeof UpdateTenantSchema>;
