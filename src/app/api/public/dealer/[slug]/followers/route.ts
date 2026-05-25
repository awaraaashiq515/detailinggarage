import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/public/dealer/[slug]/followers
// Returns up to 20 recent followers with name and image
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params

    const page = await db.dealerPage.findUnique({
        where: { slug },
        select: { id: true, isActive: true },
    })

    if (!page || !page.isActive) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const follows = await db.dealerFollow.findMany({
        where: { pageId: page.id },
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
            user: {
                select: { id: true, name: true },
            },
        },
    })

    const followers = follows.map(f => ({
        id: f.user.id,
        name: f.user.name || "Anonymous",
        followedAt: f.createdAt,
    }))

    return NextResponse.json({ followers, total: followers.length })
}
