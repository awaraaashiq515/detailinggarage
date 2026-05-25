import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"

// POST /api/public/dealer/[slug]/follow — follow a dealer page
export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const user = await getCurrentUser()
    if (!user) {
        return NextResponse.json({ error: "Login required to follow dealers" }, { status: 401 })
    }

    const { slug } = await params
    const page = await db.dealerPage.findUnique({ where: { slug } })
    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 })
    if (!page.isActive) return NextResponse.json({ error: "Page unavailable" }, { status: 403 })

    // Dealers cannot follow themselves
    if (page.dealerId === user.userId) {
        return NextResponse.json({ error: "You cannot follow your own page" }, { status: 400 })
    }

    await db.dealerFollow.upsert({
        where: { userId_pageId: { userId: user.userId, pageId: page.id } },
        create: { userId: user.userId, pageId: page.id },
        update: {}, // already following — no-op
    })

    const count = await db.dealerFollow.count({ where: { pageId: page.id } })
    return NextResponse.json({ following: true, followerCount: count })
}

// DELETE /api/public/dealer/[slug]/follow — unfollow
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const user = await getCurrentUser()
    if (!user) {
        return NextResponse.json({ error: "Login required" }, { status: 401 })
    }

    const { slug } = await params
    const page = await db.dealerPage.findUnique({ where: { slug } })
    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 })

    await db.dealerFollow
        .delete({ where: { userId_pageId: { userId: user.userId, pageId: page.id } } })
        .catch(() => { }) // ignore if not following

    const count = await db.dealerFollow.count({ where: { pageId: page.id } })
    return NextResponse.json({ following: false, followerCount: count })
}
