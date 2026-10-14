import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getShopOwnerContext } from "@/lib/auth/shop-auth"

// GET workshop GPS & geofence settings
export async function GET(request: NextRequest) {
    const ctx = await getShopOwnerContext()
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        let shopId = ctx.shopId
        if (ctx.isAdmin) {
            const { searchParams } = new URL(request.url)
            const queryShopId = searchParams.get("shopId")
            if (queryShopId) shopId = queryShopId
            else {
                const firstShop = await db.shop.findFirst()
                shopId = firstShop?.id || null
            }
        }

        if (!shopId) {
            return NextResponse.json({ error: "No shop found" }, { status: 404 })
        }

        const shop = await db.shop.findUnique({
            where: { id: shopId },
            select: {
                id: true,
                name: true,
                address: true,
                city: true,
                latitude: true,
                longitude: true,
                geofenceRadius: true,
                autoAttendanceEnabled: true,
            }
        })

        if (!shop) {
            return NextResponse.json({ error: "Shop not found" }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            shop
        })
    } catch (error: any) {
        console.error("Error fetching geofence:", error)
        return NextResponse.json({ error: error?.message || "Failed to fetch geofence settings" }, { status: 500 })
    }
}

// PUT update workshop GPS & geofence settings
export async function PUT(request: NextRequest) {
    const ctx = await getShopOwnerContext()
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const body = await request.json()
        const { latitude, longitude, geofenceRadius, autoAttendanceEnabled, shopId: reqShopId } = body

        let targetShopId = ctx.shopId
        if (ctx.isAdmin && reqShopId) {
            targetShopId = reqShopId
        }

        if (!targetShopId) {
            return NextResponse.json({ error: "Shop ID required" }, { status: 400 })
        }

        const lat = latitude !== null && latitude !== undefined ? parseFloat(latitude) : null
        const lng = longitude !== null && longitude !== undefined ? parseFloat(longitude) : null
        const radius = geofenceRadius !== undefined ? Math.max(20, Math.min(5000, parseFloat(geofenceRadius) || 150)) : 150
        const isAutoEnabled = autoAttendanceEnabled !== undefined ? Boolean(autoAttendanceEnabled) : true

        if (lat !== null && (isNaN(lat) || lat < -90 || lat > 90)) {
            return NextResponse.json({ error: "Invalid latitude value" }, { status: 400 })
        }
        if (lng !== null && (isNaN(lng) || lng < -180 || lng > 180)) {
            return NextResponse.json({ error: "Invalid longitude value" }, { status: 400 })
        }

        const updatedShop = await db.shop.update({
            where: { id: targetShopId },
            data: {
                latitude: lat,
                longitude: lng,
                geofenceRadius: radius,
                autoAttendanceEnabled: isAutoEnabled
            },
            select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true,
                geofenceRadius: true,
                autoAttendanceEnabled: true
            }
        })

        return NextResponse.json({
            success: true,
            message: "Workshop location and geofence updated successfully",
            shop: updatedShop
        })
    } catch (error: any) {
        console.error("Error updating geofence:", error)
        return NextResponse.json({ error: error?.message || "Failed to update geofence settings" }, { status: 500 })
    }
}
