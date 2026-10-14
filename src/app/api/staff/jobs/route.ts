import { NextRequest, NextResponse } from "next/server"
import { getStaffContext } from "@/lib/auth/staff-auth"
import { db } from "@/lib/db"

const DEFAULT_CHECKLIST = [
    { id: "1", task: "Initial Vehicle Inspection & Walkaround", isDone: false },
    { id: "2", task: "High-Pressure Foam Wash & Decontamination", isDone: false },
    { id: "3", task: "Surface Prep / Scratch Assessment", isDone: false },
    { id: "4", task: "Primary Repair / Detailing / Service Execution", isDone: false },
    { id: "5", task: "Quality Inspection & Final Detailing Wipe", isDone: false },
]

export async function GET(request: NextRequest) {
    const ctx = await getStaffContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get("status") || ""
        const search = searchParams.get("search") || ""

        // Auto-sync: If any invoices are assigned to this staff member but have no job card yet, create one
        try {
            const assignedInvoices = await db.invoice.findMany({
                where: {
                    assignedStaffId: ctx.staff.id,
                    jobCards: { none: {} }
                },
                include: { client: true },
                take: 10
            })

            for (const inv of assignedInvoices) {
                await db.staffJobCard.create({
                    data: {
                        jobNumber: `JOB-${inv.invoiceNumber}`,
                        shopId: ctx.staff.shopId,
                        staffId: ctx.staff.id,
                        invoiceId: inv.id,
                        vehicleName: inv.vehicleName || "Assigned Vehicle",
                        vehicleRegNo: inv.vehicleRegNo || "UNREGISTERED",
                        vehicleChassis: inv.vehicleChassis || null,
                        odometer: inv.odometer || null,
                        clientName: inv.client?.name || "Customer",
                        clientPhone: inv.client?.phone || null,
                        jobCategory: "DETAILING",
                        priority: "NORMAL",
                        status: "ASSIGNED",
                        checklist: JSON.stringify(DEFAULT_CHECKLIST),
                        workSummary: "",
                        partsConsumed: "[]",
                        workImages: "[]",
                        commissionAmount: (inv.grandTotal * (ctx.staff.commissionRate || 0)) / 100
                    }
                })
            }
        } catch (syncErr) {
            console.error("Auto-sync invoice job cards warning:", syncErr)
        }

        const where: any = {
            staffId: ctx.staff.id
        }

        if (status && status !== "ALL") {
            where.status = status
        }

        if (search) {
            where.OR = [
                { vehicleName: { contains: search } },
                { vehicleRegNo: { contains: search } },
                { clientName: { contains: search } },
                { jobNumber: { contains: search } }
            ]
        }

        const jobs = await db.staffJobCard.findMany({
            where,
            orderBy: [
                { status: "asc" },
                { updatedAt: "desc" }
            ],
            include: {
                invoice: {
                    select: {
                        id: true,
                        invoiceNumber: true,
                        grandTotal: true,
                        status: true
                    }
                }
            }
        })

        // Counts
        const allCount = await db.staffJobCard.count({ where: { staffId: ctx.staff.id } })
        const assignedCount = await db.staffJobCard.count({ where: { staffId: ctx.staff.id, status: "ASSIGNED" } })
        const inProgressCount = await db.staffJobCard.count({ where: { staffId: ctx.staff.id, status: "IN_PROGRESS" } })
        const completedCount = await db.staffJobCard.count({ where: { staffId: ctx.staff.id, status: "COMPLETED" } })

        return NextResponse.json({
            success: true,
            jobs,
            counts: {
                all: allCount,
                assigned: assignedCount,
                inProgress: inProgressCount,
                completed: completedCount
            }
        })
    } catch (error: any) {
        console.error("Error fetching staff jobs:", error)
        return NextResponse.json({ error: error?.message || "Failed to fetch jobs" }, { status: 500 })
    }
}

// POST create a new Job Card
export async function POST(request: NextRequest) {
    const ctx = await getStaffContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const {
            vehicleName,
            vehicleRegNo,
            vehicleChassis,
            odometer,
            clientName,
            clientPhone,
            jobCategory,
            priority,
            checklist,
            workSummary,
            partsConsumed,
            commissionAmount
        } = body

        if (!vehicleName || !vehicleRegNo) {
            return NextResponse.json({ error: "Vehicle Name and Registration Number are required" }, { status: 400 })
        }

        const jobCount = await db.staffJobCard.count({ where: { shopId: ctx.staff.shopId } })
        const jobNumber = `JC-${String(jobCount + 1).padStart(4, "0")}`

        const newJob = await db.staffJobCard.create({
            data: {
                jobNumber,
                shopId: ctx.staff.shopId,
                staffId: ctx.staff.id,
                vehicleName: vehicleName.trim(),
                vehicleRegNo: vehicleRegNo.trim().toUpperCase(),
                vehicleChassis: vehicleChassis ? vehicleChassis.trim() : null,
                odometer: odometer ? String(odometer).trim() : null,
                clientName: clientName ? clientName.trim() : "Walk-in Customer",
                clientPhone: clientPhone ? clientPhone.trim() : null,
                jobCategory: jobCategory || "DETAILING",
                priority: priority || "NORMAL",
                status: "ASSIGNED",
                checklist: checklist ? JSON.stringify(checklist) : JSON.stringify(DEFAULT_CHECKLIST),
                workSummary: workSummary || "",
                partsConsumed: partsConsumed ? JSON.stringify(partsConsumed) : "[]",
                workImages: "[]",
                commissionAmount: parseFloat(commissionAmount) || 0
            }
        })

        return NextResponse.json({
            success: true,
            job: newJob,
            message: `Job Card ${jobNumber} created successfully`
        })
    } catch (error: any) {
        console.error("Error creating job card:", error)
        return NextResponse.json({ error: error?.message || "Failed to create job card" }, { status: 500 })
    }
}
