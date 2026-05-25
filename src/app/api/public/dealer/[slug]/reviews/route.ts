import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"

// GET /api/public/dealer/[slug]/reviews — fetch all reviews
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params
    const page = await db.dealerPage.findUnique({ where: { slug } })
    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 })

    const reviews = await db.dealerReview.findMany({
        where: { pageId: page.id },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
    })

    const avg =
        reviews.length > 0
            ? Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
            : null

    return NextResponse.json({ reviews, avgRating: avg, total: reviews.length })
}

// POST /api/public/dealer/[slug]/reviews — submit or update a review
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const user = await getCurrentUser()
    if (!user) {
        return NextResponse.json({ error: "Login required to leave a review" }, { status: 401 })
    }

    const { slug } = await params
    const page = await db.dealerPage.findUnique({ where: { slug } })
    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 })
    if (!page.isActive) return NextResponse.json({ error: "Page unavailable" }, { status: 403 })

    if (page.dealerId === user.userId) {
        return NextResponse.json({ error: "You cannot review your own page" }, { status: 400 })
    }

    const body = await req.json()
    const rating = Number(body.rating)
    const { comment } = body

    if (!rating || rating < 1 || rating > 5) {
        return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const review = await db.dealerReview.upsert({
        where: { userId_pageId: { userId: user.userId, pageId: page.id } },
        create: {
            userId: user.userId,
            pageId: page.id,
            rating,
            comment: comment?.trim() || null,
        },
        update: {
            rating,
            comment: comment?.trim() || null,
        },
    })

    return NextResponse.json({ review, message: "Review submitted successfully" })
}
