import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    try {
        console.log("Checking PDI Models...")

        // List all models on prisma object to see exact names
        const keys = Object.keys(prisma)
        console.log("Prisma keys:", keys.filter(k => !k.startsWith('_') && !k.startsWith('$')))

        const inspections = await (prisma as any).pDIInspection.findMany({
            take: 5,
            select: { id: true, vehicleMake: true }
        })
        console.log("Latest Inspections IDs:", inspections)

        const targetId = "cml6ez8w6000hc14thq3e6wo5"
        const found = await (prisma as any).pDIInspection.findUnique({
            where: { id: targetId }
        })
        console.log("Target ID lookup result:", found ? "Found!" : "NOT FOUND")

    } catch (e) {
        console.error("Error during diagnostic:", e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
