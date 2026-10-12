import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getGoogleReviewSettings, checkAndAutoSyncGoogleReviews } from "@/services/google-reviews.service"

export async function GET() {
    try {
        let settings: any = null
        let reviews: any[] = []

        if ((db as any).googleReviewSettings) {
            settings = await (db as any).googleReviewSettings.findFirst()
            reviews = await (db as any).googleReview.findMany({
                where: { isVisible: true },
                orderBy: [
                    { isFeatured: "desc" },
                    { rating: "desc" },
                    { createdAt: "desc" }
                ],
                take: 20
            })
        } else {
            // Fallback for long-running Next.js dev server cache
            const settingsRows: any = await (db as any).$queryRaw`SELECT * FROM GoogleReviewSettings LIMIT 1`
            settings = settingsRows && settingsRows[0] ? settingsRows[0] : null
            reviews = await (db as any).$queryRaw`SELECT * FROM GoogleReview WHERE isVisible = 1 ORDER BY isFeatured DESC, rating DESC, createdAt DESC LIMIT 20`
        }

        if (!settings) {
            settings = {
                rating: 5.0,
                totalReviews: 47,
                placeName: "Detailing Garage",
                writeReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJ6WFXUSodBTkR8BDYB1vohrE",
                showOnHome: true,
                homeSectionTitle: "Google Reviews & Client Stories",
                homeSectionDesc: "Real, unfiltered 5-star experiences from car owners across Himachal who trusted our studio with their vehicles.",
            }
        }

        return NextResponse.json({
            success: true,
            settings: {
                rating: Number(settings.rating) || 5.0,
                totalReviews: Number(settings.totalReviews) || 47,
                placeName: settings.placeName || "Detailing Garage",
                writeReviewUrl: settings.writeReviewUrl || "https://search.google.com/local/writereview?placeid=ChIJ6WFXUSodBTkR8BDYB1vohrE",
                showOnHome: settings.showOnHome !== 0 && settings.showOnHome !== false,
                homeSectionTitle: settings.homeSectionTitle || "Google Reviews & Client Stories",
                homeSectionDesc: settings.homeSectionDesc || "Real, unfiltered 5-star experiences from car owners across Himachal who trusted our studio with their vehicles.",
            },
            reviews: (reviews || []).map((r: any) => ({
                id: r.id,
                authorName: r.authorName,
                authorPhoto: r.authorPhoto,
                rating: Number(r.rating) || 5,
                text: r.text,
                relativeTime: r.relativeTime || "Verified Google Review",
                source: r.source || "GOOGLE",
            }))
        })
    } catch (error: any) {
        console.error("Public google reviews API error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to load Google reviews" },
            { status: 500 }
        )
    }
}
