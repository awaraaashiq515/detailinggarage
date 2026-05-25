import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET all login purposes
export async function GET() {
    try {
        const purposes = await db.loginPurpose.findMany({
            orderBy: { createdAt: "desc" },
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

// POST create new login purpose
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, description, isActive } = body

        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            )
        }

        // Check if purpose with same name exists
        const existing = await db.loginPurpose.findUnique({
            where: { name },
        })

        if (existing) {
            return NextResponse.json(
                { error: "A login purpose with this name already exists" },
                { status: 400 }
            )
        }

        const purpose = await db.loginPurpose.create({
            data: {
                name,
                description: description || null,
                isActive: isActive ?? true,
            },
        })

        return NextResponse.json({
            success: true,
            purpose,
        })
    } catch (error) {
        console.error("Error creating login purpose:", error)
        return NextResponse.json(
            { error: "Failed to create login purpose" },
            { status: 500 }
        )
    }
}

// PATCH update login purpose
export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { id, name, description, isActive } = body

        if (!id) {
            return NextResponse.json(
                { error: "Purpose ID is required" },
                { status: 400 }
            )
        }

        const purpose = await db.loginPurpose.update({
            where: { id },
            data: {
                name: name || undefined,
                description: description !== undefined ? description : undefined,
                isActive: isActive !== undefined ? isActive : undefined,
            },
        })

        return NextResponse.json({
            success: true,
            purpose,
        })
    } catch (error) {
        console.error("Error updating login purpose:", error)
        return NextResponse.json(
            { error: "Failed to update login purpose" },
            { status: 500 }
        )
    }
}

// DELETE login purpose
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json(
                { error: "Purpose ID is required" },
                { status: 400 }
            )
        }

        // Check if any users are using this purpose
        const usersCount = await db.user.count({
            where: { purposeOfLoginId: id },
        })

        if (usersCount > 0) {
            return NextResponse.json(
                { error: `Cannot delete. ${usersCount} user(s) are using this purpose.` },
                { status: 400 }
            )
        }

        await db.loginPurpose.delete({
            where: { id },
        })

        return NextResponse.json({
            success: true,
            message: "Login purpose deleted successfully",
        })
    } catch (error) {
        console.error("Error deleting login purpose:", error)
        return NextResponse.json(
            { error: "Failed to delete login purpose" },
            { status: 500 }
        )
    }
}
