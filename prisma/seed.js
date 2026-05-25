const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Hash passwords
    const hashedPassword = await bcrypt.hash('password', 10)

    // Create Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@gmail.com' },
        update: {},
        create: {
            email: 'admin@gmail.com',
            password: hashedPassword,
            name: 'Admin User',
            role: 'ADMIN',
        },
    })
    console.log('✅ Created admin user:', admin.email)

    // Create Client User
    const client = await prisma.user.upsert({
        where: { email: 'client@gmail.com' },
        update: {},
        create: {
            email: 'client@gmail.com',
            password: hashedPassword,
            name: 'Client User',
            role: 'CLIENT',
        },
    })
    console.log('✅ Created client user:', client.email)

    // Create default system settings
    const settings = await prisma.systemSettings.upsert({
        where: { id: 'default' },
        update: {},
        create: {
            id: 'default',
            packagesEnabled: false, // Packages disabled by default
        },
    })
    console.log('✅ Created system settings (packages disabled)')

    console.log('\n🎉 Seeding completed!')
    console.log('\n📧 Login credentials:')
    console.log('Admin: admin@mail.com / password')
    console.log('Client: client@gmail.com / password')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
