const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    select: { email: true, password: true, role: true }
  });
  console.log('Users found:', users.map(u => u.email));
  
  const superAdmin = users.find(u => u.email === 'superadmin@gmail.com');
  if (superAdmin) {
    const match = await bcrypt.compare('password', superAdmin.password);
    console.log('Password match for superadmin@gmail.com with "password":', match);
  } else {
    console.log('superadmin@gmail.com not found in DB!');
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
