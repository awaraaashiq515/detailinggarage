import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"

/**
 * GET /api/admin/dealer-requests
 * Returns all users with role=DEALER and status=PENDING
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const dealers = await db.user.findMany({
            where: { role: "DEALER", status: "PENDING" },
            select: {
                id: true,
                name: true,
                email: true,
                mobile: true,
                status: true,
                createdAt: true,
                dealerBusinessName: true,
                dealerGstNumber: true,
                dealerCity: true,
                dealerState: true,
                dealerBankName: true,
                dealerAccountNum: true,
                dealerIfscCode: true,
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ dealers })
    } catch (error) {
        console.error("GET /api/admin/dealer-requests error:", error)
        return NextResponse.json({ error: "Failed to fetch dealer requests" }, { status: 500 })
    }
}
