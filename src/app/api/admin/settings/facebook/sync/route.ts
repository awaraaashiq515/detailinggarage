import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { syncFacebookPosts } from "@/services/facebook-sync.service"

export async function POST() {
    try {
        const user = await getCurrentUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const result = await syncFacebookPosts({ manual: true, adminUserId: user.userId })

        if (!result.success) {
            return NextResponse.json(result, { status: 400 })
        }

        return NextResponse.json(result)
    } catch (error: any) {
        console.error("Facebook manual sync error:", error)
        return NextResponse.json({
            success: false,
            error: error.message || "Failed to trigger Facebook post synchronization."
        }, { status: 500 })
    }
}
