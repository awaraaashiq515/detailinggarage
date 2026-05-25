import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/jwt"
import { getSystemSettings, updateSystemSettings } from "@/services/settings.service"

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const settings = await getSystemSettings()
        return NextResponse.json({ settings })
    } catch (error) {
        console.error("Error fetching settings:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { packagesEnabled } = body

        if (typeof packagesEnabled !== "boolean") {
            return NextResponse.json({
                error: "packagesEnabled must be a boolean"
            }, { status: 400 })
        }

        const userId = user.userId || (user as any).id
        const settings = await updateSystemSettings(
            { packagesEnabled },
            userId
        )

        return NextResponse.json({
            settings,
            message: `Packages ${packagesEnabled ? 'enabled' : 'disabled'} successfully`
        })
    } catch (error) {
        console.error("Error updating settings:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
