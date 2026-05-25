import { NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/vehicles/filters
 * Returns distinct filter values from active vehicle listings
 * for populating search dropdown options dynamically.
 */
export async function GET() {
    try {
        const now = new Date()

        // Get active dealer IDs
        const activeDealers = await db.dealerSubscription.findMany({
            where: {
                status: "ACTIVE",
                endDate: { gte: now },
            },
            select: { dealerId: true },
        })

        const dealerIds = activeDealers.map(d => d.dealerId)

        const baseWhere = {
            status: "ACTIVE",
            dealerId: { in: dealerIds },
            vehicleType: "CAR",
        }

        // Fetch all active vehicle records with only the fields we need
        const vehicles = await db.dealerVehicle.findMany({
            where: baseWhere,
            select: {
                make: true,
                model: true,
                year: true,
                fuelType: true,
                transmission: true,
                city: true,
                ownerType: true,
            },
        })

        // Extract distinct values
        const makesSet = new Set<string>()
        const modelsMap = new Map<string, Set<string>>() // make -> models
        const yearsSet = new Set<number>()
        const fuelTypesSet = new Set<string>()
        const transmissionsSet = new Set<string>()
        const citiesSet = new Set<string>()

        for (const v of vehicles) {
            if (v.make) {
                makesSet.add(v.make)
                if (v.model) {
                    if (!modelsMap.has(v.make)) modelsMap.set(v.make, new Set())
                    modelsMap.get(v.make)!.add(v.model)
                }
            }
            if (v.year) yearsSet.add(v.year)
            if (v.fuelType) fuelTypesSet.add(v.fuelType)
            if (v.transmission) transmissionsSet.add(v.transmission)
            if (v.city) citiesSet.add(v.city)
        }

        // Convert to sorted arrays
        const makes = Array.from(makesSet).sort()
        const modelsByMake: Record<string, string[]> = {}
        for (const [make, models] of modelsMap) {
            modelsByMake[make] = Array.from(models).sort()
        }
        const years = Array.from(yearsSet).sort((a, b) => b - a) // newest first
        const fuelTypes = Array.from(fuelTypesSet).sort()
        const transmissions = Array.from(transmissionsSet).sort()
        const cities = Array.from(citiesSet).sort()

        return NextResponse.json({
            makes,
            modelsByMake,
            years,
            fuelTypes,
            transmissions,
            cities,
            conditions: ["New", "Used"], // static options
        })
    } catch (error) {
        console.error("GET /api/vehicles/filters error:", error)
        return NextResponse.json({ error: "Failed to fetch filters" }, { status: 500 })
    }
}
