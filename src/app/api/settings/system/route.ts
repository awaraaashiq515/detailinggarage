import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET system settings
export async function GET() {
    try {
        let settings = await db.systemSettings.findFirst()

        // Create default settings if none exist
        if (!settings) {
            settings = await db.systemSettings.create({
                data: {
                    packagesEnabled: true,
                    autoApproveUsers: false,
                    imageWatermarkEnabled: false,
                },
            })
        }

        return NextResponse.json({ settings })
    } catch (error) {
        console.error("Error fetching system settings:", error)
        return NextResponse.json(
            { error: "Failed to fetch system settings" },
            { status: 500 }
        )
    }
}

// POST update system settings
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { packagesEnabled, autoApproveUsers, imageWatermarkEnabled } = body

        // Get existing settings or create new
        let settings = await db.systemSettings.findFirst()

        if (settings) {
            settings = await db.systemSettings.update({
                where: { id: settings.id },
                data: {
                    packagesEnabled: packagesEnabled ?? settings.packagesEnabled,
                    autoApproveUsers: autoApproveUsers ?? settings.autoApproveUsers,
                    imageWatermarkEnabled: imageWatermarkEnabled ?? settings.imageWatermarkEnabled,
                    updatedAt: new Date(),
                },
            })
        } else {
            settings = await db.systemSettings.create({
                data: {
                    packagesEnabled: packagesEnabled ?? true,
                    autoApproveUsers: autoApproveUsers ?? false,
                    imageWatermarkEnabled: imageWatermarkEnabled ?? false,
                },
            })
        }

        return NextResponse.json({
            success: true,
            settings,
        })
    } catch (error) {
        console.error("Error updating system settings:", error)
        return NextResponse.json(
            { error: "Failed to update system settings" },
            { status: 500 }
        )
    }
}
