import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

/**
 * GET /api/wishlist/check?vehicleId=...
 * Checks if a specific vehicle is in the current user's wishlist.
 */
export async function GET(req: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ isInWishlist: false })
        }

        const { searchParams } = new URL(req.url)
        const vehicleId = searchParams.get("vehicleId")

        if (!vehicleId) {
            return NextResponse.json({ error: "Vehicle ID is required" }, { status: 400 })
        }

        const existing = await db.wishlist.findUnique({
            where: {
                userId_vehicleId: {
                    userId: user.userId,
                    vehicleId: vehicleId
                }
            }
        })

        return NextResponse.json({ isInWishlist: !!existing })

    } catch (error) {
        console.error("Wishlist check error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
