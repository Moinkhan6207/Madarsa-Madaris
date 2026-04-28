const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAboutPage() {
  const tenantId = '20eb8211-c506-4090-b180-7b2d23eee208';
  const pageSlug = 'about';

  console.log(`Fixing About page for tenant ${tenantId}...`);

  const page = await prisma.page.findFirst({
    where: { tenantId, slug: pageSlug }
  });

  if (!page) {
    console.error('Page not found!');
    return;
  }

  console.log(`Found page: ${page.title} (ID: ${page.id})`);

  // Delete existing blocks
  await prisma.pageBlock.deleteMany({
    where: { pageId: page.id }
  });

  // Create blocks manually
  await prisma.pageBlock.create({
    data: {
      pageId: page.id,
      tenantId,
      type: 'about',
      order: 0,
      content: {
        en: {
          title: "Our Noble Mission",
          description: "Established with the vision of nurturing scholars who serve the Ummah with wisdom and faith.",
          imageUrl: ""
        }
      },
      config: {}
    }
  });

  console.log('Successfully added About block to DB.');
}

fixAboutPage()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
