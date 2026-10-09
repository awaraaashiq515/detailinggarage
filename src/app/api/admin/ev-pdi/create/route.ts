import { NextRequest, NextResponse } from "next/server"
import { db as prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        const {
            vehicleMake, vehicleModel, vehicleVariant, vehicleColor, vehicleYear,
            vin, motorNumber, batteryId, registrationNumber, dealership, odometer, manufacturingDate,
            customerName, customerEmail, customerPhone,
            inspectionDate, inspectedBy, adminComments,
            batterySoc, batterySoh, cellVoltageDeviation, batteryTemperature, hvIsolation,
            acChargingResult, dcChargingResult, chargingRate,
            activeFaultCodes, storedFaultCodes, pendingFaultCodes, totalFaultCodes,
            documentationData, exteriorData, paintThicknessData, tyreData, underbodyData,
            batteryData, motorData, chargingData, diagnosticData,
            electricalData, brakingData, steeringData, interiorData,
            infotainmentData, adasData, roadTestData,
            scores, finalResult,
            digitalSignature, customerSignature, dealerSignature,
            images,
        } = body

        if (!vehicleMake || !vehicleModel || !customerName) {
            return NextResponse.json({ error: "Vehicle Make, Model and Customer Name are required" }, { status: 400 })
        }

        const inspection = await prisma.eVPDIInspection.create({
            data: {
                vehicleMake,
                vehicleModel,
                vehicleVariant: vehicleVariant || null,
                vehicleColor: vehicleColor || "",
                vehicleYear: vehicleYear || null,
                vin: vin || null,
                motorNumber: motorNumber || null,
                batteryId: batteryId || null,
                registrationNumber: registrationNumber || null,
                dealership: dealership || null,
                odometer: odometer || null,
                manufacturingDate: manufacturingDate || null,
                customerName,
                customerEmail: customerEmail || null,
                customerPhone: customerPhone || null,
                inspectionDate: inspectionDate ? new Date(inspectionDate) : new Date(),
                inspectedBy: inspectedBy || "Ritchie",
                adminComments: adminComments || null,
                batterySoc: batterySoc || null,
                batterySoh: batterySoh || null,
                cellVoltageDeviation: cellVoltageDeviation || null,
                batteryTemperature: batteryTemperature || null,
                hvIsolation: hvIsolation || null,
                acChargingResult: acChargingResult || null,
                dcChargingResult: dcChargingResult || null,
                chargingRate: chargingRate || null,
                activeFaultCodes: activeFaultCodes || "0",
                storedFaultCodes: storedFaultCodes || "0",
                pendingFaultCodes: pendingFaultCodes || "0",
                totalFaultCodes: totalFaultCodes || "0",
                documentationData: documentationData ? JSON.stringify(documentationData) : null,
                exteriorData: exteriorData ? JSON.stringify(exteriorData) : null,
                paintThicknessData: paintThicknessData ? JSON.stringify(paintThicknessData) : null,
                tyreData: tyreData ? JSON.stringify(tyreData) : null,
                underbodyData: underbodyData ? JSON.stringify(underbodyData) : null,
                batteryData: batteryData ? JSON.stringify(batteryData) : null,
                motorData: motorData ? JSON.stringify(motorData) : null,
                chargingData: chargingData ? JSON.stringify(chargingData) : null,
                diagnosticData: diagnosticData ? JSON.stringify(diagnosticData) : null,
                electricalData: electricalData ? JSON.stringify(electricalData) : null,
                brakingData: brakingData ? JSON.stringify(brakingData) : null,
                steeringData: steeringData ? JSON.stringify(steeringData) : null,
                interiorData: interiorData ? JSON.stringify(interiorData) : null,
                infotainmentData: infotainmentData ? JSON.stringify(infotainmentData) : null,
                adasData: adasData ? JSON.stringify(adasData) : null,
                roadTestData: roadTestData ? JSON.stringify(roadTestData) : null,
                scores: scores ? JSON.stringify(scores) : null,
                finalResult: finalResult || "PASS",
                digitalSignature: digitalSignature || null,
                customerSignature: customerSignature || null,
                dealerSignature: dealerSignature || null,
                images: images ? JSON.stringify(images) : null,
                status: "COMPLETED",
            },
        })

        return NextResponse.json({ success: true, id: inspection.id }, { status: 201 })
    } catch (error) {
        console.error("EV PDI create error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
