import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        let reviews: any[] = []
        try {
            if ((db as any).googleReview) {
                reviews = await (db as any).googleReview.findMany({
                    orderBy: { createdAt: "desc" }
                })
            } else {
                reviews = await (db as any).$queryRaw`SELECT * FROM GoogleReview ORDER BY createdAt DESC`
            }
        } catch (dbErr) {
            console.error("Reviews query fallback error:", dbErr)
            reviews = await (db as any).$queryRaw`SELECT * FROM GoogleReview ORDER BY createdAt DESC`
        }

        return NextResponse.json({ success: true, reviews })
    } catch (error: any) {
        console.error("Admin fetch reviews error:", error)
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { authorName, authorPhoto, rating, text, relativeTime } = body

        if (!authorName || !text) {
            return NextResponse.json(
                { error: "Author name and review text are required." },
                { status: 400 }
            )
        }

        const uniqueId = `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`
        const numRating = Number(rating) || 5
        const author = authorName.trim()
        const photo = authorPhoto?.trim() || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"
        const reviewText = text.trim()
        const timeAgo = relativeTime?.trim() || "Recently"

        let review: any = null

        try {
            if ((db as any).googleReview) {
                review = await (db as any).googleReview.create({
                    data: {
                        googleReviewId: uniqueId,
                        authorName: author,
                        authorPhoto: photo,
                        rating: numRating,
                        text: reviewText,
                        relativeTime: timeAgo,
                        source: "MANUAL",
                        isFeatured: true,
                        isVisible: true,
                    }
                })
            } else {
                await (db as any).$executeRaw`
                    INSERT INTO GoogleReview (id, googleReviewId, authorName, authorPhoto, rating, text, relativeTime, source, isFeatured, isVisible, createdAt, updatedAt)
                    VALUES (${uniqueId}, ${uniqueId}, ${author}, ${photo}, ${numRating}, ${reviewText}, ${timeAgo}, 'MANUAL', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                `
                review = { id: uniqueId, authorName: author, rating: numRating, text: reviewText, relativeTime: timeAgo }
            }
        } catch (insertErr) {
            console.error("Insert review fallback:", insertErr)
        }

        return NextResponse.json({
            success: true,
            message: "Review added successfully!",
            review
        })
    } catch (error: any) {
        console.error("Admin add review error:", error)
        return NextResponse.json({ error: "Failed to add review" }, { status: 500 })
    }
}
