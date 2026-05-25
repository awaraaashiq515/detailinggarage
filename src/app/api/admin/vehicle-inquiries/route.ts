import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"

/**
 * GET /api/admin/vehicle-inquiries
 * Returns all vehicle inquiries (all dealers, all clients) for admin overview.
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get("status")
        const search = searchParams.get("search")?.toLowerCase() || ""

        let whereClause = ""
        const conditions: string[] = []
        if (status && status !== "ALL") conditions.push(`i.status = '${status}'`)
        if (whereClause || conditions.length) whereClause = "WHERE " + conditions.join(" AND ")

        const rows = await db.$queryRaw<any[]>`
            SELECT
                i.id, i.customerName, i.customerMobile, i.message,
                i.status, i.adminNotes, i.createdAt, i.updatedAt,
                v.id AS vehicleId, v.title AS vehicleTitle, v.make AS vehicleMake,
                v.model AS vehicleModel, v.price AS vehiclePrice, v.images AS vehicleImages,
                d.id AS dealerId, d.name AS dealerName, d.dealerBusinessName, d.dealerCity
            FROM Inquiry i
            JOIN DealerVehicle v ON i.vehicleId = v.id
            JOIN User d ON i.dealerId = d.id
            ORDER BY i.createdAt DESC
        `

        const inquiries = rows
            .filter(r => {
                if (status && status !== "ALL" && r.status !== status) return false
                if (search) {
                    const haystack = `${r.customerName} ${r.customerMobile} ${r.vehicleTitle} ${r.dealerName} ${r.dealerBusinessName || ""}`.toLowerCase()
                    if (!haystack.includes(search)) return false
                }
                return true
            })
            .map(r => ({
                id: r.id,
                customerName: r.customerName,
                customerMobile: r.customerMobile,
                message: r.message,
                status: r.status,
                adminNotes: r.adminNotes,
                createdAt: r.createdAt,
                vehicle: {
                    id: r.vehicleId,
                    title: r.vehicleTitle,
                    make: r.vehicleMake,
                    model: r.vehicleModel,
                    price: r.vehiclePrice,
                    images: r.vehicleImages,
                },
                dealer: {
                    id: r.dealerId,
                    name: r.dealerName,
                    businessName: r.dealerBusinessName,
                    city: r.dealerCity,
                },
            }))

        return NextResponse.json({ inquiries })
    } catch (error) {
        console.error("GET /api/admin/vehicle-inquiries error:", error)
        return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 })
    }
}
