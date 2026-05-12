import {
  StudentGuardianRelation,
  StudentHistoryEvent,
  StudentStatus,
} from '@prisma/client';

export interface SponsorMappingInput {
  sponsorId: string;
  supportLabel?: string;
  amount?: number;
  currencyCode?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface GuardianInput {
  relation: StudentGuardianRelation;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  occupation?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isPrimary?: boolean;
  notes?: string;
}

export interface CreateStudentInput {
  branchId: string;
  academicSessionId?: string;
  rollNumber?: string;
  firstName: string;
  lastName?: string;
  arabicName?: string;
  gender?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  admissionDate?: string;
  phone?: string;
  email?: string;
  identityNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  status?: StudentStatus;
  isOrphan?: boolean;
  isNeedy?: boolean;
  currentProgram?: string;
  currentClass?: string;
  currentSection?: string;
  leadSource?: string;
  photoUrl?: string;
  notes?: string;
  guardians?: GuardianInput[];
  sponsorMappings?: SponsorMappingInput[];
}

export interface UpdateStudentInput extends Partial<CreateStudentInput> {}

export interface ChangeStudentStatusInput {
  status: StudentStatus;
  notes?: string;
}

export interface StudentListQuery {
  page: number;
  limit: number;
  search?: string;
  branchId?: string;
  status?: StudentStatus;
  orphan?: boolean;
  sponsored?: boolean;
  needy?: boolean;
  sortBy: StudentSortableField;
  sortOrder: 'asc' | 'desc';
}

export type StudentSortableField =
  | 'createdAt'
  | 'updatedAt'
  | 'fullName'
  | 'admissionNumber'
  | 'status'
  | 'admissionDate';

export interface StudentHistoryLogInput {
  tenantId: string;
  studentId: string;
  event: StudentHistoryEvent;
  changedBy?: string;
  fieldName?: string;
  oldValue?: unknown;
  newValue?: unknown;
  metadata?: Record<string, unknown>;
}
