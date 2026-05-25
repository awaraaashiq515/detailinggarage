const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function reset() {
  const hashedPassword = await bcrypt.hash('password', 10);
  
  await prisma.user.update({
    where: { email: 'superadmin@gmail.com' },
    data: { password: hashedPassword }
  });
  console.log('Password forcefully reset to "password" for superadmin@gmail.com');
  
  await prisma.user.update({
    where: { email: 'admin@gmail.com' },
    data: { password: hashedPassword }
  });
  console.log('Password forcefully reset to "password" for admin@gmail.com');
}

reset().catch(console.error).finally(() => prisma.$disconnect());
