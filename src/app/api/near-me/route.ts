import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { NEAR_ME_CATEGORIES } from "@/lib/near-me-categories"

export const dynamic = "force-dynamic"

const SEED_LISTINGS = [
    {
        name: "Detailing Garage Car Care Studio",
        category: "detailing",
        categoryLabel: "Detailing centre near me",
        city: "Mandi",
        area: "Gutkar, NH-21",
        address: "NH-21, Gutkar, Mandi, Himachal Pradesh 175021",
        phone: "+91 86794 00014",
        whatsapp: "918679400014",
        mapsUrl: "https://g.page/r/detailinggarage",
        rating: 4.9,
        reviewsCount: 142,
        isVerified: true,
        isActive: true,
        services: "Ceramic Coating, Graphene, TPU PPF, 100+ Point PDI, Denting & Painting, Sound Proofing"
    },
    {
        name: "Detailing Garage PDI & Auto Spa",
        category: "car-wash",
        categoryLabel: "Car wash near me",
        city: "Mandi",
        area: "Gutkar, Near Bus Stand",
        address: "Near Old Checkpost, Gutkar, Mandi, HP 175021",
        phone: "+91 86798 00074",
        whatsapp: "918679800074",
        mapsUrl: "https://g.page/r/detailinggarage",
        rating: 4.8,
        reviewsCount: 88,
        isVerified: true,
        isActive: true,
        services: "Snow Foam Wash, Deep Interior Detailing, Underbody Anti-Rust Wash, Steam Cleaning"
    },
    {
        name: "Himalayan 24x7 Towing & RSA Rescue",
        category: "towing",
        categoryLabel: "Towing near me",
        city: "Mandi",
        area: "Nerchowk Highway",
        address: "NH-21 Bypass, Nerchowk, Mandi, HP 175008",
        phone: "+91 98160 36880",
        whatsapp: "919816036880",
        mapsUrl: "https://maps.google.com/?q=Detailing+Garage+Mandi",
        rating: 4.9,
        reviewsCount: 64,
        isVerified: true,
        isActive: true,
        services: "Flatbed Hydraulic Towing, Crane Recovery, Accidental Winching, Highway Rescue 24x7"
    },
    {
        name: "Apex Multi-Brand Car Care Workshop",
        category: "garages",
        categoryLabel: "Garages near me",
        city: "Sundernagar",
        area: "BBMB Colony",
        address: "Near BBMB Lake, Sundernagar, Mandi, HP 175019",
        phone: "+91 86794 00014",
        whatsapp: "918679400014",
        mapsUrl: "https://maps.google.com/?q=Sundernagar+Car+Care",
        rating: 4.7,
        reviewsCount: 52,
        isVerified: true,
        isActive: true,
        services: "Periodic Service, Suspension Overhaul, Brake Lathe, AC Gas Charging, Engine Diagnostics"
    },
    {
        name: "Tricity High-Voltage EV Hub",
        category: "ev-service",
        categoryLabel: "EV service near me",
        city: "Chandigarh Tricity",
        area: "Industrial Area Phase 2",
        address: "Plot 182, Industrial Area Phase 2, Chandigarh 160002",
        phone: "+91 86798 00074",
        whatsapp: "918679800074",
        mapsUrl: "https://maps.google.com/?q=Chandigarh+EV+Hub",
        rating: 4.9,
        reviewsCount: 45,
        isVerified: true,
        isActive: true,
        services: "DC Fast Charging, EV BMS Diagnostics, Battery Health Check, Motor Controller Repairs"
    },
    {
        name: "Valley Express RSA & On-Spot Repair",
        category: "rsa",
        categoryLabel: "RSA near me",
        city: "Kullu",
        area: "Bhuntar Airport Road",
        address: "Bhuntar, Kullu, HP 175125",
        phone: "+91 98160 36880",
        whatsapp: "919816036880",
        mapsUrl: "https://maps.google.com/?q=Kullu+RSA",
        rating: 4.8,
        reviewsCount: 71,
        isVerified: true,
        isActive: true,
        services: "Battery Jumpstart, Flat Tyre Puncture, Emergency Fuel Delivery, On-Road Mechanic"
    }
]

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get("category") || ""
        const city = searchParams.get("city") || ""
        const search = searchParams.get("search") || ""

        // Check if database needs initial seeding
        const totalCount = await prisma.nearMeListing.count()
        if (totalCount === 0) {
            for (const item of SEED_LISTINGS) {
                await prisma.nearMeListing.create({ data: item })
            }
        }

        const where: any = { isActive: true }
        if (category && category !== "all") {
            where.category = category
        }
        if (city && city !== "All cities") {
            where.city = { contains: city }
        }
        if (search.trim()) {
            where.OR = [
                { name: { contains: search.trim() } },
                { area: { contains: search.trim() } },
                { city: { contains: search.trim() } },
                { services: { contains: search.trim() } },
                { categoryLabel: { contains: search.trim() } },
            ]
        }

        const listings = await prisma.nearMeListing.findMany({
            where,
            orderBy: [
                { isVerified: "desc" },
                { rating: "desc" },
                { createdAt: "desc" }
            ]
        })

        // Also fetch distinct cities in the database
        const allListings = await prisma.nearMeListing.findMany({
            where: { isActive: true },
            select: { city: true }
        })
        const cities = Array.from(new Set(allListings.map(l => l.city.trim()).filter(Boolean)))

        return NextResponse.json({
            success: true,
            listings,
            total: listings.length,
            availableCities: cities
        })
    } catch (error: any) {
        console.error("Error fetching Near Me listings:", error)
        return NextResponse.json({ success: false, error: error.message || "Failed to fetch listings" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, category, city, area, address, phone, whatsapp, services } = body

        if (!name || !phone || !category) {
            return NextResponse.json({ success: false, error: "Name, category, and phone are required" }, { status: 400 })
        }

        const categoryInfo = NEAR_ME_CATEGORIES.find(c => c.id === category)

        const newListing = await prisma.nearMeListing.create({
            data: {
                name: name.trim(),
                category: category.trim(),
                categoryLabel: categoryInfo?.label || category.trim(),
                city: (city || "Mandi").trim(),
                area: area?.trim() || null,
                address: address?.trim() || null,
                phone: phone.trim(),
                whatsapp: whatsapp ? whatsapp.replace(/[^0-9]/g, "") : null,
                services: services?.trim() || null,
                isVerified: false,
                isActive: true,
                rating: 4.8,
                reviewsCount: 1
            }
        })

        return NextResponse.json({ success: true, listing: newListing })
    } catch (error: any) {
        console.error("Error creating listing submission:", error)
        return NextResponse.json({ success: false, error: error.message || "Failed to submit listing" }, { status: 500 })
    }
}

