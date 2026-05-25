import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    try {
        console.log("Testing DB connection...")
        console.log("DATABASE_URL:", process.env.DATABASE_URL)
        const count = await prisma.user.count()
        console.log("Connection SUCCESS! User count:", count)
    } catch (e) {
        console.error("Connection FAILED:", e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
