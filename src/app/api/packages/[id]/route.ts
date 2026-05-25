import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"
import { updatePackageSchema } from "@/lib/schemas/package"
import { formatPackageResponse } from "@/lib/auth/package-access"

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET /api/packages/[id] - Get a single package
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const pkg = await db.package.findUnique({
            where: { id },
        })

        if (!pkg) {
            return NextResponse.json(
                { error: "Package not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            package: formatPackageResponse(pkg),
        })
    } catch (error) {
        console.error("Error fetching package:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// PUT /api/packages/[id] - Update a package (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        if (user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            )
        }

        // Check if package exists
        const existingPkg = await db.package.findUnique({
            where: { id },
        })

        if (!existingPkg) {
            return NextResponse.json(
                { error: "Package not found" },
                { status: 404 }
            )
        }

        const body = await request.json()
        const validation = updatePackageSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.flatten() },
                { status: 400 }
            )
        }

        const { services, ...rest } = validation.data

        const updatedPackage = await db.package.update({
            where: { id },
            data: {
                ...rest,
                ...(services ? { services: JSON.stringify(services) } : {}),
            },
        })

        return NextResponse.json({
            message: "Package updated successfully",
            package: formatPackageResponse(updatedPackage),
        })
    } catch (error) {
        console.error("Error updating package:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// DELETE /api/packages/[id] - Delete a package (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        if (user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            )
        }

        // Check if package exists
        const existingPkg = await db.package.findUnique({
            where: { id },
        })

        if (!existingPkg) {
            return NextResponse.json(
                { error: "Package not found" },
                { status: 404 }
            )
        }

        await db.package.delete({
            where: { id },
        })

        return NextResponse.json({
            message: "Package deleted successfully",
        })
    } catch (error) {
        console.error("Error deleting package:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
