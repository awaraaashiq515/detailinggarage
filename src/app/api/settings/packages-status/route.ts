import { NextRequest, NextResponse } from "next/server"
import { arePackagesEnabled } from "@/services/settings.service"

// Public endpoint to check if packages are enabled
export async function GET(req: NextRequest) {
    try {
        const packagesEnabled = await arePackagesEnabled()

        return NextResponse.json({
            packagesEnabled
        })
    } catch (error) {
        console.error("Error fetching package status:", error)
        // Default to true (packages required) on error for safety
        return NextResponse.json({
            packagesEnabled: true
        })
    }
}
