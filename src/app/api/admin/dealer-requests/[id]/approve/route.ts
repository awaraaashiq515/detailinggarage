import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"

/**
 * PATCH /api/admin/dealer-requests/[id]/approve
 * Approve a pending dealer application
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        const dealer = await db.user.findFirst({
            where: { id, role: "DEALER" },
        })

        if (!dealer) {
            return NextResponse.json({ error: "Dealer not found" }, { status: 404 })
        }

        const updated = await db.user.update({
            where: { id },
            data: { status: "APPROVED" },
        })

        return NextResponse.json({
            message: "Dealer approved successfully",
            dealer: { id: updated.id, name: updated.name, status: updated.status },
        })
    } catch (error) {
        console.error("PATCH /api/admin/dealer-requests/[id]/approve error:", error)
        return NextResponse.json({ error: "Failed to approve dealer" }, { status: 500 })
    }
}
