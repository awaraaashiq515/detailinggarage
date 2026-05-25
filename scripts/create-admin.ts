import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@gmail.com'
    const password = 'password'
    // Use 12 rounds to match registration logic exactly
    const hashedPassword = await bcrypt.hash(password, 12)

    console.log(`Re-creating admin user with 12 rounds: ${email}...`)

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
            name: 'Admin'
        },
        create: {
            email,
            password: hashedPassword,
            role: 'ADMIN',
            name: 'Admin'
        }
    })

    console.log('Admin user updated successfully with 12 rounds.')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
