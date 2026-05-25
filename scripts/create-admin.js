const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const email = 'admin2@pdi.com';
    const password = 'Admin@1234';
    const name = 'Admin';

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log('Admin already exists with email:', email);
        return;
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashed,
            role: 'ADMIN',
            status: 'APPROVED',
            emailVerified: true,
            mobileVerified: true,
        }
    });
    console.log('Admin created successfully!');
    console.log('Email   :', email);
    console.log('Password:', password);
    console.log('ID      :', user.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
