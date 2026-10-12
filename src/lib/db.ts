import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function getActiveClient(): PrismaClient {
    if (
        globalForPrisma.prisma &&
        (globalForPrisma.prisma as any).googleReviewSettings &&
        (globalForPrisma.prisma as any).googleReview
    ) {
        return globalForPrisma.prisma
    }

    try {
        // Clear node require cache to load newly generated PrismaClient
        const key = require.resolve("@prisma/client")
        delete require.cache[key]
        const clientPkg = require("@prisma/client")
        const FreshClient = clientPkg.PrismaClient || PrismaClient
        const fresh = new FreshClient({
            log: ["query", "error", "warn"],
        })
        if (process.env.NODE_ENV !== "production") {
            globalForPrisma.prisma = fresh
        }
        return fresh
    } catch {
        const client = new PrismaClient({
            log: ["query", "error", "warn"],
        })
        if (process.env.NODE_ENV !== "production") {
            globalForPrisma.prisma = client
        }
        return client
    }
}

export const db: PrismaClient = new Proxy({} as PrismaClient, {
    get(target, prop, receiver) {
        const client = getActiveClient() as any
        const value = client[prop]
        if (typeof value === "function") {
            return value.bind(client)
        }
        return value
    }
})

if (process.env.NODE_ENV !== "production") {
    getActiveClient()
}

