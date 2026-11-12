import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { generateAutoDetailingCaption } from "@/services/social-broadcast/ai-caption"

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { carModel, serviceType, tone, customPrompt } = body

        const result = await generateAutoDetailingCaption({
            carModel,
            serviceType,
            tone,
            customPrompt
        })

        return NextResponse.json({
            success: true,
            caption: result.caption,
            hashtags: result.hashtags
        })
    } catch (error: any) {
        console.error("AI Caption generation error:", error)
        return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 })
    }
}

