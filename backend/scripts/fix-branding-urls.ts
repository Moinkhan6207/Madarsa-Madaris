import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🚀 Starting Branding URL Cleanup...');
  
  const brandings = await prisma.tenantBranding.findMany();
  let fixedCount = 0;

  for (const branding of brandings) {
    let updateData: any = {};
    let needsUpdate = false;

    // Fix Logo URL
    if (branding.logoUrl && branding.logoUrl.includes('http')) {
      const parts = branding.logoUrl.split('uploads/');
      if (parts.length > 1) {
        updateData.logoUrl = 'uploads/' + parts[parts.length - 1];
        needsUpdate = true;
      }
    }

    // Fix Cover URL
    if (branding.coverImageUrl && branding.coverImageUrl.includes('http')) {
      const parts = branding.coverImageUrl.split('uploads/');
      if (parts.length > 1) {
        updateData.coverImageUrl = 'uploads/' + parts[parts.length - 1];
        needsUpdate = true;
      }
    }

    // Fix Favicon URL
    if (branding.faviconUrl && branding.faviconUrl.includes('http')) {
      const parts = branding.faviconUrl.split('uploads/');
      if (parts.length > 1) {
        updateData.faviconUrl = 'uploads/' + parts[parts.length - 1];
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      console.log(`✅ Fixing data for tenant: ${branding.tenantId}`);
      await prisma.tenantBranding.update({
        where: { id: branding.id },
        data: updateData,
      });
      fixedCount++;
    }
  }

  console.log(`✨ Cleanup complete! Fixed ${fixedCount} branding records.`);
}

cleanup()
  .catch((e) => {
    console.error('❌ Cleanup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
