import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
    try {
        const purposes = await db.loginPurpose.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        })

        return NextResponse.json({ purposes })
    } catch (error) {
        console.error("Error fetching login purposes:", error)
        return NextResponse.json(
            { error: "Failed to fetch login purposes" },
            { status: 500 }
        )
    }
}
