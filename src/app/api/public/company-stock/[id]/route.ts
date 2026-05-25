import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const vehicle = await db.companyVehicle.findFirst({
            where: {
                id: id,
                status: "AVAILABLE",
                isPublic: true,
            },
            include: {
                company: {
                    select: {
                        name: true,
                        dealerCity: true,
                        dealerState: true,
                        dealerBusinessName: true,
                    }
                },
                _count: {
                    select: { bids: true }
                }
            }
        })

        if (!vehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
        }

        const now = new Date()
        const fortyEightHoursAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000))

        return NextResponse.json({
            vehicle: {
                ...vehicle,
                isNew: new Date(vehicle.createdAt) > fortyEightHoursAgo
            }
        })
    } catch (error) {
        console.error("Public Stock Single API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
