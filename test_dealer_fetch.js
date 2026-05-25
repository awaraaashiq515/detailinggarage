
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const dealers = await prisma.user.findMany({
            where: { role: 'DEALER' },
            select: {
                id: true,
                name: true,
                email: true,
                mobile: true,
                dealerBusinessName: true,
                dealerGstNumber: true,
                dealerAddress: true,
                dealerCity: true,
                dealerState: true,
                createdAt: true,
                _count: {
                    select: { dealerVehicles: true, dealerBids: true }
                }
            },
            orderBy: { createdAt: "desc" }
        })
        console.log('DEALERS_FETCH_SUCCESS:', JSON.stringify(dealers, null, 2))
    } catch (error) {
        console.error('DEALERS_FETCH_ERROR:', error)
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect()
    })
