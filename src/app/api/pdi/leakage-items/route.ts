import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET /api/pdi/leakage-items - Fetch all leakage inspection items
export async function GET() {
    try {
        const leakageItems = await prisma.pDILeakageItem.findMany({
            orderBy: { order: 'asc' }
        })

        return NextResponse.json(leakageItems)
    } catch (error) {
        console.error("Error fetching leakage items:", error)
        return NextResponse.json(
            { error: "Failed to fetch leakage items" },
            { status: 500 }
        )
    }
}
