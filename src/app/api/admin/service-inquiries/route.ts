import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

// GET /api/admin/service-inquiries - list all service inquiries (admin)
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get("status")

        const inquiries = await db.serviceInquiry.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { id: true, name: true, email: true, mobile: true } },
                _count: { select: { messages: true } },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
        })

        return NextResponse.json({ inquiries })
    } catch (error) {
        console.error("GET /api/admin/service-inquiries error:", error)
        return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 })
    }
}
