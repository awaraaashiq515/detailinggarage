import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getShopOwnerContext } from "@/lib/auth/shop-auth"

// GET full job card with technician logs
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const ctx = await getShopOwnerContext()
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

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
                        email: true,
                        specialization: true
                    }
                },
                invoice: {
                    select: {
                        id: true,
                        invoiceNumber: true,
                        grandTotal: true,
                        status: true,
                        date: true
                    }
                }
            }
        })

        if (!job) {
            return NextResponse.json({ error: "Job card not found" }, { status: 404 })
        }

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
        console.error("Error fetching job details:", error)
        return NextResponse.json({ error: error?.message || "Failed to load job" }, { status: 500 })
    }
}

// PUT update job by shop owner (status, reassign staff, notes)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const ctx = await getShopOwnerContext()
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { id } = await params
        const body = await request.json()

        const existing = await db.staffJobCard.findUnique({ where: { id } })
        if (!existing) return NextResponse.json({ error: "Job card not found" }, { status: 404 })

        const updated = await db.staffJobCard.update({
            where: { id },
            data: {
                ...(body.staffId ? { staffId: body.staffId } : {}),
                ...(body.status ? { status: body.status } : {}),
                ...(body.priority ? { priority: body.priority } : {}),
                ...(body.workSummary !== undefined ? { workSummary: body.workSummary } : {}),
                ...(body.checklist ? { checklist: typeof body.checklist === "string" ? body.checklist : JSON.stringify(body.checklist) } : {})
            }
        })

        return NextResponse.json({ success: true, job: updated, message: "Job card updated" })
    } catch (error: any) {
        console.error("Error updating job:", error)
        return NextResponse.json({ error: error?.message || "Failed to update job" }, { status: 500 })
    }
}

// DELETE job card
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const ctx = await getShopOwnerContext()
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { id } = await params
        await db.staffJobCard.delete({ where: { id } })
        return NextResponse.json({ success: true, message: "Job card removed" })
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || "Failed to delete job" }, { status: 500 })
    }
}
