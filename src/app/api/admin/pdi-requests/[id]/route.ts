import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db as prisma } from "@/lib/db"
import { sendPDIStatusUpdateEmail } from "@/lib/services/email"

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const body = await req.json()
        const { status, adminNotes, adminMessage } = body

        const allowedStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "ISSUES_FOUND"]
        if (status && !allowedStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 })
        }

        const updatedRequest = await prisma.pDIConfirmationRequest.update({
            where: { id },
            data: {
                status,
                adminNotes,
                adminMessage,
            },
            include: { user: true }
        })

        // Send email status update if status or message changed
        if (status || adminMessage) {
            await sendPDIStatusUpdateEmail(
                updatedRequest.user.email,
                updatedRequest,
                updatedRequest.status,
                adminMessage
            )
        }

        return NextResponse.json({ request: updatedRequest })

    } catch (error) {
        console.error("Error updating PDI request:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
