const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({
    where: { tenant: { status: 'PENDING_ACTIVATION' } },
    include: { tenant: true }
  });
  console.log(JSON.stringify(users.map(u => ({ email: u.email, tenant: u.tenant.displayName })), null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
