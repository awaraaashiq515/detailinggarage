const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const email = 'company@test.com'
    const password = 'Password123'
    const hashedPassword = await bcrypt.hash(password, 12)

    console.log(`Creating/Updating company user: ${email}...`)

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'COMPANY',
            name: 'Test Company',
            mobile: '9876543210',
            status: 'APPROVED',
            emailVerified: true
        },
        create: {
            email,
            password: hashedPassword,
            role: 'COMPANY',
            name: 'Test Company',
            mobile: '9876543210',
            status: 'APPROVED',
            emailVerified: true
        }
    })

    console.log('Company user created successfully.')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
