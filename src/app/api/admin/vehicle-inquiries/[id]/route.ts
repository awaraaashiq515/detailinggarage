import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"

/**
 * GET  /api/admin/vehicle-inquiries/[id]  — full inquiry + all chat messages
 * PATCH /api/admin/vehicle-inquiries/[id] — update status / adminNotes
 */
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

        const rows = await db.$queryRaw<any[]>`
            SELECT
                i.id, i.customerName, i.customerMobile, i.message,
                i.status, i.adminNotes, i.createdAt, i.updatedAt, i.userId,
                v.id AS vehicleId, v.title AS vehicleTitle, v.make AS vehicleMake,
                v.model AS vehicleModel, v.price AS vehiclePrice, v.images AS vehicleImages,
                d.id AS dealerId, d.name AS dealerName, d.dealerBusinessName,
                d.dealerCity, d.mobile AS dealerMobile
            FROM Inquiry i
            JOIN DealerVehicle v ON i.vehicleId = v.id
            JOIN User d ON i.dealerId = d.id
            WHERE i.id = ${id}
            LIMIT 1
        `

        if (!rows || rows.length === 0) {
            return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })
        }

        const inq = rows[0]

        const messages = await db.$queryRaw<any[]>`
            SELECT id, senderType, senderId, message, createdAt
            FROM InquiryMessage
            WHERE inquiryId = ${id}
            ORDER BY createdAt ASC
        `

        const inquiry = {
            id: inq.id,
            customerName: inq.customerName,
            customerMobile: inq.customerMobile,
            message: inq.message,
            status: inq.status,
            adminNotes: inq.adminNotes,
            createdAt: inq.createdAt,
            userId: inq.userId,
            vehicle: {
                id: inq.vehicleId,
                title: inq.vehicleTitle,
                make: inq.vehicleMake,
                model: inq.vehicleModel,
                price: inq.vehiclePrice,
                images: inq.vehicleImages,
            },
            dealer: {
                id: inq.dealerId,
                name: inq.dealerName,
                businessName: inq.dealerBusinessName,
                city: inq.dealerCity,
                mobile: inq.dealerMobile,
            },
        }

        return NextResponse.json({ inquiry, messages })
    } catch (error) {
        console.error("GET /api/admin/vehicle-inquiries/[id] error:", error)
        return NextResponse.json({ error: "Failed to fetch inquiry" }, { status: 500 })
    }
}

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

        const validStatuses = ["PENDING", "CONTACTED", "CLOSED", "SPAM"]
        if (status && !validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 })
        }

        const now = new Date().toISOString()
        const check = await db.$queryRaw<any[]>`SELECT id FROM Inquiry WHERE id = ${id} LIMIT 1`
        if (!check || check.length === 0) {
            return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })
        }

        if (status !== undefined && adminNotes !== undefined) {
            await db.$executeRaw`UPDATE Inquiry SET status=${status}, adminNotes=${adminNotes}, updatedAt=${now} WHERE id=${id}`
        } else if (status !== undefined) {
            await db.$executeRaw`UPDATE Inquiry SET status=${status}, updatedAt=${now} WHERE id=${id}`
        } else if (adminNotes !== undefined) {
            await db.$executeRaw`UPDATE Inquiry SET adminNotes=${adminNotes}, updatedAt=${now} WHERE id=${id}`
        }

        return NextResponse.json({ message: "Updated successfully" })
    } catch (error) {
        console.error("PATCH /api/admin/vehicle-inquiries/[id] error:", error)
        return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 })
    }
}
