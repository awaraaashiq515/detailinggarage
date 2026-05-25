import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"

// GET /api/public/dealer/posts/[postId]/comments — fetch all comments
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params
    const comments = await db.dealerPostComment.findMany({
        where: { postId },
        include: {
            user: { select: { name: true } }
        },
        orderBy: { createdAt: "asc" }
    })

    const formatted = comments.map(c => ({
        name: c.user?.name || c.guestName || "Anonymous",
        text: c.text,
        time: c.createdAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    }))

    return NextResponse.json({ comments: formatted })
}

// POST /api/public/dealer/posts/[postId]/comments — add a comment
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params
    const { text, guestName } = await req.json()
    const user = await getCurrentUser()

    if (!text?.trim()) return NextResponse.json({ error: "Comment text required" }, { status: 400 })

    const comment = await db.dealerPostComment.create({
        data: {
            postId,
            userId: user?.userId || null,
            guestName: !user ? (guestName || "Guest") : null,
            text
        },
        include: {
            user: { select: { name: true } }
        }
    })

    return NextResponse.json({
        comment: {
            name: comment.user?.name || comment.guestName || "Anonymous",
            text: comment.text,
            time: comment.createdAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
        }
    })
}
