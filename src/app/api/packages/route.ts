import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"
import { createPackageSchema } from "@/lib/schemas/package"
import { formatPackageResponse } from "@/lib/auth/package-access"

// GET /api/packages - Get all packages (admin only)
export async function GET(request: NextRequest) {
    try {
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

        // Get query params for filtering
        const { searchParams } = new URL(request.url)
        const type = searchParams.get("type")
        const status = searchParams.get("status")

        const packages = await db.package.findMany({
            where: {
                ...(type ? { type } : {}),
                ...(status ? { status } : {}),
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({
            packages: packages.map(formatPackageResponse),
        })
    } catch (error) {
        console.error("Error fetching packages:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// POST /api/packages - Create a new package (admin only)
export async function POST(request: NextRequest) {
    try {
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

        const body = await request.json()
        const validation = createPackageSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.flatten() },
                { status: 400 }
            )
        }

        const { name, type, description, services, price, pdiCount, status } = validation.data

        const newPackage = await db.package.create({
            data: {
                name,
                type,
                description,
                services: JSON.stringify(services),
                price,
                pdiCount,
                status: status || "ACTIVE",
            },
        })

        return NextResponse.json({
            message: "Package created successfully",
            package: formatPackageResponse(newPackage),
        }, { status: 201 })
    } catch (error) {
        console.error("Error creating package:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
