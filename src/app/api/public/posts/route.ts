import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { autoCheckAndSyncIfNeeded, getFacebookSettings } from "@/services/facebook-sync.service"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const sourceFilter = searchParams.get("source")
        const limit = Number(searchParams.get("limit")) || 20

        // Trigger background sync check without blocking the response
        autoCheckAndSyncIfNeeded().catch(() => {})

        const whereClause: any = { isActive: true }
        if (sourceFilter) {
            whereClause.source = sourceFilter
        }

        const [posts, fbSettings] = await Promise.all([
            db.studioPost.findMany({
                where: whereClause,
                orderBy: [
                    { publishedAt: "desc" },
                    { createdAt: "desc" }
                ],
                take: limit
            }),
            getFacebookSettings()
        ])

        return NextResponse.json({
            success: true,
            posts,
            facebook: {
                pageName: fbSettings.pageName,
                pageId: fbSettings.pageId,
                isConnected: fbSettings.isConnected,
                showOnHome: fbSettings.showOnHome,
                homeSectionTitle: fbSettings.homeSectionTitle,
                homeSectionDesc: fbSettings.homeSectionDesc,
                fallbackEmbedUrl: fbSettings.fallbackEmbedUrl,
                lastSyncedAt: fbSettings.lastSyncedAt
            }
        })
    } catch (error) {
        console.error("Public posts error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
