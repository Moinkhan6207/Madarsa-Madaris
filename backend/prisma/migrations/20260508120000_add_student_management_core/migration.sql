-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM (
  'LEAD',
  'APPLIED',
  'UNDER_REVIEW',
  'ADMITTED',
  'ACTIVE',
  'PROMOTED',
  'TRANSFERRED',
  'DROPPED',
  'PASSED_OUT',
  'ALUMNI'
);

-- CreateEnum
CREATE TYPE "StudentGuardianRelation" AS ENUM (
  'FATHER',
  'MOTHER',
  'BROTHER',
  'SISTER',
  'UNCLE',
  'AUNT',
  'GRANDPARENT',
  'SPOUSE',
  'OTHER'
);

-- CreateEnum
CREATE TYPE "StudentHistoryEvent" AS ENUM (
  'CREATED',
  'STATUS_CHANGED',
  'PROFILE_UPDATED',
  'BRANCH_CHANGED',
  'SESSION_CHANGED',
  'PROGRAM_CHANGED',
  'CLASS_CHANGED',
  'GUARDIAN_ADDED',
  'GUARDIAN_UPDATED',
  'GUARDIAN_REMOVED',
  'SPONSOR_LINKED',
  'SPONSOR_UNLINKED',
  'SOFT_DELETED'
);

-- CreateTable
CREATE TABLE "Student" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "academicSessionId" TEXT,
  "admissionNumber" TEXT NOT NULL,
  "rollNumber" TEXT,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT,
  "fullName" TEXT NOT NULL,
  "gender" TEXT,
  "dateOfBirth" TIMESTAMP(3),
  "admissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "phone" TEXT,
  "email" TEXT,
  "addressLine1" TEXT,
  "addressLine2" TEXT,
  "city" TEXT,
  "state" TEXT,
  "country" TEXT,
  "postalCode" TEXT,
  "status" "StudentStatus" NOT NULL DEFAULT 'LEAD',
  "isOrphan" BOOLEAN NOT NULL DEFAULT false,
  "isNeedy" BOOLEAN NOT NULL DEFAULT false,
  "isSponsored" BOOLEAN NOT NULL DEFAULT false,
  "currentProgram" TEXT,
  "currentClass" TEXT,
  "leadSource" TEXT,
  "notes" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentGuardian" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "relation" "StudentGuardianRelation" NOT NULL,
  "fullName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "alternatePhone" TEXT,
  "email" TEXT,
  "occupation" TEXT,
  "addressLine1" TEXT,
  "addressLine2" TEXT,
  "city" TEXT,
  "state" TEXT,
  "country" TEXT,
  "postalCode" TEXT,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "notes" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "StudentGuardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sponsor" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  "organization" TEXT,
  "notes" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentSponsor" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "sponsorId" TEXT NOT NULL,
  "supportLabel" TEXT,
  "amount" DECIMAL(12,2),
  "currencyCode" TEXT DEFAULT 'INR',
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "notes" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "StudentSponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentHistory" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "event" "StudentHistoryEvent" NOT NULL,
  "fieldName" TEXT,
  "oldValue" JSONB,
  "newValue" JSONB,
  "metadata" JSONB,
  "changedBy" TEXT,
  "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "StudentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_tenantId_admissionNumber_key" ON "Student"("tenantId", "admissionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Student_tenantId_rollNumber_key" ON "Student"("tenantId", "rollNumber");

-- CreateIndex
CREATE INDEX "Student_tenantId_status_deletedAt_createdAt_idx" ON "Student"("tenantId", "status", "deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "Student_tenantId_branchId_status_deletedAt_idx" ON "Student"("tenantId", "branchId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "Student_tenantId_academicSessionId_deletedAt_idx" ON "Student"("tenantId", "academicSessionId", "deletedAt");

-- CreateIndex
CREATE INDEX "Student_tenantId_fullName_idx" ON "Student"("tenantId", "fullName");

-- CreateIndex
CREATE INDEX "Student_tenantId_phone_idx" ON "Student"("tenantId", "phone");

-- CreateIndex
CREATE INDEX "Student_tenantId_isOrphan_isSponsored_isNeedy_idx" ON "Student"("tenantId", "isOrphan", "isSponsored", "isNeedy");

-- CreateIndex
CREATE INDEX "Student_branchId_idx" ON "Student"("branchId");

-- CreateIndex
CREATE INDEX "StudentGuardian_tenantId_studentId_deletedAt_idx" ON "StudentGuardian"("tenantId", "studentId", "deletedAt");

-- CreateIndex
CREATE INDEX "StudentGuardian_tenantId_phone_idx" ON "StudentGuardian"("tenantId", "phone");

-- CreateIndex
CREATE INDEX "StudentGuardian_studentId_isPrimary_deletedAt_idx" ON "StudentGuardian"("studentId", "isPrimary", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Sponsor_tenantId_name_phone_key" ON "Sponsor"("tenantId", "name", "phone");

-- CreateIndex
CREATE INDEX "Sponsor_tenantId_deletedAt_idx" ON "Sponsor"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "Sponsor_tenantId_name_idx" ON "Sponsor"("tenantId", "name");

-- CreateIndex
CREATE INDEX "StudentSponsor_tenantId_studentId_deletedAt_idx" ON "StudentSponsor"("tenantId", "studentId", "deletedAt");

-- CreateIndex
CREATE INDEX "StudentSponsor_tenantId_sponsorId_deletedAt_idx" ON "StudentSponsor"("tenantId", "sponsorId", "deletedAt");

-- CreateIndex
CREATE INDEX "StudentSponsor_tenantId_studentId_sponsorId_deletedAt_idx" ON "StudentSponsor"("tenantId", "studentId", "sponsorId", "deletedAt");

-- CreateIndex
CREATE INDEX "StudentHistory_tenantId_studentId_changedAt_idx" ON "StudentHistory"("tenantId", "studentId", "changedAt");

-- CreateIndex
CREATE INDEX "StudentHistory_tenantId_event_changedAt_idx" ON "StudentHistory"("tenantId", "event", "changedAt");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGuardian" ADD CONSTRAINT "StudentGuardian_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGuardian" ADD CONSTRAINT "StudentGuardian_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSponsor" ADD CONSTRAINT "StudentSponsor_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSponsor" ADD CONSTRAINT "StudentSponsor_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSponsor" ADD CONSTRAINT "StudentSponsor_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentHistory" ADD CONSTRAINT "StudentHistory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentHistory" ADD CONSTRAINT "StudentHistory_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
