import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

// GET SMTP settings
export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const settings = await db.sMTPSettings.findFirst({
            where: { isActive: true },
            orderBy: { updatedAt: "desc" },
        })

        if (!settings) {
            return NextResponse.json({ settings: null })
        }

        // Return settings with password masked
        return NextResponse.json({
            settings: {
                id: settings.id,
                host: settings.host,
                port: settings.port,
                username: settings.username,
                password: "********",
                hasPassword: Boolean(settings.password && settings.password.length > 0),
                fromEmail: settings.fromEmail,
                fromName: settings.fromName,
                encryption: settings.encryption,
                isActive: settings.isActive,
                updatedAt: settings.updatedAt,
            },
        })
    } catch (error: any) {
        console.error("Error fetching SMTP settings:", error)
        return NextResponse.json(
            { error: error.message || "Failed to fetch SMTP settings" },
            { status: 500 }
        )
    }
}

// POST update SMTP settings
export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Only ADMIN, SUPER_ADMIN, and SHOP_OWNER can modify SMTP settings
        if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN" && user.role !== "SHOP_OWNER") {
            return NextResponse.json({ error: "Access denied" }, { status: 403 })
        }

        const body = await request.json()
        const { host, port, username, password, fromEmail, fromName, encryption } = body

        if (!host || !port || !username || !fromEmail || !fromName) {
            return NextResponse.json(
                { error: "Host, Port, Username, From Email, and From Name are required" },
                { status: 400 }
            )
        }

        let sanitizedHost = host.trim()
        if (sanitizedHost.includes("@")) {
            const domain = sanitizedHost.split("@")[1]?.toLowerCase()
            if (domain === "gmail.com" || domain === "googlemail.com") {
                sanitizedHost = "smtp.gmail.com"
            } else if (domain === "zoho.com" || domain === "zoho.in") {
                sanitizedHost = "smtp.zoho.in"
            } else if (domain === "outlook.com" || domain === "hotmail.com") {
                sanitizedHost = "smtp.office365.com"
            } else {
                return NextResponse.json(
                    { error: `Invalid SMTP Host: "${sanitizedHost}" is an email address. Please enter a valid SMTP server hostname such as "smtp.gmail.com", or click one of the provider presets.` },
                    { status: 400 }
                )
            }
        }

        // Retrieve existing active settings to retain password if not changed
        const existing = await db.sMTPSettings.findFirst({
            where: { isActive: true },
            orderBy: { updatedAt: "desc" },
        })

        let finalPassword = password
        if (!finalPassword || finalPassword === "********") {
            if (existing && existing.password) {
                finalPassword = existing.password
            } else {
                return NextResponse.json(
                    { error: "Password is required for SMTP authentication" },
                    { status: 400 }
                )
            }
        }

        // Strip spaces from Google App Passwords (e.g., 'jfrg mwoh xjpq wxgm' -> 'jfrgmwohxjpqwxgm')
        if (finalPassword && typeof finalPassword === "string") {
            finalPassword = finalPassword.replace(/\s+/g, "").trim()
        }

        // Normalize port and encryption for known servers
        let parsedPort = parseInt(port.toString())
        let finalEncryption = encryption || "TLS"
        if (sanitizedHost === "smtp.gmail.com") {
            if (parsedPort === 465) {
                finalEncryption = "SSL"
            } else {
                parsedPort = 587
                finalEncryption = "TLS"
            }
        }

        // Deactivate old settings
        await db.sMTPSettings.updateMany({
            where: { isActive: true },
            data: { isActive: false },
        })

        // Create new active settings
        const settings = await db.sMTPSettings.create({
            data: {
                host: sanitizedHost,
                port: parsedPort,
                username: username.trim(),
                password: finalPassword,
                fromEmail: fromEmail.trim(),
                fromName: fromName.trim(),
                encryption: finalEncryption,
                isActive: true,
                updatedBy: user.userId,
            },
        })

        return NextResponse.json({
            success: true,
            message: "SMTP settings saved successfully",
            settings: {
                ...settings,
                password: "********",
                hasPassword: true,
            },
        })
    } catch (error: any) {
        console.error("Error updating SMTP settings:", error)
        return NextResponse.json(
            { error: error.message || "Failed to update SMTP settings" },
            { status: 500 }
        )
    }
}

