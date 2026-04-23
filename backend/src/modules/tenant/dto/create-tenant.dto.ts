import { z } from 'zod';

// =============================================================================
// Create Tenant DTO Schema
// =============================================================================

export const CreateTenantSchema = z.object({
  // Basic Info
  subdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(63, 'Subdomain must be at most 63 characters')
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      'Subdomain must contain only lowercase letters, numbers, and hyphens, and must start and end with a letter or number'
    ),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),

  // Institution Profile
  institutionType: z.enum([
    'MADRASA',
    'ISLAMIC_SCHOOL',
    'IDARA',
    'DARUL_ULOOM',
    'QURAN_CENTER',
    'ISLAMIC_CENTER',
    'OTHER',
  ]).optional(),
  establishedYear: z
    .number()
    .int()
    .min(1800, 'Established year must be after 1800')
    .max(new Date().getFullYear(), 'Established year cannot be in the future')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be at most 1000 characters')
    .optional(),
  email: z
    .string()
    .email('Invalid email address')
    .optional(),
  phone: z
    .string()
    .max(20, 'Phone number must be at most 20 characters')
    .optional(),

  // Address
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),

  // Admin User Info (for initial setup)
  adminEmail: z
    .string()
    .email('Invalid admin email address'),
  adminFirstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be at most 50 characters'),
  adminLastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be at most 50 characters'),
  adminPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),

  // Plan Selection
  planCode: z
    .string()
    .optional()
    .default('FREE'),
});

export type CreateTenantDto = z.infer<typeof CreateTenantSchema>;
