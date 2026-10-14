import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function hasRequiredFields(client: any): boolean {
    if (!client) return false
    const fields = client._runtimeDataModel?.models?.InsuranceClaim?.fields || []
    const hasSurveyor = Array.isArray(fields) && fields.some((f: any) => f.name === "surveyorEmail")
    return (
        hasSurveyor &&
        Boolean(client.shopStaff) &&
        Boolean(client.googleReviewSettings) &&
        Boolean(client.googleReview)
    )
}

function getActiveClient(): PrismaClient {
    if (globalForPrisma.prisma && hasRequiredFields(globalForPrisma.prisma)) {
        return globalForPrisma.prisma
    }

    try {
        if (typeof require !== "undefined" && require.cache) {
            Object.keys(require.cache).forEach(k => {
                if (k.includes("@prisma") || k.includes(".prisma")) {
                    delete require.cache[k]
                }
            })
        }
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

