import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
    try {
        const posts = await db.studioPost.findMany({
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
            take: 20
        })
        return NextResponse.json({ success: true, posts })
    } catch (error) {
        console.error("Public posts error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
