import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { formatPackageResponse } from "@/lib/auth/package-access"

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET /api/packages/public/[id] - Get a single active package details (public)
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        const pkg = await db.package.findFirst({
            where: {
                id,
                status: "ACTIVE",
            },
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
        console.error("Error fetching public package:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
