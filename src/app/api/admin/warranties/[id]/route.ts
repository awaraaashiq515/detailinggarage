import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

async function checkAdminAuth() {
    const user = await getCurrentUser()
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        return null
    }
    return user
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await checkAdminAuth()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const warranty = await db.warranty.findUnique({
            where: { id },
            include: {
                inspections: {
                    orderBy: { date: "desc" }
                }
            }
        })

        if (!warranty) {
            return NextResponse.json({ error: "Warranty not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, warranty })
    } catch (error: any) {
        console.error("Error fetching warranty:", error)
        return NextResponse.json({ error: error.message || "Failed to fetch warranty" }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await checkAdminAuth()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const body = await request.json()
        const {
            certificateNumber,
            type,
            productPackage,
            coverageArea,
            customerName,
            customerPhone,
            vin,
            vehicleReg,
            invoiceNo,
            startDate,
            years,
            requiresAnnualInspection,
            nextInspectionDate,
            status,
            terms,
            notes
        } = body

        const existing = await db.warranty.findUnique({ where: { id } })
        if (!existing) {
            return NextResponse.json({ error: "Warranty not found" }, { status: 404 })
        }

        const sDate = startDate ? new Date(startDate) : existing.startDate
        const validYears = years !== undefined ? Number(years) : existing.years
        const eDate = new Date(sDate)
        eDate.setFullYear(eDate.getFullYear() + validYears)

        const updated = await db.warranty.update({
            where: { id },
            data: {
                certificateNumber: certificateNumber || existing.certificateNumber,
                type: type || existing.type,
                productPackage: productPackage !== undefined ? productPackage : existing.productPackage,
                coverageArea: coverageArea !== undefined ? coverageArea : existing.coverageArea,
                customerName: customerName || existing.customerName,
                customerPhone: customerPhone || existing.customerPhone,
                vin: vin !== undefined ? vin : existing.vin,
                vehicleReg: vehicleReg !== undefined ? vehicleReg : existing.vehicleReg,
                invoiceNo: invoiceNo !== undefined ? invoiceNo : existing.invoiceNo,
                startDate: sDate,
                endDate: eDate,
                years: validYears,
                requiresAnnualInspection: requiresAnnualInspection !== undefined ? requiresAnnualInspection : existing.requiresAnnualInspection,
                nextInspectionDate: nextInspectionDate ? new Date(nextInspectionDate) : existing.nextInspectionDate,
                status: status || existing.status,
                terms: terms !== undefined ? terms : existing.terms,
                notes: notes !== undefined ? notes : existing.notes,
            }
        })

        return NextResponse.json({ success: true, warranty: updated })
    } catch (error: any) {
        console.error("Error updating warranty:", error)
        return NextResponse.json({ error: error.message || "Failed to update warranty" }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await checkAdminAuth()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        await db.warranty.delete({ where: { id } })
        return NextResponse.json({ success: true, message: "Warranty deleted" })
    } catch (error: any) {
        console.error("Error deleting warranty:", error)
        return NextResponse.json({ error: error.message || "Failed to delete warranty" }, { status: 500 })
    }
}

