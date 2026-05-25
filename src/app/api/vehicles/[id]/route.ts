import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const vehicle = await db.dealerVehicle.findUnique({
            where: { id },
            include: {
                dealer: {
                    select: {
                        name: true,
                        dealerBusinessName: true,
                        dealerCity: true,
                        dealerState: true,
                        dealerPage: {
                            select: {
                                slug: true
                            }
                        }
                    }
                }
            }
        })

        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
        }

        // Increment views
        await db.dealerVehicle.update({
            where: { id },
            data: { views: { increment: 1 } }
        })

        return NextResponse.json({ vehicle })
    } catch (error) {
        console.error("GET /api/vehicles/[id] error:", error)
        return NextResponse.json({ error: "Failed to fetch vehicle" }, { status: 500 })
    }
}
