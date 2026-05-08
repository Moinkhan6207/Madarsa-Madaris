import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Ensure all student permissions exist
  const studentPermissions = [
    { code: 'student.create', name: 'Create Student' },
    { code: 'student.view', name: 'View Student' },
    { code: 'student.update', name: 'Update Student' },
    { code: 'student.delete', name: 'Delete Student' },
    { code: 'student.status.update', name: 'Update Student Status' },
    { code: 'student.guardian.manage', name: 'Manage Student Guardians' },
    { code: 'student.sponsor.manage', name: 'Manage Student Sponsors' },
  ];

  for (const perm of studentPermissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { name: perm.name },
      create: { code: perm.code, name: perm.name },
    });
  }

  // 2. Add student permissions to system TENANT_OWNER template
  const systemTemplate = await prisma.role.findFirst({
    where: { code: 'TENANT_OWNER', tenantId: null },
    include: { rolePermissions: { include: { permission: true } } },
  });

  if (systemTemplate) {
    const existingCodes = new Set(systemTemplate.rolePermissions.map(rp => rp.permission.code));
    const missingPerms = studentPermissions.filter(p => !existingCodes.has(p.code));

    if (missingPerms.length > 0) {
      const permRecords = await prisma.permission.findMany({
        where: { code: { in: missingPerms.map(p => p.code) } },
      });

      await prisma.rolePermission.createMany({
        data: permRecords.map(p => ({
          roleId: systemTemplate.id,
          permissionId: p.id,
        })),
        skipDuplicates: true,
      });

      console.log(`Added ${missingPerms.length} student permissions to system TENANT_OWNER template`);
    } else {
      console.log('System TENANT_OWNER already has all student permissions');
    }
  } else {
    console.log('System TENANT_OWNER template not found. Creating...');
    const newRole = await prisma.role.create({
      data: {
        code: 'TENANT_OWNER',
        name: 'Tenant Owner Template',
        description: 'Base role template for Tenant Owners',
        isSystemRole: true,
      },
    });

    const allPerms = await prisma.permission.findMany({
      where: { code: { notIn: ['tenant.create', 'tenant.activate', 'tenant.suspend'] } },
    });

    await prisma.rolePermission.createMany({
      data: allPerms.map(p => ({
        roleId: newRole.id,
        permissionId: p.id,
      })),
      skipDuplicates: true,
    });

    console.log(`Created system TENANT_OWNER with ${allPerms.length} permissions`);
  }

  // 3. Propagate to all tenant-specific TENANT_OWNER roles
  const tenantOwnerRoles = await prisma.role.findMany({
    where: { code: 'TENANT_OWNER', tenantId: { not: null } },
    include: { rolePermissions: { include: { permission: true } } },
  });

  let fixedCount = 0;
  for (const role of tenantOwnerRoles) {
    const existingCodes = new Set(role.rolePermissions.map(rp => rp.permission.code));
    const missingCodes = studentPermissions.filter(p => !existingCodes.has(p.code));

    if (missingCodes.length > 0) {
      const permRecords = await prisma.permission.findMany({
        where: { code: { in: missingCodes.map(p => p.code) } },
      });

      await prisma.rolePermission.createMany({
        data: permRecords.map(p => ({
          roleId: role.id,
          permissionId: p.id,
        })),
        skipDuplicates: true,
      });

      fixedCount++;
      console.log(`Fixed role ${role.id} (tenant ${role.tenantId}) - added ${missingCodes.length} permissions`);
    }
  }

  console.log(`\nDone! Fixed ${fixedCount} tenant roles.`);
  console.log('Please log out and log back in for permission changes to take effect.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
