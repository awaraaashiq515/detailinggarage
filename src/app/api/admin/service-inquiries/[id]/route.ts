import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

// GET /api/admin/service-inquiries/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        const inquiry = await db.serviceInquiry.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true, mobile: true } },
                _count: { select: { messages: true } },
            },
        })

        if (!inquiry) return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })

        return NextResponse.json({ inquiry })
    } catch (error) {
        console.error("GET /api/admin/service-inquiries/[id] error:", error)
        return NextResponse.json({ error: "Failed to fetch inquiry" }, { status: 500 })
    }
}

// PATCH /api/admin/service-inquiries/[id] - update status or adminNotes
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
        const body = await request.json()
        const { status, adminNotes } = body

        const validStatuses = ["PENDING", "IN_PROCESS", "COMPLETED", "REJECTED"]
        if (status && !validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 })
        }

        const inquiry = await db.serviceInquiry.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(adminNotes !== undefined && { adminNotes }),
                updatedAt: new Date(),
            },
        })

        return NextResponse.json({ inquiry, message: "Inquiry updated successfully" })
    } catch (error) {
        console.error("PATCH /api/admin/service-inquiries/[id] error:", error)
        return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 })
    }
}
