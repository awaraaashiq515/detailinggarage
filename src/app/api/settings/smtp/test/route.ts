import { NextResponse } from "next/server"
import { sendTestEmail } from "@/lib/services/email"
import { getCurrentUser } from "@/lib/auth/jwt"

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { email } = await request.json()

        if (!email || !email.includes("@")) {
            return NextResponse.json(
                { error: "A valid test recipient email address is required" },
                { status: 400 }
            )
        }

        await sendTestEmail(email.trim())

        return NextResponse.json({
            success: true,
            message: `Test email successfully sent to ${email.trim()}! Please check your inbox.`,
        })
    } catch (error: any) {
        console.error("Test email error:", error)
        let errorMsg = error.message || "Failed to send test email"

        if (error.code === 'EBADNAME' || errorMsg.includes('EBADNAME')) {
            errorMsg = "Invalid SMTP Host: You entered an email address instead of a server hostname. For Gmail, set SMTP Host to 'smtp.gmail.com'."
        } else if (error.code === 'EAUTH' || errorMsg.includes('Invalid login') || errorMsg.includes('Username and Password not accepted')) {
            errorMsg = "Authentication failed: Username or Password incorrect. Note: For Gmail/Google Workspace, generate and use an App Password (16 characters) instead of your regular password."
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET') {
            errorMsg = "Connection timeout: Unable to reach SMTP Host or Port. Verify host address and port number (587 for TLS, 465 for SSL)."
        } else if (error.code === 'ECONNREFUSED') {
            errorMsg = "Connection refused: SMTP server rejected connection on this port."
        }

        return NextResponse.json(
            { error: errorMsg },
            { status: 500 }
        )
    }
}

