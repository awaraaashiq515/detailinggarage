import { NextResponse } from "next/server"
import { registerSchema } from "@/lib/schemas/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { sendOTPEmail } from "@/lib/services/email"

// Generate 6-digit OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // 1. Validate input
        const result = registerSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed", details: result.error.flatten() },
                { status: 400 }
            )
        }

        // 2. Check if user already exists
        const existingUser = await db.user.findFirst({
            where: {
                OR: [
                    { email: body.email },
                    { mobile: body.mobile }
                ]
            }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email or mobile already exists" },
                { status: 400 }
            )
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(body.password, 12)

        // Get OTP settings to determine if verification is required
        const otpSettings = await db.oTPSettings.findFirst()
        const emailOTPEnabled = otpSettings?.emailOTPEnabled ?? true
        const mobileOTPEnabled = otpSettings?.mobileOTPEnabled ?? false
        const otpExpiryMinutes = otpSettings?.otpExpiryMinutes ?? 10

        // Get system settings to determine if auto-approval is enabled
        const systemSettings = await db.systemSettings.findFirst()
        const autoApproveUsers = systemSettings?.autoApproveUsers ?? false

        // Determine initial user status
        const initialStatus = autoApproveUsers ? "APPROVED" : "PENDING"

        // Forced manual approval for dealers
        const finalStatus = body.role === "DEALER" ? "PENDING" : initialStatus

        // Create user with determined status
        const user = await db.user.create({
            data: {
                email: body.email,
                name: body.name,
                mobile: body.mobile,
                password: hashedPassword,
                role: body.role,
                purposeOfLoginId: body.purposeOfLoginId,
                status: finalStatus,
                emailVerified: !emailOTPEnabled, // Auto-verify if OTP disabled
                mobileVerified: !mobileOTPEnabled,

                // Dealer specific fields
                dealerBusinessName: body.dealerBusinessName,
                dealerGstNumber: body.dealerGstNumber,
                dealerCity: body.dealerCity,
                dealerState: body.dealerState,
                dealerBankName: body.dealerBankName,
                dealerAccountNum: body.dealerAccountNum,
                dealerIfscCode: body.dealerIfscCode,
            },
        })

        // 6. Generate and send OTP if enabled
        let requiresOTP = false

        if (emailOTPEnabled) {
            const emailOTP = generateOTP()
            const expiresAt = new Date()
            expiresAt.setMinutes(expiresAt.getMinutes() + otpExpiryMinutes)

            await db.oTPVerification.create({
                data: {
                    userId: user.id,
                    type: "EMAIL",
                    code: emailOTP,
                    expiresAt,
                }
            })

            // Send OTP email
            try {
                await sendOTPEmail(user.email, emailOTP, user.name)
            } catch (emailError) {
                console.error("Failed to send OTP email:", emailError)
                // Continue registration even if email fails
            }

            requiresOTP = true
        }

        if (mobileOTPEnabled) {
            const mobileOTP = generateOTP()
            const expiresAt = new Date()
            expiresAt.setMinutes(expiresAt.getMinutes() + otpExpiryMinutes)

            await db.oTPVerification.create({
                data: {
                    userId: user.id,
                    type: "MOBILE",
                    code: mobileOTP,
                    expiresAt,
                }
            })

            // TODO: Send SMS OTP (integrate with SMS service)
            console.log(`Mobile OTP for ${user.mobile}: ${mobileOTP}`)

            requiresOTP = true
        }

        // 7. Return success
        return NextResponse.json({
            success: true,
            userId: user.id,
            requiresOTP,
            message: requiresOTP
                ? "Registration successful! Please verify your OTP."
                : "Registration successful! Please wait for admin approval."
        })

    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
