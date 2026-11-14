import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const q = searchParams.get("q")?.trim()

        if (!q) {
            return NextResponse.json({
                success: true,
                query: "",
                warranties: [],
                pdiReports: []
            })
        }

        // Search Warranties
        const warranties = await db.warranty.findMany({
            where: {
                OR: [
                    { certificateNumber: { contains: q } },
                    { vin: { contains: q } },
                    { vehicleReg: { contains: q } },
                    { customerPhone: { contains: q } },
                    { customerName: { contains: q } },
                ]
            },
            include: {
                inspections: {
                    orderBy: { date: "desc" }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        // Search PDI Inspections
        const pdiReports = await db.pDIInspection.findMany({
            where: {
                OR: [
                    { id: { contains: q } },
                    { vin: { contains: q } },
                    { customerPhone: { contains: q } },
                    { customerName: { contains: q } },
                ]
            },
            select: {
                id: true,
                vehicleMake: true,
                vehicleModel: true,
                vehicleColor: true,
                vehicleYear: true,
                vin: true,
                customerName: true,
                customerPhone: true,
                inspectionDate: true,
                status: true,
                pdfUrl: true,
            },
            orderBy: { inspectionDate: "desc" },
            take: 10
        })

        return NextResponse.json({
            success: true,
            query: q,
            warranties,
            pdiReports
        })
    } catch (error: any) {
        console.error("Error in track/report/warranty search:", error)
        return NextResponse.json({ error: error.message || "Failed to search records" }, { status: 500 })
    }
}

