import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { testFacebookConnection, getFacebookSettings } from "@/services/facebook-sync.service"

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json().catch(() => ({}))
        let { pageId, pageAccessToken } = body

        // If not provided in body, fallback to stored settings
        if (!pageId || !pageAccessToken) {
            const current = await getFacebookSettings()
            pageId = pageId || current.pageId
            pageAccessToken = pageAccessToken || current.pageAccessToken
        }

        if (!pageId || !pageAccessToken) {
            return NextResponse.json({
                success: false,
                error: "Please enter both Page ID and Page Access Token first."
            }, { status: 400 })
        }

        const result = await testFacebookConnection(pageId, pageAccessToken)

        if (!result.success) {
            return NextResponse.json(result, { status: 400 })
        }

        return NextResponse.json(result)
    } catch (error: any) {
        console.error("Test Facebook connection error:", error)
        return NextResponse.json({
            success: false,
            error: error.message || "Failed to test Facebook connection."
        }, { status: 500 })
    }
}
