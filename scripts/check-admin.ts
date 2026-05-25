import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function check() {
    const email = 'admin@gmail.com'
    const password = 'password'

    console.log(`Checking user: ${email}...`)
    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        console.log('User NOT found in database!')
        return
    }

    console.log('User found:', {
        id: user.id,
        email: user.email,
        role: user.role,
        passwordHash: user.password
    })

    const isMatch = await bcrypt.compare(password, user.password)
    console.log('Password match check:', isMatch ? 'SUCCESS' : 'FAILURE')
}

check()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
