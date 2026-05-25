import { NextResponse } from "next/server"
import { getPDIInspection } from "@/services/pdi-service"
import { sendPDIReportEmail } from "@/lib/services/email"
import { getCurrentUser } from "@/lib/auth/jwt"

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { inspectionId } = await request.json()
        if (!inspectionId) {
            return NextResponse.json({ error: "Inspection ID is required" }, { status: 400 })
        }

        const inspection = await getPDIInspection(inspectionId)
        if (!inspection) {
            return NextResponse.json({ error: "Inspection not found" }, { status: 404 })
        }

        if (!inspection.customerEmail) {
            return NextResponse.json({ error: "Customer email is missing for this report" }, { status: 400 })
        }

        const vehicleInfo = `${inspection.vehicleMake} ${inspection.vehicleModel}`
        const success = await sendPDIReportEmail(
            inspection.customerEmail,
            inspection.customerName,
            vehicleInfo,
            inspection.id
        )

        if (!success) {
            throw new Error("Failed to send email")
        }

        return NextResponse.json({ message: "Email sent successfully" })
    } catch (error: any) {
        console.error("Manual PDI Email Error:", error)
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
    }
}
