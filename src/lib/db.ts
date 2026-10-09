import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// If cached dev instance does not have the updated models (like facebookSettings, shop, shopBillingProfile), refresh it
if (globalForPrisma.prisma && (!(globalForPrisma.prisma as any).facebookSettings || !(globalForPrisma.prisma as any).shop || !(globalForPrisma.prisma as any).shopBillingProfile)) {
    globalForPrisma.prisma = undefined
}

export const db: PrismaClient =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ["query", "error", "warn"],
    })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
