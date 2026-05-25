import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const inspections = await prisma.pDIInspection.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            userId: true,
            customerEmail: true,
            vehicleMake: true,
            vehicleModel: true,
            createdAt: true
        }
    })

    console.log('Recent Inspections:', JSON.stringify(inspections, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
