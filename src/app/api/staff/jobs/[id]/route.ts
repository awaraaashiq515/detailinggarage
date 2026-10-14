import { NextRequest, NextResponse } from "next/server"
import { getStaffContext } from "@/lib/auth/staff-auth"
import { db } from "@/lib/db"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const ctx = await getStaffContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const job = await db.staffJobCard.findUnique({
            where: { id },
            include: {
                staff: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        phone: true,
                        specialization: true
                    }
                },
                invoice: {
                    select: {
                        id: true,
                        invoiceNumber: true,
                        grandTotal: true,
                        status: true,
                        date: true,
                        items: {
                            select: {
                                id: true,
                                name: true,
                                quantity: true,
                                total: true
                            }
                        }
                    }
                }
            }
        })

        if (!job) {
            return NextResponse.json({ error: "Job card not found" }, { status: 404 })
        }

        // Parse JSON fields
        let checklistParsed: any[] = []
        let partsConsumedParsed: any[] = []
        let workImagesParsed: string[] = []

        try { checklistParsed = job.checklist ? JSON.parse(job.checklist) : [] } catch {}
        try { partsConsumedParsed = job.partsConsumed ? JSON.parse(job.partsConsumed) : [] } catch {}
        try { workImagesParsed = job.workImages ? JSON.parse(job.workImages) : [] } catch {}

        return NextResponse.json({
            success: true,
            job: {
                ...job,
                checklistParsed,
                partsConsumedParsed,
                workImagesParsed
            }
        })
    } catch (error: any) {
        console.error("Error fetching job card:", error)
        return NextResponse.json({ error: error?.message || "Failed to load job card" }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const ctx = await getStaffContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const body = await request.json()
        const {
            status,
            checklist,
            workSummary,
            partsConsumed,
            workImages,
            actualHours,
            notes
        } = body

        const existingJob = await db.staffJobCard.findUnique({ where: { id } })
        if (!existingJob) {
            return NextResponse.json({ error: "Job card not found" }, { status: 404 })
        }

        const dataToUpdate: any = {}

        if (status && status !== existingJob.status) {
            dataToUpdate.status = status
            if (status === "IN_PROGRESS" && !existingJob.startedAt) {
                dataToUpdate.startedAt = new Date()
            }
            if (status === "COMPLETED" && !existingJob.completedAt) {
                dataToUpdate.completedAt = new Date()
            }
        }

        if (checklist !== undefined) {
            dataToUpdate.checklist = Array.isArray(checklist) ? JSON.stringify(checklist) : checklist
        }

        if (workSummary !== undefined) {
            dataToUpdate.workSummary = workSummary
        }

        if (partsConsumed !== undefined) {
            dataToUpdate.partsConsumed = Array.isArray(partsConsumed) ? JSON.stringify(partsConsumed) : partsConsumed
        }

        if (workImages !== undefined) {
            dataToUpdate.workImages = Array.isArray(workImages) ? JSON.stringify(workImages) : workImages
        }

        if (actualHours !== undefined) {
            dataToUpdate.actualHours = parseFloat(actualHours) || null
        }

        const updatedJob = await db.staffJobCard.update({
            where: { id },
            data: dataToUpdate
        })

        return NextResponse.json({
            success: true,
            job: updatedJob,
            message: "Job Card work log updated successfully"
        })
    } catch (error: any) {
        console.error("Error updating job card:", error)
        return NextResponse.json({ error: error?.message || "Failed to update job card" }, { status: 500 })
    }
}
