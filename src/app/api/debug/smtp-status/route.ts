import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import nodemailer from "nodemailer"

export async function GET() {
    try {
        const diagnostics: any = {
            timestamp: new Date().toISOString(),
            smtpConfigured: false,
            details: {},
            errors: [],
        }

        // Check if SMTP settings exist
        const smtpSettings = await db.sMTPSettings.findFirst({
            where: { isActive: true },
            orderBy: { updatedAt: 'desc' }
        })

        if (!smtpSettings) {
            diagnostics.errors.push("No active SMTP settings found in database")
            return NextResponse.json(diagnostics)
        }

        diagnostics.smtpConfigured = true
        diagnostics.details = {
            host: smtpSettings.host,
            port: smtpSettings.port,
            username: smtpSettings.username,
            fromEmail: smtpSettings.fromEmail,
            fromName: smtpSettings.fromName,
            encryption: smtpSettings.encryption,
            password: smtpSettings.password ? "***SET***" : "***NOT SET***",
            lastUpdated: smtpSettings.updatedAt,
        }

        // Try to create transporter and verify connection
        try {
            const transportConfig: any = {
                host: smtpSettings.host,
                port: smtpSettings.port,
                auth: {
                    user: smtpSettings.username,
                    pass: smtpSettings.password,
                },
            }

            if (smtpSettings.encryption === 'TLS') {
                transportConfig.secure = false
                transportConfig.requireTLS = true
            } else if (smtpSettings.encryption === 'SSL') {
                transportConfig.secure = true
            } else {
                transportConfig.secure = false
            }

            const transporter = nodemailer.createTransport(transportConfig)

            // Verify connection
            await transporter.verify()
            diagnostics.connectionStatus = "✅ SMTP Connection Successful"
            diagnostics.canSendEmails = true

        } catch (verifyError: any) {
            diagnostics.connectionStatus = "❌ SMTP Connection Failed"
            diagnostics.canSendEmails = false
            diagnostics.errors.push({
                type: "Connection Error",
                message: verifyError.message,
                code: verifyError.code,
                command: verifyError.command,
            })

            // Specific error handling
            if (verifyError.message.includes("554 5.7.1")) {
                diagnostics.errors.push({
                    type: "Hostinger Blocked",
                    solution: "Email sending is disabled in hPanel. Login to Hostinger and enable email sending, OR switch to Gmail SMTP"
                })
            } else if (verifyError.code === "EAUTH") {
                diagnostics.errors.push({
                    type: "Authentication Failed",
                    solution: "Username or password is incorrect. Check your credentials."
                })
            } else if (verifyError.code === "ETIMEDOUT" || verifyError.code === "ECONNECTION") {
                diagnostics.errors.push({
                    type: "Connection Timeout",
                    solution: "Cannot reach SMTP server. Check host and port settings, or firewall/network issues."
                })
            }
        }

        return NextResponse.json(diagnostics, { status: 200 })

    } catch (error: any) {
        console.error("SMTP diagnostics error:", error)
        return NextResponse.json({
            error: "Diagnostic check failed",
            message: error.message
        }, { status: 500 })
    }
}
