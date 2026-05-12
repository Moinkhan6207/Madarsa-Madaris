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
  oldValue?: any;
  newValue?: any;
  metadata?: any;
  changedBy?: string | null;
  changedAt: string;
  createdAt: string;
}

export type StudentDocumentType = 
  | 'ID_PROOF'
  | 'MEDICAL_RECORD'
  | 'ADMISSION_FORM'
  | 'CERTIFICATE'
  | 'OTHER';

export interface StudentDocument {
  id: string;
  tenantId: string;
  studentId: string;
  documentUrl: string;
  documentType: StudentDocumentType;
  title?: string | null;
  notes?: string | null;
  uploadedAt: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

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
  arabicName?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  bloodGroup?: string | null;
  admissionDate: string;
  phone?: string | null;
  email?: string | null;
  identityNumber?: string | null;
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
  currentSection?: string | null;
  leadSource?: string | null;
  photoUrl?: string | null;
  notes?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  branch: Branch;
  academicSession?: AcademicSession | null;
  guardians: StudentGuardian[];
  sponsors: StudentSponsorMapping[];
  history?: StudentHistory[];
  documents?: StudentDocument[];
  _count?: {
    guardians: number;
    sponsors: number;
    history: number;
    documents?: number;
  };
}

export interface CreateStudentPayload {
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

export interface UpdateStudentPayload {
  branchId?: string;
  academicSessionId?: string;
  rollNumber?: string;
  firstName?: string;
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
  isOrphan?: boolean;
  isNeedy?: boolean;
  currentProgram?: string;
  currentClass?: string;
  currentSection?: string;
  leadSource?: string;
  photoUrl?: string;
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

export const STATUS_DISPLAY: Record<StudentStatus, { label: string; color: string; bg: string; borderColor: string }> = {
  LEAD: { label: 'Lead', color: '#64748b', bg: '#f1f5f9', borderColor: '#e2e8f0' },
  APPLIED: { label: 'Applied', color: '#2563eb', bg: '#eff6ff', borderColor: '#dbeafe' },
  UNDER_REVIEW: { label: 'Under Review', color: '#d97706', bg: '#fffbeb', borderColor: '#fef3c7' },
  ADMITTED: { label: 'Admitted', color: '#7c3aed', bg: '#f5f3ff', borderColor: '#ede9fe' },
  ACTIVE: { label: 'Active', color: '#059669', bg: '#ecfdf5', borderColor: '#d1fae5' },
  PROMOTED: { label: 'Promoted', color: '#0d9488', bg: '#f0fdfa', borderColor: '#ccfbf1' },
  TRANSFERRED: { label: 'Transferred', color: '#4f46e5', bg: '#eef2ff', borderColor: '#e0e7ff' },
  DROPPED: { label: 'Dropped', color: '#dc2626', bg: '#fef2f2', borderColor: '#fee2e2' },
  PASSED_OUT: { label: 'Passed Out', color: '#ea580c', bg: '#fff7ed', borderColor: '#ffedd5' },
  ALUMNI: { label: 'Alumni', color: '#6b7280', bg: '#f9fafb', borderColor: '#f3f4f6' },
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
