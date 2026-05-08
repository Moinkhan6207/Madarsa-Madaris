export type StudentStatus =
  | 'LEAD'
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'ADMITTED'
  | 'ACTIVE'
  | 'PROMOTED'
  | 'TRANSFERRED'
  | 'DROPPED'
  | 'PASSED_OUT'
  | 'ALUMNI';

export type StudentGuardianRelation =
  | 'FATHER'
  | 'MOTHER'
  | 'BROTHER'
  | 'SISTER'
  | 'UNCLE'
  | 'AUNT'
  | 'GRANDPARENT'
  | 'SPOUSE'
  | 'OTHER';

export type StudentHistoryEvent =
  | 'CREATED'
  | 'STATUS_CHANGED'
  | 'PROFILE_UPDATED'
  | 'BRANCH_CHANGED'
  | 'SESSION_CHANGED'
  | 'PROGRAM_CHANGED'
  | 'CLASS_CHANGED'
  | 'GUARDIAN_ADDED'
  | 'GUARDIAN_UPDATED'
  | 'GUARDIAN_REMOVED'
  | 'SPONSOR_LINKED'
  | 'SPONSOR_UNLINKED'
  | 'SOFT_DELETED';

export interface Student {
  id: string;
  tenantId: string;
  branchId: string;
  academicSessionId?: string | null;
  admissionNumber: string;
  rollNumber?: string | null;
  firstName: string;
  lastName?: string | null;
  fullName: string;
  gender?: string | null;
  dateOfBirth?: string | null;
  admissionDate: string;
  phone?: string | null;
  email?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  status: StudentStatus;
  isOrphan: boolean;
  isNeedy: boolean;
  isSponsored: boolean;
  currentProgram?: string | null;
  currentClass?: string | null;
  leadSource?: string | null;
  notes?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  branch: Branch;
  academicSession?: AcademicSession | null;
  guardians: StudentGuardian[];
  sponsors: StudentSponsorMapping[];
  _count?: {
    guardians: number;
    sponsors: number;
    history: number;
  };
}

export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  code?: string | null;
}

export interface AcademicSession {
  id: string;
  tenantId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface StudentGuardian {
  id: string;
  tenantId: string;
  studentId: string;
  relation: StudentGuardianRelation;
  fullName: string;
  phone: string;
  alternatePhone?: string | null;
  email?: string | null;
  occupation?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  isPrimary: boolean;
  notes?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Sponsor {
  id: string;
  tenantId: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  organization?: string | null;
  notes?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentSponsorMapping {
  id: string;
  tenantId: string;
  studentId: string;
  sponsorId: string;
  supportLabel?: string | null;
  amount?: string | null;
  currencyCode?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  sponsor: Sponsor;
}

export interface StudentHistory {
  id: string;
  tenantId: string;
  studentId: string;
  event: StudentHistoryEvent;
  fieldName?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
  metadata?: unknown;
  changedBy?: string | null;
  changedAt: string;
  createdAt: string;
}

export interface CreateStudentPayload {
  branchId: string;
  academicSessionId?: string;
  rollNumber?: string;
  firstName: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  admissionDate?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isOrphan?: boolean;
  isNeedy?: boolean;
  currentProgram?: string;
  currentClass?: string;
  leadSource?: string;
  notes?: string;
  guardians?: GuardianInput[];
  sponsorMappings?: SponsorMappingInput[];
}

export interface UpdateStudentPayload {
  branchId?: string;
  academicSessionId?: string;
  rollNumber?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  admissionDate?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isOrphan?: boolean;
  isNeedy?: boolean;
  currentProgram?: string;
  currentClass?: string;
  leadSource?: string;
  notes?: string;
  sponsorMappings?: SponsorMappingInput[];
}

export interface ChangeStatusPayload {
  status: StudentStatus;
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

export interface UpdateGuardianPayload {
  relation?: StudentGuardianRelation;
  fullName?: string;
  phone?: string;
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

export interface SponsorMappingInput {
  sponsorId: string;
  supportLabel?: string;
  amount?: number;
  currencyCode?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface CreateSponsorPayload {
  name: string;
  phone?: string;
  email?: string;
  organization?: string;
  notes?: string;
}

export interface StudentListFilters {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: string;
  status?: StudentStatus;
  orphan?: boolean;
  sponsored?: boolean;
  needy?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'fullName' | 'admissionNumber' | 'status' | 'admissionDate';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedStudentsResponse {
  students: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const ALLOWED_TRANSITIONS: Record<StudentStatus, StudentStatus[]> = {
  LEAD: ['APPLIED'],
  APPLIED: ['UNDER_REVIEW', 'DROPPED'],
  UNDER_REVIEW: ['ADMITTED', 'DROPPED'],
  ADMITTED: ['ACTIVE', 'DROPPED'],
  ACTIVE: ['PROMOTED', 'TRANSFERRED', 'DROPPED', 'PASSED_OUT'],
  PROMOTED: ['ACTIVE', 'TRANSFERRED', 'DROPPED', 'PASSED_OUT'],
  TRANSFERRED: ['ALUMNI'],
  DROPPED: ['ALUMNI'],
  PASSED_OUT: ['ALUMNI'],
  ALUMNI: [],
};

export function getAllowedTransitions(status: StudentStatus): StudentStatus[] {
  return ALLOWED_TRANSITIONS[status] ?? [];
}

export function canTransition(from: StudentStatus, to: StudentStatus): boolean {
  return from !== to && (ALLOWED_TRANSITIONS[from] ?? []).includes(to);
}

export const STATUS_DISPLAY: Record<StudentStatus, { label: string; color: string; bg: string }> = {
  LEAD: { label: 'Lead', color: 'text-slate-600', bg: 'bg-slate-100' },
  APPLIED: { label: 'Applied', color: 'text-blue-600', bg: 'bg-blue-50' },
  UNDER_REVIEW: { label: 'Under Review', color: 'text-amber-600', bg: 'bg-amber-50' },
  ADMITTED: { label: 'Admitted', color: 'text-purple-600', bg: 'bg-purple-50' },
  ACTIVE: { label: 'Active', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  PROMOTED: { label: 'Promoted', color: 'text-teal-600', bg: 'bg-teal-50' },
  TRANSFERRED: { label: 'Transferred', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  DROPPED: { label: 'Dropped', color: 'text-red-600', bg: 'bg-red-50' },
  PASSED_OUT: { label: 'Passed Out', color: 'text-orange-600', bg: 'bg-orange-50' },
  ALUMNI: { label: 'Alumni', color: 'text-slate-500', bg: 'bg-slate-100' },
};

export const HISTORY_EVENT_LABELS: Record<StudentHistoryEvent, string> = {
  CREATED: 'Student Created',
  STATUS_CHANGED: 'Status Changed',
  PROFILE_UPDATED: 'Profile Updated',
  BRANCH_CHANGED: 'Branch Changed',
  SESSION_CHANGED: 'Session Changed',
  PROGRAM_CHANGED: 'Program Changed',
  CLASS_CHANGED: 'Class Changed',
  GUARDIAN_ADDED: 'Guardian Added',
  GUARDIAN_UPDATED: 'Guardian Updated',
  GUARDIAN_REMOVED: 'Guardian Removed',
  SPONSOR_LINKED: 'Sponsor Linked',
  SPONSOR_UNLINKED: 'Sponsor Unlinked',
  SOFT_DELETED: 'Student Deleted',
};

export const RELATION_LABELS: Record<StudentGuardianRelation, string> = {
  FATHER: 'Father',
  MOTHER: 'Mother',
  BROTHER: 'Brother',
  SISTER: 'Sister',
  UNCLE: 'Uncle',
  AUNT: 'Aunt',
  GRANDPARENT: 'Grandparent',
  SPOUSE: 'Spouse',
  OTHER: 'Other',
};
