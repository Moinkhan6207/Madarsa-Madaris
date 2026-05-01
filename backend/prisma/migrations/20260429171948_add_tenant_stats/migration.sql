-- CreateTable
CREATE TABLE "TenantStats" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "totalStudents" INTEGER NOT NULL DEFAULT 0,
    "totalTeachers" INTEGER NOT NULL DEFAULT 0,
    "totalLeads" INTEGER NOT NULL DEFAULT 0,
    "totalPages" INTEGER NOT NULL DEFAULT 0,
    "totalBranches" INTEGER NOT NULL DEFAULT 0,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantStats_tenantId_key" ON "TenantStats"("tenantId");

-- CreateIndex
CREATE INDEX "TenantStats_tenantId_idx" ON "TenantStats"("tenantId");

-- AddForeignKey
ALTER TABLE "TenantStats" ADD CONSTRAINT "TenantStats_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
