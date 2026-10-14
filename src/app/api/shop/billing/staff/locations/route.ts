import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getShopOwnerContext } from "@/lib/auth/shop-auth"

// GET - Live staff location data for today
export async function GET(request: NextRequest) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        let targetShopId = ctx.shopId

        if (ctx.isAdmin) {
            const queryShopId = searchParams.get("shopId")
            if (queryShopId) targetShopId = queryShopId
        }

        const today = new Date().toISOString().split("T")[0]

        const where: any = { status: "ACTIVE" }
        if (targetShopId) {
            where.shopId = targetShopId
        }

        const staffMembers = await db.shopStaff.findMany({
            where,
            include: {
                attendance: {
                    where: { date: today },
                    take: 1,
                    orderBy: { updatedAt: "desc" }
                },
                jobCards: {
                    where: {
                        status: { in: ["ASSIGNED", "IN_PROGRESS"] }
                    },
                    select: {
                        id: true,
                        jobNumber: true,
                        vehicleName: true,
                        vehicleRegNo: true,
                        clientName: true,
                        status: true,
                        priority: true,
                        jobCategory: true,
                    },
                    take: 1,
                    orderBy: { updatedAt: "desc" }
                }
            },
            orderBy: { name: "asc" }
        })

        // Get shop location for reference
        let shopLocation: { latitude: number | null; longitude: number | null; geofenceRadius: number | null } | null = null
        if (targetShopId) {
            shopLocation = await db.shop.findUnique({
                where: { id: targetShopId },
                select: { latitude: true, longitude: true, geofenceRadius: true }
            })
        } else {
            shopLocation = await db.shop.findFirst({
                select: { latitude: true, longitude: true, geofenceRadius: true }
            })
        }

        const formattedStaff = staffMembers.map(staff => {
            const todayAtt = staff.attendance[0] || null
            const activeJob = staff.jobCards[0] || null

            return {
                id: staff.id,
                name: staff.name,
                phone: staff.phone,
                role: staff.role,
                specialization: staff.specialization,
                // Today's attendance / location data
                todayStatus: todayAtt ? todayAtt.status : "ABSENT",
                checkIn: todayAtt?.checkIn || null,
                checkOut: todayAtt?.checkOut || null,
                punchMethod: todayAtt?.punchMethod || null,
                latitude: todayAtt?.latitude || null,
                longitude: todayAtt?.longitude || null,
                distanceMeters: todayAtt?.distanceMeters || null,
                lastSeen: todayAtt?.updatedAt || null,
                // Current active job
                activeJob: activeJob ? {
                    id: activeJob.id,
                    jobNumber: activeJob.jobNumber,
                    vehicleName: activeJob.vehicleName,
                    vehicleRegNo: activeJob.vehicleRegNo,
                    clientName: activeJob.clientName,
                    status: activeJob.status,
                    priority: activeJob.priority,
                    jobCategory: activeJob.jobCategory,
                } : null,
            }
        })

        return NextResponse.json({
            success: true,
            staff: formattedStaff,
            shopLocation: shopLocation
                ? {
                    latitude: shopLocation.latitude,
                    longitude: shopLocation.longitude,
                    geofenceRadius: shopLocation.geofenceRadius || 200,
                }
                : null,
            updatedAt: new Date().toISOString(),
            date: today,
        })
    } catch (error: any) {
        console.error("Error fetching staff locations:", error)
        return NextResponse.json({ error: error?.message || "Failed to fetch staff locations" }, { status: 500 })
    }
}
