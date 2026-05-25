import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'client@gmail.com'
    const password = 'password'
    const hashedPassword = await bcrypt.hash(password, 12)

    console.log(`Creating client user: ${email}...`)

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'CLIENT',
            name: 'Client User'
        },
        create: {
            email,
            password: hashedPassword,
            role: 'CLIENT',
            name: 'Client User'
        }
    })

    console.log('Client user created/updated successfully.')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
