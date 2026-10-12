import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const user = await getCurrentUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { isVisible, isFeatured, rating, text, authorName } = body

        const updated = await db.googleReview.update({
            where: { id },
            data: {
                ...(isVisible !== undefined && { isVisible: Boolean(isVisible) }),
                ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
                ...(rating !== undefined && { rating: Number(rating) }),
                ...(text !== undefined && { text: text.trim() }),
                ...(authorName !== undefined && { authorName: authorName.trim() }),
            }
        })

        return NextResponse.json({
            success: true,
            message: "Review updated successfully!",
            review: updated
        })
    } catch (error: any) {
        console.error("Admin patch review error:", error)
        return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const user = await getCurrentUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await db.googleReview.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: "Review deleted successfully!"
        })
    } catch (error: any) {
        console.error("Admin delete review error:", error)
        return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
    }
}
