import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { getGoogleReviewSettings, updateGoogleReviewSettings } from "@/services/google-reviews.service"
import { db } from "@/lib/db"

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const settings = await getGoogleReviewSettings()
        
        let totalReviewsCount = 5
        let visibleReviewsCount = 5

        try {
            if ((db as any).googleReview) {
                totalReviewsCount = await (db as any).googleReview.count()
                visibleReviewsCount = await (db as any).googleReview.count({ where: { isVisible: true } })
            } else {
                const totalRows: any = await (db as any).$queryRaw`SELECT COUNT(*) as cnt FROM GoogleReview`
                const visibleRows: any = await (db as any).$queryRaw`SELECT COUNT(*) as cnt FROM GoogleReview WHERE isVisible = 1`
                totalReviewsCount = Number(totalRows?.[0]?.cnt || 5)
                visibleReviewsCount = Number(visibleRows?.[0]?.cnt || 5)
            }
        } catch (dbErr) {
            console.error("Count fetch error:", dbErr)
        }

        return NextResponse.json({
            success: true,
            settings,
            stats: {
                totalReviewsCount,
                visibleReviewsCount,
            }
        })
    } catch (error: any) {
        console.error("Admin fetch Google reviews settings error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const {
            placeId,
            placeName,
            apiKey,
            rating,
            totalReviews,
            writeReviewUrl,
            autoSync,
            syncInterval,
            showOnHome,
            minRatingToShow,
            homeSectionTitle,
            homeSectionDesc,
        } = body

        const updated = await updateGoogleReviewSettings(
            {
                placeId: placeId?.trim(),
                placeName: placeName?.trim(),
                apiKey: apiKey !== undefined ? apiKey.trim() : undefined,
                rating: rating !== undefined ? Number(rating) : undefined,
                totalReviews: totalReviews !== undefined ? Number(totalReviews) : undefined,
                writeReviewUrl: writeReviewUrl?.trim(),
                autoSync: autoSync !== undefined ? Boolean(autoSync) : undefined,
                syncInterval: syncInterval !== undefined ? Number(syncInterval) : undefined,
                showOnHome: showOnHome !== undefined ? Boolean(showOnHome) : undefined,
                minRatingToShow: minRatingToShow !== undefined ? Number(minRatingToShow) : undefined,
                homeSectionTitle: homeSectionTitle?.trim(),
                homeSectionDesc: homeSectionDesc?.trim(),
            },
            user.userId
        )

        return NextResponse.json({
            success: true,
            message: "Google Review settings saved successfully!",
            settings: updated,
        })
    } catch (error: any) {
        console.error("Admin update Google review settings error:", error)
        return NextResponse.json({ error: "Failed to save settings." }, { status: 500 })
    }
}
