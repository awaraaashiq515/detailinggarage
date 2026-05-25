import { NextResponse } from "next/server"
import { verifyOTPSchema } from "@/lib/schemas/auth"
import { db } from "@/lib/db"

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // 1. Validate input
        const result = verifyOTPSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed", details: result.error.flatten() },
                { status: 400 }
            )
        }

        const { userId, emailOTP, mobileOTP } = body

        // 2. Find user
        const user = await db.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // 3. Verify email OTP if provided
        if (emailOTP) {
            const otpRecord = await db.oTPVerification.findFirst({
                where: {
                    userId,
                    type: "EMAIL",
                    code: emailOTP,
                    verified: false,
                    expiresAt: { gt: new Date() }
                }
            })

            if (!otpRecord) {
                return NextResponse.json(
                    { error: "Invalid or expired email OTP" },
                    { status: 400 }
                )
            }

            // Mark OTP as verified
            await db.oTPVerification.update({
                where: { id: otpRecord.id },
                data: {
                    verified: true,
                    verifiedAt: new Date()
                }
            })

            // Update user email verification
            await db.user.update({
                where: { id: userId },
                data: {
                    emailVerified: true,
                    emailVerifiedAt: new Date()
                }
            })
        }

        // 4. Verify mobile OTP if provided
        if (mobileOTP) {
            const otpRecord = await db.oTPVerification.findFirst({
                where: {
                    userId,
                    type: "MOBILE",
                    code: mobileOTP,
                    verified: false,
                    expiresAt: { gt: new Date() }
                }
            })

            if (!otpRecord) {
                return NextResponse.json(
                    { error: "Invalid or expired mobile OTP" },
                    { status: 400 }
                )
            }

            // Mark OTP as verified
            await db.oTPVerification.update({
                where: { id: otpRecord.id },
                data: {
                    verified: true,
                    verifiedAt: new Date()
                }
            })

            // Update user mobile verification
            await db.user.update({
                where: { id: userId },
                data: {
                    mobileVerified: true,
                    mobileVerifiedAt: new Date()
                }
            })
        }

        return NextResponse.json({
            success: true,
            message: "Verification successful! Please wait for admin approval before logging in."
        })

    } catch (error) {
        console.error("OTP verification error:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

// Resend OTP endpoint
export async function PUT(request: Request) {
    try {
        const { userId, type } = await request.json()

        if (!userId || !type) {
            return NextResponse.json(
                { error: "Missing userId or type" },
                { status: 400 }
            )
        }

        // Find user
        const user = await db.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // Get OTP settings
        const otpSettings = await db.oTPSettings.findFirst()
        const otpExpiryMinutes = otpSettings?.otpExpiryMinutes ?? 10

        // Generate new OTP
        const newOTP = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date()
        expiresAt.setMinutes(expiresAt.getMinutes() + otpExpiryMinutes)

        // Delete old OTPs
        await db.oTPVerification.deleteMany({
            where: {
                userId,
                type,
                verified: false
            }
        })

        // Create new OTP
        await db.oTPVerification.create({
            data: {
                userId,
                type,
                code: newOTP,
                expiresAt
            }
        })

        // Send OTP
        if (type === "EMAIL") {
            const { sendOTPEmail } = await import("@/lib/services/email")
            await sendOTPEmail(user.email, newOTP, user.name)
        } else if (type === "MOBILE") {
            // TODO: Send SMS
            console.log(`Mobile OTP for ${user.mobile}: ${newOTP}`)
        }

        return NextResponse.json({
            success: true,
            message: "OTP resent successfully"
        })

    } catch (error) {
        console.error("Resend OTP error:", error)
        return NextResponse.json(
            { error: "Failed to resend OTP" },
            { status: 500 }
        )
    }
}
