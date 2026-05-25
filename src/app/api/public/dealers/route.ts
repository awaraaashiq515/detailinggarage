import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/public/dealers — list all active dealer pages for directory + homepage
export async function GET() {
    const dealers = await db.dealerPage.findMany({
        where: { isActive: true },
        select: {
            id: true,
            slug: true,
            businessName: true,
            tagline: true,
            logoUrl: true,
            coverUrl: true,
            city: true,
            state: true,
            isVerified: true,
            isFeatured: true,
            totalViews: true,
            createdAt: true,
            _count: {
                select: { followers: true, reviews: true },
            },
            reviews: {
                select: { rating: true },
            },
            dealer: {
                select: {
                    dealerVehicles: {
                        where: { status: "ACTIVE" },
                        select: { id: true },
                    },
                },
            },
        },
        orderBy: [{ isFeatured: "desc" }, { isVerified: "desc" }, { totalViews: "desc" }],
    })

    // Compute derived fields
    const enriched = dealers.map((d) => ({
        id: d.id,
        slug: d.slug,
        businessName: d.businessName,
        tagline: d.tagline,
        logoUrl: d.logoUrl,
        coverUrl: d.coverUrl,
        city: d.city,
        state: d.state,
        isVerified: d.isVerified,
        isFeatured: d.isFeatured,
        totalViews: d.totalViews,
        followerCount: d._count.followers,
        reviewCount: d._count.reviews,
        vehicleCount: d.dealer.dealerVehicles.length,
        avgRating:
            d.reviews.length > 0
                ? Number(
                    (d.reviews.reduce((s, r) => s + r.rating, 0) / d.reviews.length).toFixed(1)
                )
                : null,
        createdAt: d.createdAt,
    }))

    return NextResponse.json({ dealers: enriched })
}
