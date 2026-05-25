import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/vehicles
 * Public endpoint to list vehicles with filters
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get("type") // CAR, BIKE
        const make = searchParams.get("make")
        const vehicleModel = searchParams.get("model")
        const minPrice = searchParams.get("minPrice")
        const maxPrice = searchParams.get("maxPrice")
        const minYear = searchParams.get("minYear")
        const maxYear = searchParams.get("maxYear")
        const fuelType = searchParams.get("fuelType")
        const transmission = searchParams.get("transmission")
        const condition = searchParams.get("condition") // "New" or "Used"
        const city = searchParams.get("city")
        const minMileage = searchParams.get("minMileage")
        const maxMileage = searchParams.get("maxMileage")
        const isFeatured = searchParams.get("isFeatured") === "true"

        const now = new Date()

        // Filter for active dealers with active subscriptions
        const activeDealers = await db.dealerSubscription.findMany({
            where: {
                status: "ACTIVE",
                endDate: { gte: now },
            },
            select: { dealerId: true },
        })

        const dealerIds = activeDealers.map(d => d.dealerId)

        const where: any = {
            status: "ACTIVE",
            dealerId: { in: dealerIds },
        }

        if (type) where.vehicleType = type
        if (make) where.make = { contains: make }
        if (vehicleModel) where.model = { contains: vehicleModel }
        if (fuelType) where.fuelType = fuelType
        if (transmission) where.transmission = transmission
        if (city) where.city = { contains: city }
        if (isFeatured) where.isFeatured = true

        // Condition: "New" = First owner, "Used" = anything else
        if (condition === "New") {
            where.ownerType = "First"
        } else if (condition === "Used") {
            where.ownerType = { not: "First" }
        }

        if (minPrice || maxPrice) {
            where.price = {}
            if (minPrice) where.price.gte = parseFloat(minPrice)
            if (maxPrice) where.price.lte = parseFloat(maxPrice)
        }

        if (minYear || maxYear) {
            where.year = {}
            if (minYear) where.year.gte = parseInt(minYear)
            if (maxYear) where.year.lte = parseInt(maxYear)
        }

        if (minMileage || maxMileage) {
            where.mileage = {}
            if (minMileage) where.mileage.gte = parseInt(minMileage)
            if (maxMileage) where.mileage.lte = parseInt(maxMileage)
        }

        const vehicles = await db.dealerVehicle.findMany({
            where,
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
                    }
                }
            },
            orderBy: isFeatured ? { featuredAt: 'desc' } : { createdAt: 'desc' },
            take: 50,
        })

        return NextResponse.json({ vehicles })
    } catch (error) {
        console.error("GET /api/vehicles error:", error)
        return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 })
    }
}
