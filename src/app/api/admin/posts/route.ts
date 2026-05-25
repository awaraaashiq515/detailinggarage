import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const posts = await db.studioPost.findMany({
            orderBy: { createdAt: "desc" }
        })
        return NextResponse.json({ success: true, posts })
    } catch (error) {
        console.error("Admin fetch posts error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const body = await request.json()
        const { type, url, caption, link } = body

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 })
        }

        const post = await db.studioPost.create({
            data: {
                type: type || "IMAGE",
                url,
                caption,
                link
            }
        })

        return NextResponse.json({ success: true, post })
    } catch (error) {
        console.error("Admin create post error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
