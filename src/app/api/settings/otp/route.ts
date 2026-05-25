import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET OTP settings
export async function GET() {
    try {
        let settings = await db.oTPSettings.findFirst()

        // Create default settings if none exist
        if (!settings) {
            settings = await db.oTPSettings.create({
                data: {
                    emailOTPEnabled: true,
                    mobileOTPEnabled: false,
                    otpExpiryMinutes: 10,
                },
            })
        }

        return NextResponse.json({ settings })
    } catch (error) {
        console.error("Error fetching OTP settings:", error)
        return NextResponse.json(
            { error: "Failed to fetch OTP settings" },
            { status: 500 }
        )
    }
}

// POST update OTP settings
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { emailOTPEnabled, mobileOTPEnabled, otpExpiryMinutes } = body

        // Get existing settings or create new
        let settings = await db.oTPSettings.findFirst()

        if (settings) {
            settings = await db.oTPSettings.update({
                where: { id: settings.id },
                data: {
                    emailOTPEnabled: emailOTPEnabled ?? settings.emailOTPEnabled,
                    mobileOTPEnabled: mobileOTPEnabled ?? settings.mobileOTPEnabled,
                    otpExpiryMinutes: otpExpiryMinutes ?? settings.otpExpiryMinutes,
                    updatedAt: new Date(),
                },
            })
        } else {
            settings = await db.oTPSettings.create({
                data: {
                    emailOTPEnabled: emailOTPEnabled ?? true,
                    mobileOTPEnabled: mobileOTPEnabled ?? false,
                    otpExpiryMinutes: otpExpiryMinutes ?? 10,
                },
            })
        }

        return NextResponse.json({
            success: true,
            settings,
        })
    } catch (error) {
        console.error("Error updating OTP settings:", error)
        return NextResponse.json(
            { error: "Failed to update OTP settings" },
            { status: 500 }
        )
    }
}
