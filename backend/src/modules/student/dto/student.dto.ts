import { StudentGuardianRelation, StudentStatus, StudentDocumentType } from '@prisma/client';
import { z } from 'zod';

const nullableTrimmedString = z
  .string()
  .trim()
  .min(1)
  .optional()
  .or(z.literal(''))
  .transform((value) => (value ? value : undefined));

const guardianSchema = z.object({
  relation: z.nativeEnum(StudentGuardianRelation),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(20),
  alternatePhone: nullableTrimmedString,
  email: z.string().trim().email().optional().or(z.literal('')).transform((value) => value || undefined),
  occupation: nullableTrimmedString,
  addressLine1: nullableTrimmedString,
  addressLine2: nullableTrimmedString,
  city: nullableTrimmedString,
  state: nullableTrimmedString,
  country: nullableTrimmedString,
  postalCode: nullableTrimmedString,
  isPrimary: z.boolean().optional(),
  notes: nullableTrimmedString,
});

const sponsorMappingSchema = z.object({
  sponsorId: z.string().uuid(),
  supportLabel: nullableTrimmedString,
  amount: z.number().nonnegative().optional(),
  currencyCode: nullableTrimmedString,
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  notes: nullableTrimmedString,
});

export const CreateStudentSchema = z.object({
  branchId: z.string().uuid(),
  academicSessionId: z.string().uuid().optional(),
  rollNumber: nullableTrimmedString,
  firstName: z.string().trim().min(2).max(100),
  lastName: nullableTrimmedString,
  arabicName: nullableTrimmedString,
  gender: nullableTrimmedString,
  dateOfBirth: z.string().datetime().optional(),
  bloodGroup: nullableTrimmedString,
  admissionDate: z.string().datetime().optional(),
  phone: nullableTrimmedString,
  email: z.string().trim().email().optional().or(z.literal('')).transform((value) => value || undefined),
  identityNumber: nullableTrimmedString,
  addressLine1: nullableTrimmedString,
  addressLine2: nullableTrimmedString,
  city: nullableTrimmedString,
  state: nullableTrimmedString,
  country: nullableTrimmedString,
  postalCode: nullableTrimmedString,
  status: z.nativeEnum(StudentStatus).optional(),
  isOrphan: z.boolean().optional(),
  isNeedy: z.boolean().optional(),
  currentProgram: nullableTrimmedString,
  currentClass: nullableTrimmedString,
  currentSection: nullableTrimmedString,
  leadSource: nullableTrimmedString,
  photoUrl: nullableTrimmedString,
  notes: nullableTrimmedString,
  guardians: z.array(guardianSchema).max(10).optional(),
  sponsorMappings: z.array(sponsorMappingSchema).max(20).optional(),
});

export const UpdateStudentSchema = CreateStudentSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  'At least one field must be provided for update'
);

export const ChangeStudentStatusSchema = z.object({
  status: z.nativeEnum(StudentStatus),
  notes: nullableTrimmedString,
});

export const CreateGuardianSchema = guardianSchema;
export const UpdateGuardianSchema = guardianSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  'At least one field must be provided for update'
);

export const CreateSponsorSchema = z.object({
  name: z.string().trim().min(2).max(160),
  phone: nullableTrimmedString,
  email: z.string().trim().email().optional().or(z.literal('')).transform((value) => value || undefined),
  organization: nullableTrimmedString,
  notes: nullableTrimmedString,
});

export const MapSponsorSchema = sponsorMappingSchema;

export const StudentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: nullableTrimmedString,
  branchId: z.string().uuid().optional(),
  status: z.nativeEnum(StudentStatus).optional(),
  orphan: z.coerce.boolean().optional(),
  sponsored: z.coerce.boolean().optional(),
  needy: z.coerce.boolean().optional(),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'fullName', 'admissionNumber', 'status', 'admissionDate'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const CreateDocumentSchema = z.object({
  documentUrl: z.string().trim().url(),
  documentType: z.nativeEnum(StudentDocumentType),
  title: nullableTrimmedString,
  notes: nullableTrimmedString,
});
