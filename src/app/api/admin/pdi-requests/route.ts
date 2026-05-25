import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db as prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const requests = await prisma.pDIConfirmationRequest.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        mobile: true
                    }
                }
            }
        })

        return NextResponse.json({ requests })
    } catch (error) {
        console.error("Error fetching admin PDI requests:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
