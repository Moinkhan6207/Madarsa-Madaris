const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('password123', 12);
  await prisma.user.updateMany({
    where: { email: 'mdmainuddin1289@gmail.com' },
    data: { passwordHash: hash }
  });
  console.log('Password updated to password123');
}
main().catch(console.error).finally(() => prisma.$disconnect());
