import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { id } = await params
        const body = await request.json()
        const { isActive } = body

        const post = await db.studioPost.update({
            where: { id },
            data: { isActive }
        })

        return NextResponse.json({ success: true, post })
    } catch (error) {
        console.error("Admin update post error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { id } = await params

        await db.studioPost.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Admin delete post error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
