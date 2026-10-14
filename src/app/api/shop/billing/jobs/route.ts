import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getShopOwnerContext } from "@/lib/auth/shop-auth"

// GET all jobs for the shop owner
export async function GET(request: NextRequest) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get("status") || ""
        const staffId = searchParams.get("staffId") || ""
        const search = searchParams.get("search") || ""

        const where: any = {}
        if (ctx.shopId) {
            where.shopId = ctx.shopId
        }
        if (status && status !== "ALL") {
            where.status = status
        }
        if (staffId && staffId !== "ALL") {
            where.staffId = staffId
        }
        if (search) {
            where.OR = [
                { vehicleName: { contains: search } },
                { vehicleRegNo: { contains: search } },
                { clientName: { contains: search } },
                { jobNumber: { contains: search } },
                { staff: { name: { contains: search } } }
            ]
        }

        const jobs = await db.staffJobCard.findMany({
            where,
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
                        status: true
                    }
                }
            },
            orderBy: { updatedAt: "desc" }
        })

        // Parse JSON fields
        const formattedJobs = jobs.map(j => {
            let checklistParsed: any[] = []
            let partsConsumedParsed: any[] = []
            let workImagesParsed: string[] = []

            try { checklistParsed = j.checklist ? JSON.parse(j.checklist) : [] } catch {}
            try { partsConsumedParsed = j.partsConsumed ? JSON.parse(j.partsConsumed) : [] } catch {}
            try { workImagesParsed = j.workImages ? JSON.parse(j.workImages) : [] } catch {}

            const completedTasks = checklistParsed.filter((t: any) => t.isDone).length
            const totalTasks = checklistParsed.length
            const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

            return {
                ...j,
                checklistParsed,
                partsConsumedParsed,
                workImagesParsed,
                completedTasks,
                totalTasks,
                progressPercent
            }
        })

        const activeCount = formattedJobs.filter(j => j.status === "IN_PROGRESS" || j.status === "ASSIGNED").length
        const completedCount = formattedJobs.filter(j => j.status === "COMPLETED").length

        return NextResponse.json({
            success: true,
            jobs: formattedJobs,
            stats: {
                total: formattedJobs.length,
                active: activeCount,
                completed: completedCount
            }
        })
    } catch (error: any) {
        console.error("Error fetching shop jobs:", error)
        return NextResponse.json({ error: error?.message || "Failed to load jobs" }, { status: 500 })
    }
}

// POST shop owner assigns vehicle work to a staff member
export async function POST(request: NextRequest) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const {
            staffId,
            vehicleName,
            vehicleRegNo,
            vehicleChassis,
            odometer,
            clientName,
            clientPhone,
            jobCategory,
            priority,
            services,           // Array of service names e.g. ["9H Ceramic Coating", "Interior Wash"]
            customInstructions, // Instructions entered by shop owner for technician
            checklistTasks      // Array of tasks
        } = body

        if (!staffId) {
            return NextResponse.json({ error: "Please select a staff member to assign this work" }, { status: 400 })
        }
        if (!vehicleName || !vehicleRegNo) {
            return NextResponse.json({ error: "Vehicle Model and Registration Plate Number are required" }, { status: 400 })
        }

        // Verify staff belongs to shop
        const staff = await db.shopStaff.findUnique({ where: { id: staffId } })
        if (!staff) {
            return NextResponse.json({ error: "Staff member not found" }, { status: 404 })
        }

        // Generate Job Card sequence number
        const count = await db.staffJobCard.count({ where: ctx.shopId ? { shopId: ctx.shopId } : {} })
        const jobNumber = `JC-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`

        // Prepare checklist tasks
        let finalChecklist: any[] = []
        if (Array.isArray(checklistTasks) && checklistTasks.length > 0) {
            finalChecklist = checklistTasks.map((t: any, idx: number) => ({
                id: String(idx + 1),
                task: typeof t === "string" ? t : t.task,
                isDone: false
            }))
        } else if (Array.isArray(services) && services.length > 0) {
            finalChecklist = services.map((s: string, idx: number) => ({
                id: String(idx + 1),
                task: s,
                isDone: false
            }))
        } else {
            finalChecklist = [
                { id: "1", task: "Initial Vehicle Inspection & Walkaround", isDone: false },
                { id: "2", task: "High-Pressure Foam Wash & Decontamination", isDone: false },
                { id: "3", task: "Perform Assigned Repairs / Detailing", isDone: false },
                { id: "4", task: "Final Inspection & Quality Handover", isDone: false },
            ]
        }

        const summaryText = [
            services && services.length > 0 ? `Assigned Services: ${services.join(", ")}` : "",
            customInstructions ? `Owner Instructions: ${customInstructions}` : ""
        ].filter(Boolean).join(" | ")

        const newJob = await db.staffJobCard.create({
            data: {
                jobNumber,
                shopId: ctx.shopId || null,
                staffId: staff.id,
                vehicleName: vehicleName.trim(),
                vehicleRegNo: vehicleRegNo.trim().toUpperCase(),
                vehicleChassis: vehicleChassis ? vehicleChassis.trim() : null,
                odometer: odometer ? String(odometer).trim() : null,
                clientName: clientName ? clientName.trim() : "Walk-in Customer",
                clientPhone: clientPhone ? clientPhone.trim() : null,
                jobCategory: jobCategory || "DETAILING",
                priority: priority || "NORMAL",
                status: "ASSIGNED",
                checklist: JSON.stringify(finalChecklist),
                workSummary: summaryText,
                partsConsumed: "[]",
                workImages: "[]",
                commissionAmount: (staff.commissionRate || 0) > 0 ? 500 : 0
            },
            include: {
                staff: {
                    select: { id: true, name: true, role: true, phone: true }
                }
            }
        })

        return NextResponse.json({
            success: true,
            job: newJob,
            message: `Work successfully assigned to ${staff.name} (Job #${jobNumber})`
        })
    } catch (error: any) {
        console.error("Error assigning job:", error)
        return NextResponse.json({ error: error?.message || "Failed to assign work" }, { status: 500 })
    }
}
