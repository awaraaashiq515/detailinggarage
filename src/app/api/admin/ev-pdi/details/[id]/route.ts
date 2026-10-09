import { NextRequest, NextResponse } from "next/server"
import { db as prisma } from "@/lib/db"

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const inspection = await prisma.eVPDIInspection.findUnique({
            where: { id },
        })

        if (!inspection) {
            return NextResponse.json({ error: "EV PDI Inspection not found" }, { status: 404 })
        }

        // Parse JSON fields
        const parsed = {
            ...inspection,
            documentationData: inspection.documentationData ? JSON.parse(inspection.documentationData) : null,
            exteriorData: inspection.exteriorData ? JSON.parse(inspection.exteriorData) : null,
            paintThicknessData: inspection.paintThicknessData ? JSON.parse(inspection.paintThicknessData) : null,
            tyreData: inspection.tyreData ? JSON.parse(inspection.tyreData) : null,
            underbodyData: inspection.underbodyData ? JSON.parse(inspection.underbodyData) : null,
            batteryData: inspection.batteryData ? JSON.parse(inspection.batteryData) : null,
            motorData: inspection.motorData ? JSON.parse(inspection.motorData) : null,
            chargingData: inspection.chargingData ? JSON.parse(inspection.chargingData) : null,
            diagnosticData: inspection.diagnosticData ? JSON.parse(inspection.diagnosticData) : null,
            electricalData: inspection.electricalData ? JSON.parse(inspection.electricalData) : null,
            brakingData: inspection.brakingData ? JSON.parse(inspection.brakingData) : null,
            steeringData: inspection.steeringData ? JSON.parse(inspection.steeringData) : null,
            interiorData: inspection.interiorData ? JSON.parse(inspection.interiorData) : null,
            infotainmentData: inspection.infotainmentData ? JSON.parse(inspection.infotainmentData) : null,
            adasData: inspection.adasData ? JSON.parse(inspection.adasData) : null,
            roadTestData: inspection.roadTestData ? JSON.parse(inspection.roadTestData) : null,
            scores: inspection.scores ? JSON.parse(inspection.scores) : null,
            images: inspection.images ? JSON.parse(inspection.images) : [],
        }

        return NextResponse.json(parsed)
    } catch (error) {
        console.error("EV PDI details error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
