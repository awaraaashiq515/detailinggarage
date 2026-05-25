import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { vehicleId, customerName, customerMobile, message } = body

        if (!vehicleId || !customerName || !customerMobile) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Verify vehicle exists and get dealerId
        const vehicle = await db.dealerVehicle.findUnique({
            where: { id: vehicleId },
            select: { dealerId: true }
        })

        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
        }

        // Check if client is logged in — link userId if available
        let userId: string | null = null
        try {
            const currentUser = await getCurrentUser()
            if (currentUser && currentUser.role === "CLIENT") {
                userId = currentUser.userId
            }
        } catch {
            // Anonymous submission — that's fine
        }

        // Use raw SQL INSERT so we can write userId without needing prisma generate
        const inquiryId = randomUUID()
        const now = new Date().toISOString()

        await db.$executeRaw`
            INSERT INTO "Inquiry" ("id", "vehicleId", "dealerId", "userId", "customerName", "customerMobile", "message", "status", "adminNotes", "createdAt", "updatedAt")
            VALUES (${inquiryId}, ${vehicleId}, ${vehicle.dealerId}, ${userId}, ${customerName}, ${customerMobile}, ${message || null}, 'PENDING', NULL, ${now}, ${now})
        `

        return NextResponse.json({ inquiry: { id: inquiryId }, message: "Inquiry sent successfully" }, { status: 201 })
    } catch (error) {
        console.error("POST /api/inquiries error:", error)
        return NextResponse.json({ error: "Failed to send inquiry" }, { status: 500 })
    }
}
