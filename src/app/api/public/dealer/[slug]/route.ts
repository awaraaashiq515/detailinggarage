import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"
import { cookies } from "next/headers"

// GET /api/public/dealer/[slug] — full public page data (no auth required)
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params

    const user = await getCurrentUser()
    const cookieStore = await cookies()
    const guestId = cookieStore.get("guest-id")?.value

    const page = await db.dealerPage.findUnique({
        where: { slug },
        include: {
            dealer: {
                select: { name: true, dealerCity: true, dealerState: true },
            },
            posts: {
                orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
                take: 20,
                include: {
                    _count: {
                        select: { likes: true, comments: true }
                    },
                    likes: {
                        where: {
                            OR: [
                                user ? { userId: user.userId } : { guestId: guestId || "NONE" },
                            ].filter(Boolean) as any
                        },
                        take: 1
                    }
                }
            },
            reviews: {
                orderBy: { createdAt: "desc" },
                include: {
                    user: { select: { name: true } },
                },
            },
            _count: {
                select: { followers: true, reviews: true },
            },
        },
    })

    if (!page) {
        return NextResponse.json({ error: "Dealer page not found" }, { status: 404 })
    }

    // Fetch active vehicles separately
    const vehicles = await db.dealerVehicle.findMany({
        where: { dealerId: page.dealerId, status: "ACTIVE" },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 50,
    })

    // Compute average rating
    const avgRating =
        page.reviews.length > 0
            ? Number(
                (
                    page.reviews.reduce((sum, r) => sum + r.rating, 0) / page.reviews.length
                ).toFixed(1)
            )
            : null

    // Increment view count — upsert today's record
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Fire and forget — don't await to keep response fast
    db.dealerPageView
        .upsert({
            where: { pageId_date: { pageId: page.id, date: today } },
            create: { pageId: page.id, date: today, count: 1 },
            update: { count: { increment: 1 } },
        })
        .then(() =>
            db.dealerPage.update({
                where: { id: page.id },
                data: { totalViews: { increment: 1 } },
            })
        )
        .catch(() => { }) // non-critical

    return NextResponse.json({
        page: {
            ...page,
            avgRating,
            followerCount: page._count.followers,
            reviewCount: page._count.reviews,
        },
        vehicles,
    })
}
