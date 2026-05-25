import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

/**
 * GET /api/wishlist
 * Returns the current user's wishlist with car details.
 */
export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        const wishlist = await db.wishlist.findMany({
            where: { userId: user.userId },
            include: {
                vehicle: {
                    include: {
                        dealer: {
                            select: {
                                name: true,
                                dealerBusinessName: true,
                                dealerCity: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ wishlist })
    } catch (error) {
        console.error("Wishlist GET error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

/**
 * POST /api/wishlist
 * Toggles a vehicle in the wishlist for the current user.
 */
export async function POST(req: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        const { vehicleId } = await req.json()
        if (!vehicleId) {
            return NextResponse.json({ error: "Vehicle ID is required" }, { status: 400 })
        }

        // Check if already in wishlist
        const existing = await db.wishlist.findUnique({
            where: {
                userId_vehicleId: {
                    userId: user.userId,
                    vehicleId: vehicleId
                }
            }
        })

        if (existing) {
            // Remove from wishlist
            await db.wishlist.delete({
                where: { id: existing.id }
            })
            return NextResponse.json({ status: "removed" })
        } else {
            // Add to wishlist
            await db.wishlist.create({
                data: {
                    userId: user.userId,
                    vehicleId: vehicleId
                }
            })
            return NextResponse.json({ status: "added" })
        }

    } catch (error) {
        console.error("Wishlist POST error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
