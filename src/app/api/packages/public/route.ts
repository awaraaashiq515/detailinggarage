import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { formatPackageResponse } from "@/lib/auth/package-access"

// GET /api/packages/public - Get all active packages (public access)
export async function GET(request: NextRequest) {
    try {
        // Get query params for filtering
        const { searchParams } = new URL(request.url)
        const type = searchParams.get("type")

        const packages = await db.package.findMany({
            where: {
                status: "ACTIVE",
                ...(type ? { type: type.toUpperCase() } : {}),
            },
            orderBy: [
                { type: "asc" },
                { price: "asc" },
            ],
        })

        return NextResponse.json({
            packages: packages.map(formatPackageResponse),
        })
    } catch (error) {
        console.error("Error fetching public packages:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
