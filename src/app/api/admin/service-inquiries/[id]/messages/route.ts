import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

// GET /api/admin/service-inquiries/[id]/messages
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
                user: { select: { id: true, name: true, email: true } },
            },
        })
        if (!inquiry) return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })

        const messages = await db.chatMessage.findMany({
            where: { inquiryId: id },
            orderBy: { createdAt: "asc" },
        })

        return NextResponse.json({ messages, inquiry })
    } catch (error) {
        console.error("GET admin messages error:", error)
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }
}

// POST /api/admin/service-inquiries/[id]/messages - send message as ADMIN
export async function POST(
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
        const { message } = body

        if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 })

        const inquiry = await db.serviceInquiry.findUnique({ where: { id } })
        if (!inquiry) return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })

        const chatMessage = await db.chatMessage.create({
            data: {
                inquiryId: id,
                senderType: "ADMIN",
                senderId: user.userId,
                message: message.trim(),
            },
        })

        return NextResponse.json({ message: chatMessage }, { status: 201 })
    } catch (error) {
        console.error("POST admin message error:", error)
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }
}
