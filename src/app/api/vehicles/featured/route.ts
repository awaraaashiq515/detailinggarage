import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/vehicles/featured
 * Public endpoint - returns featured, active vehicles from approved dealers
 * with active subscriptions
 */
export async function GET(request: NextRequest) {
    try {
        const now = new Date()

        // Get dealers with active subscriptions that allow featured
        const activeFeaturedSubs = await db.dealerSubscription.findMany({
            where: {
                status: "ACTIVE",
                endDate: { gte: now },
                package: { canFeatureVehicles: true },
            },
            select: { dealerId: true },
        })

        const dealerIds = activeFeaturedSubs.map((s) => s.dealerId)

        const vehicles = await db.dealerVehicle.findMany({
            where: {
                isFeatured: true,
                status: "ACTIVE",
                dealerId: { in: dealerIds },
            },
            include: {
                dealer: {
                    select: {
                        id: true,
                        name: true,
                        dealerBusinessName: true,
                        dealerCity: true,
                        dealerPage: {
                            select: {
                                slug: true
                            }
                        }
                    },
                },
            },
            orderBy: { featuredAt: "desc" },
            take: 12,
        })

        return NextResponse.json({ vehicles })
    } catch (error) {
        console.error("GET /api/vehicles/featured error:", error)
        return NextResponse.json({ error: "Failed to fetch featured vehicles" }, { status: 500 })
    }
}
