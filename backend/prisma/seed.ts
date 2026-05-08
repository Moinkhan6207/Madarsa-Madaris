import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const planSeeds = [
  {
    name: 'Free',
    code: 'FREE',
    description: 'Starter plan',
    isActive: true,
  },
  {
    name: 'Basic',
    code: 'BASIC',
    description: 'Basic plan',
    isActive: true,
  },
  {
    name: 'Professional',
    code: 'PRO',
    description: 'Professional plan',
    isActive: true,
  },
  {
    name: 'Enterprise',
    code: 'ENTERPRISE',
    description: 'Enterprise plan',
    isActive: true,
  },
];

const permissionSeeds = [
  { code: 'tenant.create', name: 'Create Tenant' },
  { code: 'tenant.view', name: 'View Tenant' },
  { code: 'tenant.update', name: 'Update Tenant' },
  { code: 'tenant.approve', name: 'Approve Tenant' },
  { code: 'tenant.activate', name: 'Activate Tenant' },
  { code: 'tenant.suspend', name: 'Suspend Tenant' },
  { code: 'tenant.archive', name: 'Archive Tenant' },
  { code: 'institution.profile.view', name: 'View Profile' },
  { code: 'institution.profile.update', name: 'Update Profile' },
  { code: 'tenant.settings.view', name: 'View Settings' },
  { code: 'tenant.settings.update', name: 'Update Settings' },
  { code: 'tenant.branding.view', name: 'View Branding' },
  { code: 'tenant.branding.update', name: 'Update Branding' },
  { code: 'branch.create', name: 'Create Branch' },
  { code: 'branch.view', name: 'View Branch' },
  { code: 'branch.update', name: 'Update Branch' },
  { code: 'session.create', name: 'Create Session' },
  { code: 'session.view', name: 'View Session' },
  { code: 'session.update', name: 'Update Session' },
  { code: 'student.create', name: 'Create Student' },
  { code: 'student.view', name: 'View Student' },
  { code: 'student.update', name: 'Update Student' },
  { code: 'student.delete', name: 'Delete Student' },
  { code: 'student.status.update', name: 'Update Student Status' },
  { code: 'student.guardian.manage', name: 'Manage Student Guardians' },
  { code: 'student.sponsor.manage', name: 'Manage Student Sponsors' },
  { code: 'onboarding.view', name: 'View Onboarding' },
  { code: 'onboarding.update', name: 'Update Onboarding' },
  { code: 'onboarding.finalize', name: 'Finalize Onboarding' },
];

async function main(): Promise<void> {
  const hashedPassword = await bcrypt.hash('password123', 12);

  console.log('Seeding Plans...');
  for (const plan of planSeeds) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    });
  }

  console.log('Seeding Permissions...');
  for (const permission of permissionSeeds) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: permission,
      create: permission,
    });
  }

  console.log('Seeding Global Roles...');
  const roleSeeds = [
    {
      code: 'SUPER_ADMIN',
      name: 'Super Admin',
      description: 'Global platform owner',
      isSystemRole: true,
      permissionCodes: permissionSeeds.map((permission) => permission.code),
    },
    {
      code: 'TENANT_OWNER',
      name: 'Tenant Owner Template',
      description: 'Base role template for Tenant Owners',
      isSystemRole: true,
      permissionCodes: permissionSeeds
        .map((p) => p.code)
        .filter((c) => !['tenant.create', 'tenant.activate', 'tenant.suspend'].includes(c)),
    },
  ];

  for (const roleSeed of roleSeeds) {
    let role = await prisma.role.findFirst({
      where: { code: roleSeed.code, tenantId: null },
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          code: roleSeed.code,
          name: roleSeed.name,
          description: roleSeed.description,
          isSystemRole: roleSeed.isSystemRole,
        },
      });
    } else {
      role = await prisma.role.update({
        where: { id: role.id },
        data: {
          name: roleSeed.name,
          description: roleSeed.description,
          isSystemRole: roleSeed.isSystemRole,
        },
      });
    }

    const permissions = await prisma.permission.findMany({
      where: { code: { in: roleSeed.permissionCodes } },
      select: { id: true },
    });

    // Delete existing links for this role
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    // Recreate links
    await prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({
        roleId: role.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });
  }

  // Create default Super Admin user
  let superAdminRole = await prisma.role.findFirst({
    where: { code: 'SUPER_ADMIN', tenantId: null },
  });

  if (superAdminRole) {
    let superAdminUser = await prisma.user.findFirst({
      where: { email: 'superadmin@system.com', tenantId: null },
    });

    if (!superAdminUser) {
      superAdminUser = await prisma.user.create({
        data: {
          email: 'superadmin@system.com',
          passwordHash: hashedPassword,
          fullName: 'Super Admin',
          isEmailVerified: true,
          isActive: true,
        },
      });
    } else {
      superAdminUser = await prisma.user.update({
        where: { id: superAdminUser.id },
        data: {
          passwordHash: hashedPassword,
        },
      });
    }

    const existingUserRole = await prisma.userRole.findFirst({
      where: {
        userId: superAdminUser.id,
        roleId: superAdminRole.id,
      },
      select: { id: true },
    });

    if (!existingUserRole) {
      await prisma.userRole.create({
        data: {
          userId: superAdminUser.id,
          roleId: superAdminRole.id,
        },
      });
    }
  }

  console.log('Seed complete');
  console.log('Super admin: superadmin@system.com / password123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
