const { PrismaClient } = require('@prisma/client');
const { CmsService } = require('../modules/cms/services/cms.service');
const prisma = new PrismaClient();
const cmsService = new CmsService(prisma);

async function bootstrapTenant() {
  const tenantId = '20eb8211-c506-4090-b180-7b2d23eee208';
  console.log(`Bootstrapping website for tenant ${tenantId}...`);
  
  const result = await cmsService.bootstrapWebsite(tenantId);
  console.log('Result:', result);
}

bootstrapTenant()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
