import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"
import { executeBroadcast } from "@/services/social-broadcast/broadcast-engine"
import { SupportedPlatform } from "@/services/social-broadcast/types"

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get("limit") || "20")

        const posts = await db.broadcastPost.findMany({
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                logs: {
                    orderBy: { attemptedAt: "desc" }
                }
            }
        })

        const totalCount = await db.broadcastPost.count()

        return NextResponse.json({
            success: true,
            posts,
            totalCount
        })
    } catch (error: any) {
        console.error("Fetch broadcast posts error:", error)
        return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 })
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
            caption,
            mediaUrl,
            mediaUrls,
            mediaType,
            linkUrl,
            platforms,
            scheduledAt
        } = body

        if (!caption && !mediaUrl && (!mediaUrls || mediaUrls.length === 0)) {
            return NextResponse.json({ error: "Post must have either a caption or media." }, { status: 400 })
        }

        if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
            return NextResponse.json({ error: "Please select at least one social media platform." }, { status: 400 })
        }

        const broadcastResult = await executeBroadcast({
            caption: caption || "",
            mediaUrl,
            mediaUrls,
            mediaType: mediaType || "IMAGE",
            linkUrl,
            platforms: platforms as SupportedPlatform[],
            scheduledAt,
            authorName: user.name || "Super Admin"
        })

        return NextResponse.json({
            success: true,
            result: broadcastResult
        })
    } catch (error: any) {
        console.error("Broadcast post execution error:", error)
        return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 })
    }
}

