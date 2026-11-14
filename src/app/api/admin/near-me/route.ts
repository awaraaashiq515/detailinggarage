import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { NEAR_ME_CATEGORIES } from "@/lib/near-me-categories"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get("category") || ""
        const city = searchParams.get("city") || ""
        const search = searchParams.get("search") || ""

        const where: any = {}
        if (category && category !== "all") where.category = category
        if (city && city !== "all") where.city = { contains: city }
        if (search.trim()) {
            where.OR = [
                { name: { contains: search.trim() } },
                { area: { contains: search.trim() } },
                { city: { contains: search.trim() } },
                { phone: { contains: search.trim() } },
                { services: { contains: search.trim() } },
            ]
        }

        const listings = await prisma.nearMeListing.findMany({
            where,
            orderBy: [{ createdAt: "desc" }]
        })

        const total = await prisma.nearMeListing.count()
        const verifiedCount = await prisma.nearMeListing.count({ where: { isVerified: true } })
        const pendingCount = await prisma.nearMeListing.count({ where: { isVerified: false } })

        return NextResponse.json({
            success: true,
            listings,
            stats: {
                total,
                verified: verifiedCount,
                pending: pendingCount
            }
        })
    } catch (error: any) {
        console.error("Admin near-me GET error:", error)
        return NextResponse.json({ success: false, error: error.message || "Failed to fetch listings" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            name, category, city, area, address,
            phone, whatsapp, mapsUrl, rating,
            reviewsCount, isVerified, isActive, services
        } = body

        if (!name || !phone || !category) {
            return NextResponse.json({ success: false, error: "Name, phone, and category are required" }, { status: 400 })
        }

        const cat = NEAR_ME_CATEGORIES.find(c => c.id === category)

        const listing = await prisma.nearMeListing.create({
            data: {
                name: name.trim(),
                category: category.trim(),
                categoryLabel: cat?.label || category.trim(),
                city: (city || "Mandi").trim(),
                area: area?.trim() || null,
                address: address?.trim() || null,
                phone: phone.trim(),
                whatsapp: whatsapp ? whatsapp.replace(/[^0-9]/g, "") : null,
                mapsUrl: mapsUrl?.trim() || null,
                rating: rating ? parseFloat(rating) : 4.8,
                reviewsCount: reviewsCount ? parseInt(reviewsCount) : 0,
                isVerified: Boolean(isVerified),
                isActive: isActive !== false,
                services: services?.trim() || null
            }
        })

        return NextResponse.json({ success: true, listing })
    } catch (error: any) {
        console.error("Admin near-me POST error:", error)
        return NextResponse.json({ success: false, error: error.message || "Failed to create listing" }, { status: 500 })
    }
}

