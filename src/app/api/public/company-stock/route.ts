import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
    try {
        const vehicles = await db.companyVehicle.findMany({
            where: {
                status: "AVAILABLE",
                isPublic: true
            },
            select: {
                id: true,
                title: true,
                make: true,
                model: true,
                year: true,
                variant: true,
                vehicleType: true,
                fuelType: true,
                transmission: true,
                bodyType: true,
                color: true,
                mileage: true,
                basePrice: true,
                fixedPrice: true,
                bidDeadline: true,
                sellingMode: true,
                isFeatured: true,
                images: true,
                createdAt: true,
                city: true,
                state: true
            },
            orderBy: [
                { isFeatured: "desc" },
                { createdAt: "desc" }
            ]
        })

        // Add "isNew" flag (created within last 48 hours)
        const now = new Date()
        const fortyEightHoursAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000))

        const enhancedVehicles = vehicles.map(v => ({
            ...v,
            isNew: new Date(v.createdAt) > fortyEightHoursAgo
        }))

        return NextResponse.json({ vehicles: enhancedVehicles })
    } catch (error) {
        console.error("Public Stock API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
