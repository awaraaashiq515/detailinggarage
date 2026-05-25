import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET SMTP settings
export async function GET() {
    try {
        const settings = await db.sMTPSettings.findFirst({
            where: { isActive: true },
            orderBy: { updatedAt: "desc" },
        })

        if (!settings) {
            return NextResponse.json({ settings: null })
        }

        // Mask password for security
        return NextResponse.json({
            settings: {
                ...settings,
                password: "********",
            },
        })
    } catch (error) {
        console.error("Error fetching SMTP settings:", error)
        return NextResponse.json(
            { error: "Failed to fetch SMTP settings" },
            { status: 500 }
        )
    }
}

// POST update SMTP settings
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { host, port, username, password, fromEmail, fromName, encryption } = body

        if (!host || !port || !username || !fromEmail || !fromName) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Deactivate old settings
        await db.sMTPSettings.updateMany({
            where: { isActive: true },
            data: { isActive: false },
        })

        // Create new settings
        const settings = await db.sMTPSettings.create({
            data: {
                host,
                port: parseInt(port),
                username,
                password: password || "", // If password is not provided, keep existing
                fromEmail,
                fromName,
                encryption: encryption || "TLS",
                isActive: true,
            },
        })

        return NextResponse.json({
            success: true,
            settings: {
                ...settings,
                password: "********",
            },
        })
    } catch (error) {
        console.error("Error updating SMTP settings:", error)
        return NextResponse.json(
            { error: "Failed to update SMTP settings" },
            { status: 500 }
        )
    }
}
