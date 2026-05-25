const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding users for all roles...')

    const hashedPassword = await bcrypt.hash('password', 10)

    const roles = [
        { email: 'superadmin@gmail.com', name: 'Super Admin', role: 'SUPER_ADMIN' },
        { email: 'admin@gmail.com', name: 'Admin User', role: 'ADMIN' },
        { email: 'client@gmail.com', name: 'Client User', role: 'CLIENT' },
        { email: 'dealer@gmail.com', name: 'Dealer User', role: 'DEALER' },
        { email: 'agent@gmail.com', name: 'Agent User', role: 'AGENT' }
    ]

    for (const user of roles) {
        const createdUser = await prisma.user.upsert({
            where: { email: user.email },
            update: {
                status: 'APPROVED',
                kycStatus: user.role === 'DEALER' ? 'APPROVED' : undefined
            },
            create: {
                email: user.email,
                password: hashedPassword,
                name: user.name,
                role: user.role,
                status: 'APPROVED',
                kycStatus: user.role === 'DEALER' ? 'APPROVED' : 'NOT_SUBMITTED'
            },
        })
        console.log(`✅ ${user.role} user: ${createdUser.email}`)
    }

    console.log('\n🎉 DONE!')
    console.log('\nLogin credentials for all:')
    console.log('Password: password')
}

main()
    .catch((e) => {
        console.error('❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
