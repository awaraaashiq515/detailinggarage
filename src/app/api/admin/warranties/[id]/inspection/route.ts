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

export async function POST(
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
        const { inspector, notes, status, date } = body

        const warranty = await db.warranty.findUnique({ where: { id } })
        if (!warranty) {
            return NextResponse.json({ error: "Warranty not found" }, { status: 404 })
        }

        const inspDate = date ? new Date(date) : new Date()

        // Create inspection log
        const inspection = await db.warrantyInspection.create({
            data: {
                warrantyId: id,
                date: inspDate,
                inspector: inspector || user.name || "Technician",
                notes: notes || "Annual warranty maintenance inspection passed.",
                status: status || "PASSED"
            }
        })

        // Compute next inspection date (1 year from this inspection)
        const nextDate = new Date(inspDate)
        nextDate.setFullYear(nextDate.getFullYear() + 1)

        // If next inspection date is within warranty period, update it
        const updatedWarranty = await db.warranty.update({
            where: { id },
            data: {
                nextInspectionDate: nextDate,
                status: "Active"
            },
            include: {
                inspections: {
                    orderBy: { date: "desc" }
                }
            }
        })

        return NextResponse.json({
            success: true,
            inspection,
            warranty: updatedWarranty
        })
    } catch (error: any) {
        console.error("Error logging inspection:", error)
        return NextResponse.json({ error: error.message || "Failed to log inspection" }, { status: 500 })
    }
}

