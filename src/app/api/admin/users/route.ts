import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

// Helper for auth check
async function checkAdminAuth() {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
        return null
    }
    return user
}

// GET all users with filtering
export async function GET(request: Request) {
    if (!await checkAdminAuth()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get("status")
        const role = searchParams.get("role")
        const search = searchParams.get("search")

        const where: any = {}

        if (status && status !== "ALL") {
            where.status = status
        }

        if (role && role !== "ALL") {
            where.role = role
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { mobile: { contains: search, mode: "insensitive" } },
            ]
        }

        const users = await db.user.findMany({
            where,
            include: {
                purposeOfLogin: true,
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ users })
    } catch (error) {
        console.error("Error fetching users:", error)
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        )
    }
}

// POST Create new user (Admin)
export async function POST(request: Request) {
    if (!await checkAdminAuth()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { name, email, mobile, password, role, status } = body

        // Basic validation
        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Check if user exists
        const existingUser = await db.user.findFirst({
            where: {
                OR: [{ email }, { mobile: mobile || undefined }]
            }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email or mobile already exists" },
                { status: 400 }
            )
        }

        // Hash password
        const bcrypt = await import("bcryptjs")
        const hashedPassword = await bcrypt.hash(password, 12)

        const user = await db.user.create({
            data: {
                name,
                email,
                mobile,
                password: hashedPassword,
                role,
                status: status || "APPROVED", // Admin created users are approved by default
                emailVerified: true, // Admin created users are verified
                mobileVerified: true,
            },
        })

        return NextResponse.json({ success: true, user })

    } catch (error) {
        console.error("Error creating user:", error)
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        )
    }
}

// PATCH update user (Status or Details)
export async function PATCH(request: Request) {
    if (!await checkAdminAuth()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { userId, status, adminNotes, ...updateData } = body

        if (!userId) {
            return NextResponse.json(
                { error: "Missing userId" },
                { status: 400 }
            )
        }

        // Prepare update data
        const dataToUpdate: any = { updatedAt: new Date() }

        // If updating status
        if (status) {
            dataToUpdate.status = status

            // Handle notifications only on status change
            const user = await db.user.findUnique({ where: { id: userId } })
            if (user) {
                if (status === "APPROVED" && user.status !== "APPROVED") {
                    const { sendApprovalEmail } = await import("@/lib/services/email")
                    sendApprovalEmail(user.email, user.name).catch(console.error)
                } else if (status === "REJECTED" && user.status !== "REJECTED") {
                    const { sendRejectionEmail } = await import("@/lib/services/email")
                    sendRejectionEmail(user.email, user.name, adminNotes).catch(console.error)
                }
            }
        }

        // If updating other fields (Edit User)
        if (updateData.name) dataToUpdate.name = updateData.name
        if (updateData.email) dataToUpdate.email = updateData.email
        if (updateData.mobile) dataToUpdate.mobile = updateData.mobile
        if (updateData.role) dataToUpdate.role = updateData.role
        if (typeof updateData.emailVerified === 'boolean') dataToUpdate.emailVerified = updateData.emailVerified
        if (typeof updateData.mobileVerified === 'boolean') dataToUpdate.mobileVerified = updateData.mobileVerified

        // Hash password if provided
        if (updateData.password) {
            const bcrypt = await import("bcryptjs")
            dataToUpdate.password = await bcrypt.hash(updateData.password, 12)
        }

        const updatedUser = await db.user.update({
            where: { id: userId },
            data: dataToUpdate,
        })

        return NextResponse.json({
            success: true,
            user: updatedUser,
        })
    } catch (error) {
        console.error("Error updating user:", error)
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        )
    }
}

// DELETE user
export async function DELETE(request: Request) {
    if (!await checkAdminAuth()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get("userId")

        if (!userId) {
            return NextResponse.json(
                { error: "UserId is required" },
                { status: 400 }
            )
        }

        await db.user.delete({
            where: { id: userId },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting user:", error)
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        )
    }
}
