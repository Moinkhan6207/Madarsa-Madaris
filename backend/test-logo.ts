import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const settings = await prisma.websiteSettings.findMany({});
  console.log(settings.map(s => s.logoUrl));
  process.exit(0);
}
run();
