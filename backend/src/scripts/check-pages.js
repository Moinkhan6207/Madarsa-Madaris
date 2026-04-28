const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPages() {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: 'darul-huda' }
  });

  if (!tenant) {
    console.log('Tenant not found');
    return;
  }

  const pages = await prisma.page.findMany({
    where: { tenantId: tenant.id, deletedAt: null },
    include: { blocks: true }
  });

  console.log(JSON.stringify(pages, null, 2));
}

checkPages().catch(console.error).finally(() => prisma.$disconnect());
