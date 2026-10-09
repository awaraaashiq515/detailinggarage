import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { getFacebookSettings, updateFacebookSettings } from "@/services/facebook-sync.service"
import { db } from "@/lib/db"

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const settings = await getFacebookSettings()
        const fbPostsCount = await db.studioPost.count({
            where: { source: "FACEBOOK" }
        })
        const totalPostsCount = await db.studioPost.count()

        return NextResponse.json({
            success: true,
            settings,
            stats: {
                fbPostsCount,
                totalPostsCount
            }
        })
    } catch (error: any) {
        console.error("Admin fetch Facebook settings error:", error)
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
            pageId,
            pageName,
            pageAccessToken,
            appId,
            appSecret,
            webhookVerifyToken,
            autoSync,
            syncInterval,
            showOnHome,
            homeSectionTitle,
            homeSectionDesc,
            maxHomePosts,
            fallbackEmbedUrl
        } = body

        const updated = await updateFacebookSettings(
            {
                pageId: pageId?.trim(),
                pageName: pageName?.trim(),
                pageAccessToken: pageAccessToken?.trim(),
                appId: appId?.trim(),
                appSecret: appSecret?.trim(),
                webhookVerifyToken: webhookVerifyToken?.trim(),
                autoSync: typeof autoSync === "boolean" ? autoSync : true,
                syncInterval: Number(syncInterval) || 30,
                showOnHome: typeof showOnHome === "boolean" ? showOnHome : true,
                homeSectionTitle,
                homeSectionDesc,
                maxHomePosts: Number(maxHomePosts) || 6,
                fallbackEmbedUrl: fallbackEmbedUrl?.trim(),
            },
            user.userId
        )

        return NextResponse.json({ success: true, settings: updated })
    } catch (error: any) {
        console.error("Admin update Facebook settings error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
