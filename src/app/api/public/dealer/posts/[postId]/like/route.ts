import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"
import { cookies } from "next/headers"
import { randomUUID } from "node:crypto"

// POST /api/public/dealer/posts/[postId]/like — toggle like
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params
    const user = await getCurrentUser()
    const cookieStore = await cookies()

    let guestId = cookieStore.get("guest-id")?.value
    if (!user && !guestId) {
        guestId = randomUUID()
        cookieStore.set("guest-id", guestId, { maxAge: 60 * 60 * 24 * 365, path: "/" })
    }

    const post = await db.dealerPost.findUnique({ where: { id: postId } })
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 })

    // Check if already liked
    const existingLike = await db.dealerPostLike.findFirst({
        where: {
            postId,
            OR: [
                user ? { userId: user.userId } : { guestId: guestId },
            ]
        }
    })

    if (existingLike) {
        await db.dealerPostLike.delete({ where: { id: existingLike.id } })
        const count = await db.dealerPostLike.count({ where: { postId } })
        return NextResponse.json({ liked: false, likeCount: count })
    } else {
        await db.dealerPostLike.create({
            data: {
                postId,
                userId: user?.userId || null,
                guestId: !user ? guestId : null
            }
        })
        const count = await db.dealerPostLike.count({ where: { postId } })
        return NextResponse.json({ liked: true, likeCount: count })
    }
}

// GET /api/public/dealer/posts/[postId]/like — get like status and count
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params
    const user = await getCurrentUser()
    const cookieStore = await cookies()
    const guestId = cookieStore.get("guest-id")?.value

    const count = await db.dealerPostLike.count({ where: { postId } })
    const userLike = await db.dealerPostLike.findFirst({
        where: {
            postId,
            OR: [
                user ? { userId: user.userId } : { guestId: guestId },
            ].filter(Boolean) as any
        }
    })

    return NextResponse.json({ liked: !!userLike, likeCount: count })
}
