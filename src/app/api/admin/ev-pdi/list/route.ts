import { NextResponse } from "next/server"
import { db as prisma } from "@/lib/db"

export async function GET() {
    try {
        const inspections = await prisma.eVPDIInspection.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                vehicleMake: true,
                vehicleModel: true,
                vehicleVariant: true,
                vehicleColor: true,
                vehicleYear: true,
                vin: true,
                registrationNumber: true,
                customerName: true,
                customerEmail: true,
                customerPhone: true,
                inspectionDate: true,
                inspectedBy: true,
                status: true,
                finalResult: true,
                scores: true,
                createdAt: true,
            },
        })

        return NextResponse.json(inspections)
    } catch (error) {
        console.error("EV PDI list error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
