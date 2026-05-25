import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const adminEmail = 'admin@example.com'
    console.log(`Checking status for ${adminEmail}...`)

    const user = await prisma.user.findUnique({
        where: { email: adminEmail }
    })

    if (!user) {
        console.error('❌ Admin user not found!')
        return
    }

    console.log(`Current status: ${user.status}`)

    if (user.status !== 'APPROVED') {
        console.log('Updating status to APPROVED...')
        await prisma.user.update({
            where: { email: adminEmail },
            data: { status: 'APPROVED' }
        })
        console.log('✅ Status updated successfully!')
    } else {
        console.log('✅ Status is already APPROVED.')
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
