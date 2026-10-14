import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getShopOwnerContext } from "@/lib/auth/shop-auth"

function cleanReg(reg?: string | null): string {
    if (!reg) return ""
    return reg.trim().toUpperCase().replace(/[^A-Z0-9]/g, "")
}

function formatPlate(reg?: string | null): string {
    if (!reg) return "NOT SPECIFIED"
    const trimmed = reg.trim().toUpperCase()
    if (trimmed.includes(" ")) return trimmed
    const clean = trimmed.replace(/[^A-Z0-9]/g, "")
    const m = clean.match(/^([A-Z]{2})(\d{1,2})([A-Z]{1,3})?(\d{1,4})$/)
    if (m) {
        return `${m[1]} ${m[2]}${m[3] ? " " + m[3] : ""} ${m[4]}`.trim()
    }
    return trimmed
}

export async function GET(request: NextRequest) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const search = (searchParams.get("search") || "").trim().toLowerCase()
        const status = searchParams.get("status") || "ALL"
        const timeframe = searchParams.get("timeframe") || "all"
        const sortBy = searchParams.get("sortBy") || "recent"

        const whereShop: any = {}
        if (!ctx.isAdmin && ctx.shopId) {
            whereShop.shopId = ctx.shopId
        }

        // Fetch all invoices, job cards, clients, and claims in parallel
        const [invoices, jobCards, clients, pdis, claims] = await Promise.all([
            db.invoice.findMany({
                where: whereShop,
                include: {
                    client: true,
                    items: true,
                    payments: true,
                    assignedStaff: { select: { id: true, name: true, role: true, phone: true } }
                },
                orderBy: { date: "desc" }
            }).catch(() => []),
            db.staffJobCard.findMany({
                where: whereShop,
                include: {
                    staff: { select: { id: true, name: true, role: true, phone: true } },
                    invoice: { select: { id: true, invoiceNumber: true, status: true, grandTotal: true, amountPaid: true } }
                },
                orderBy: { createdAt: "desc" }
            }).catch(() => []),
            db.billingClient.findMany({
                where: whereShop,
                orderBy: { createdAt: "desc" }
            }).catch(() => []),
            (db as any).pDIInspection ? (db as any).pDIInspection.findMany({
                where: whereShop,
                orderBy: { inspectionDate: "desc" }
            }).catch(() => []) : Promise.resolve([]),
            (db as any).insuranceClaim ? (db as any).insuranceClaim.findMany({
                where: whereShop,
                orderBy: { createdAt: "desc" }
            }).catch(() => []) : Promise.resolve([])
        ])

        interface VehicleAggregate {
            id: string
            vehicleRegNo: string
            normalizedReg: string
            vehicleName: string
            vehicleChassis?: string | null
            odometer?: string | null
            client: {
                id?: string
                name: string
                phone?: string | null
                email?: string | null
                address?: string | null
            }
            visitsCount: number
            totalBilled: number
            totalPaid: number
            balanceDue: number
            paymentStatus: "PAID" | "PARTIAL" | "UNPAID"
            currentStatus: "IN_WORKSHOP" | "COMPLETED" | "DELIVERED"
            activeJobNumber?: string | null
            lastServiceDate: string
            firstServiceDate: string
            services: string[]
            technicians: string[]
            invoices: any[]
            jobCards: any[]
            pdiReports: any[]
            insuranceClaims: any[]
        }

        const vehicleMap = new Map<string, VehicleAggregate>()

        const getOrCreateVehicle = (regNo?: string | null, fallbackName?: string | null, clientObj?: any): VehicleAggregate => {
            const rawReg = (regNo || "").trim()
            const cReg = cleanReg(rawReg)
            const clientPhone = clientObj?.phone ? clientObj.phone.replace(/[^0-9]/g, "") : ""
            const clientName = clientObj?.name ? clientObj.name.trim() : ""

            // Key selection: clean plate if available, else phone + model, else fallback
            let key = ""
            if (cReg && cReg.length >= 4) {
                key = `REG_${cReg}`
            } else if (clientPhone) {
                key = `PHONE_${clientPhone}_${(fallbackName || "").toUpperCase().replace(/[^A-Z0-9]/g, "")}`
            } else if (clientName) {
                key = `CLIENT_${clientName.toUpperCase()}_${(fallbackName || "").toUpperCase().replace(/[^A-Z0-9]/g, "")}`
            } else {
                key = `VEH_${Math.random().toString(36).substring(7)}`
            }

            if (!vehicleMap.has(key)) {
                vehicleMap.set(key, {
                    id: key,
                    vehicleRegNo: formatPlate(rawReg || "NOT SPECIFIED"),
                    normalizedReg: cReg || "UNKNOWN",
                    vehicleName: (fallbackName || "Vehicle").trim(),
                    vehicleChassis: null,
                    odometer: null,
                    client: {
                        id: clientObj?.id,
                        name: clientObj?.name || "Walk-in Customer",
                        phone: clientObj?.phone || null,
                        email: clientObj?.email || null,
                        address: clientObj?.address || null,
                    },
                    visitsCount: 0,
                    totalBilled: 0,
                    totalPaid: 0,
                    balanceDue: 0,
                    paymentStatus: "PAID",
                    currentStatus: "DELIVERED",
                    activeJobNumber: null,
                    lastServiceDate: new Date(0).toISOString(),
                    firstServiceDate: new Date().toISOString(),
                    services: [],
                    technicians: [],
                    invoices: [],
                    jobCards: [],
                    pdiReports: [],
                    insuranceClaims: []
                })
            }

            const rec = vehicleMap.get(key)!
            // Prefer richer details if available
            if (rawReg && (!rec.vehicleRegNo || rec.vehicleRegNo === "NOT SPECIFIED")) {
                rec.vehicleRegNo = formatPlate(rawReg)
                rec.normalizedReg = cReg
            }
            if (fallbackName && (!rec.vehicleName || rec.vehicleName === "Vehicle")) {
                rec.vehicleName = fallbackName.trim()
            }
            if (clientObj?.name && rec.client.name === "Walk-in Customer") {
                rec.client.name = clientObj.name
                rec.client.phone = clientObj.phone || rec.client.phone
                rec.client.email = clientObj.email || rec.client.email
                rec.client.address = clientObj.address || rec.client.address
            }
            return rec
        }

        // 1. Process Job Cards
        for (const j of jobCards) {
            const v = getOrCreateVehicle(j.vehicleRegNo, j.vehicleName, {
                name: j.clientName,
                phone: j.clientPhone
            })

            let parsedChecklist: any[] = []
            try { parsedChecklist = j.checklist ? JSON.parse(j.checklist) : [] } catch {}

            v.jobCards.push({
                id: j.id,
                jobNumber: j.jobNumber,
                status: j.status,
                priority: j.priority,
                jobCategory: j.jobCategory,
                createdAt: j.createdAt,
                updatedAt: j.updatedAt,
                workSummary: j.workSummary,
                technician: j.staff ? { name: j.staff.name, role: j.staff.role, phone: j.staff.phone } : null,
                tasks: parsedChecklist,
                completedTasksCount: parsedChecklist.filter((t: any) => t.isDone).length,
                totalTasksCount: parsedChecklist.length
            })

            if (j.status === "ASSIGNED" || j.status === "IN_PROGRESS") {
                v.currentStatus = "IN_WORKSHOP"
                v.activeJobNumber = j.jobNumber
            }

            if (j.staff?.name && !v.technicians.includes(j.staff.name)) {
                v.technicians.push(j.staff.name)
            }

            if (j.vehicleChassis && !v.vehicleChassis) v.vehicleChassis = j.vehicleChassis
            if (j.odometer) v.odometer = j.odometer

            // Extract services from checklist or summary
            parsedChecklist.forEach((t: any) => {
                if (t.task && !v.services.includes(t.task)) {
                    v.services.push(t.task)
                }
            })
            if (j.jobCategory && !v.services.includes(j.jobCategory)) {
                v.services.push(j.jobCategory)
            }

            const jDate = new Date(j.createdAt).toISOString()
            if (jDate > v.lastServiceDate) v.lastServiceDate = jDate
            if (jDate < v.firstServiceDate) v.firstServiceDate = jDate
        }

        // 2. Process Invoices
        for (const inv of invoices) {
            // Find or associate
            const reg = inv.vehicleRegNo || inv.client?.vehicleRegNo
            const name = inv.vehicleName || inv.client?.vehicleName || "Vehicle"
            const v = getOrCreateVehicle(reg, name, inv.client)

            if (inv.vehicleChassis && !v.vehicleChassis) v.vehicleChassis = inv.vehicleChassis
            if (inv.odometer) v.odometer = inv.odometer

            if (inv.assignedStaff?.name && !v.technicians.includes(inv.assignedStaff.name)) {
                v.technicians.push(inv.assignedStaff.name)
            }

            inv.items?.forEach((it: any) => {
                if (it.name && !v.services.includes(it.name)) {
                    v.services.push(it.name)
                }
            })

            v.totalBilled += inv.grandTotal || 0
            v.totalPaid += inv.amountPaid || 0

            const invDate = new Date(inv.date).toISOString()
            if (invDate > v.lastServiceDate) v.lastServiceDate = invDate
            if (invDate < v.firstServiceDate) v.firstServiceDate = invDate

            v.invoices.push({
                id: inv.id,
                invoiceNumber: inv.invoiceNumber,
                type: inv.type,
                date: inv.date,
                status: inv.status,
                grandTotal: inv.grandTotal,
                amountPaid: inv.amountPaid,
                balanceDue: Math.max(0, (inv.grandTotal || 0) - (inv.amountPaid || 0)),
                itemsCount: inv.items?.length || 0,
                items: inv.items || []
            })
        }

        // 3. Process Billing Clients who have registered vehicles but maybe no invoice yet
        for (const cl of clients) {
            if (cl.vehicleRegNo || cl.vehicleName) {
                const v = getOrCreateVehicle(cl.vehicleRegNo, cl.vehicleName, cl)
                if (cl.vehicleChassis && !v.vehicleChassis) v.vehicleChassis = cl.vehicleChassis
                if (cl.odometer && !v.odometer) v.odometer = cl.odometer
            }
        }

        // 4. Process PDI reports
        for (const pdi of pdis) {
            const makeModel = `${pdi.vehicleMake || ""} ${pdi.vehicleModel || ""}`.trim()
            const v = getOrCreateVehicle(pdi.vin, makeModel, {
                name: pdi.customerName,
                phone: pdi.customerPhone,
                email: pdi.customerEmail
            })
            if (pdi.vin && !v.vehicleChassis) v.vehicleChassis = pdi.vin
            if (pdi.odometer && !v.odometer) v.odometer = pdi.odometer
            v.pdiReports.push({
                id: pdi.id,
                makeModel,
                date: pdi.inspectionDate,
                status: pdi.status,
                pdfUrl: pdi.pdfUrl
            })
        }

        // 5. Process Claims
        for (const clm of claims) {
            const makeModel = `${clm.vehicleMake || ""} ${clm.vehicleModel || ""}`.trim()
            const v = getOrCreateVehicle(clm.registrationNumber, makeModel, {
                name: clm.customerCity || "Insurance Client"
            })
            if (clm.chassisNumber && !v.vehicleChassis) v.vehicleChassis = clm.chassisNumber
            v.insuranceClaims.push({
                id: clm.id,
                claimNumber: clm.claimNumber,
                date: clm.createdAt,
                status: clm.status
            })
        }

        // Finalize calculations
        const now = new Date()
        let vehiclesList: VehicleAggregate[] = Array.from(vehicleMap.values()).map(v => {
            const balanceDue = Math.max(0, v.totalBilled - v.totalPaid)
            v.balanceDue = balanceDue

            if (balanceDue <= 0 && v.totalBilled > 0) {
                v.paymentStatus = "PAID"
            } else if (v.totalPaid > 0 && balanceDue > 0) {
                v.paymentStatus = "PARTIAL"
            } else if (v.totalBilled > 0) {
                v.paymentStatus = "UNPAID"
            } else {
                v.paymentStatus = "PAID"
            }

            // Calculate total unique service visits
            const distinctVisitDates = new Set([
                ...v.invoices.map(i => i.date ? new Date(i.date).toDateString() : ""),
                ...v.jobCards.map(j => j.createdAt ? new Date(j.createdAt).toDateString() : "")
            ].filter(Boolean))

            v.visitsCount = Math.max(1, distinctVisitDates.size)

            if (v.lastServiceDate === new Date(0).toISOString()) {
                v.lastServiceDate = new Date().toISOString()
            }

            return v
        })

        // Apply Timeframe Filter
        if (timeframe !== "all") {
            const filterTime = new Date()
            if (timeframe === "today") {
                filterTime.setHours(0, 0, 0, 0)
            } else if (timeframe === "week") {
                filterTime.setDate(now.getDate() - 7)
            } else if (timeframe === "month") {
                filterTime.setMonth(now.getMonth() - 1)
            }
            vehiclesList = vehiclesList.filter(v => new Date(v.lastServiceDate) >= filterTime)
        }

        // Apply Status Filter
        if (status === "IN_WORKSHOP") {
            vehiclesList = vehiclesList.filter(v => v.currentStatus === "IN_WORKSHOP")
        } else if (status === "COMPLETED") {
            vehiclesList = vehiclesList.filter(v => v.currentStatus !== "IN_WORKSHOP")
        } else if (status === "HAS_BALANCE") {
            vehiclesList = vehiclesList.filter(v => v.balanceDue > 0)
        } else if (status === "REPEAT") {
            vehiclesList = vehiclesList.filter(v => v.visitsCount > 1)
        }

        // Apply Search
        if (search) {
            vehiclesList = vehiclesList.filter(v => {
                return (
                    v.vehicleRegNo.toLowerCase().includes(search) ||
                    v.normalizedReg.toLowerCase().includes(search) ||
                    v.vehicleName.toLowerCase().includes(search) ||
                    v.client.name.toLowerCase().includes(search) ||
                    (v.client.phone && v.client.phone.includes(search)) ||
                    v.services.some(s => s.toLowerCase().includes(search)) ||
                    v.technicians.some(t => t.toLowerCase().includes(search)) ||
                    (v.vehicleChassis && v.vehicleChassis.toLowerCase().includes(search))
                )
            })
        }

        // Apply Sort
        if (sortBy === "recent") {
            vehiclesList.sort((a, b) => new Date(b.lastServiceDate).getTime() - new Date(a.lastServiceDate).getTime())
        } else if (sortBy === "amount") {
            vehiclesList.sort((a, b) => b.totalBilled - a.totalBilled)
        } else if (sortBy === "visits") {
            vehiclesList.sort((a, b) => b.visitsCount - a.visitsCount)
        } else if (sortBy === "balance") {
            vehiclesList.sort((a, b) => b.balanceDue - a.balanceDue)
        } else if (sortBy === "reg") {
            vehiclesList.sort((a, b) => a.vehicleRegNo.localeCompare(b.vehicleRegNo))
        }

        // Summary KPI Metrics
        const allVehicles = Array.from(vehicleMap.values())
        const totalVehicles = allVehicles.length
        const inWorkshopCount = allVehicles.filter(v => v.currentStatus === "IN_WORKSHOP").length
        const totalRevenue = allVehicles.reduce((s, v) => s + v.totalBilled, 0)
        const totalPendingBalance = allVehicles.reduce((s, v) => s + v.balanceDue, 0)
        const repeatCount = allVehicles.filter(v => v.visitsCount > 1).length

        // Top Services tally
        const serviceFrequency: Record<string, number> = {}
        allVehicles.forEach(v => {
            v.services.forEach(s => {
                if (s && s.length > 2 && s !== "Vehicle Inspection") {
                    serviceFrequency[s] = (serviceFrequency[s] || 0) + 1
                }
            })
        })
        const topServices = Object.entries(serviceFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([name, count]) => ({ name, count }))

        return NextResponse.json({
            success: true,
            vehicles: vehiclesList,
            stats: {
                totalVehicles,
                inWorkshopCount,
                totalRevenue,
                totalPendingBalance,
                repeatCount,
                topServices
            }
        })
    } catch (error: any) {
        console.error("Error aggregating vehicle records:", error)
        return NextResponse.json({ error: error?.message || "Failed to load vehicle records" }, { status: 500 })
    }
}

// POST: Direct Vehicle Service Entry (Quick Record / Job Card + Invoice)
export async function POST(request: NextRequest) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const {
            vehicleRegNo,
            vehicleName,
            vehicleChassis,
            odometer,
            clientName,
            clientPhone,
            clientEmail,
            clientAddress,
            jobCategory,
            services = [],
            staffId,
            notes,
            amount = 0,
            amountPaid = 0,
            paymentMethod = "UPI",
            status = "IN_PROGRESS"
        } = body

        if (!vehicleRegNo || !vehicleName) {
            return NextResponse.json({ error: "Vehicle Registration Number and Model are required" }, { status: 400 })
        }

        const cleanPlate = vehicleRegNo.trim().toUpperCase()
        const cPhone = clientPhone ? clientPhone.trim() : null
        const cName = clientName ? clientName.trim() : "Walk-in Customer"

        // 1. Find or create client
        let client = null
        if (cPhone) {
            client = await db.billingClient.findFirst({
                where: {
                    phone: cPhone,
                    ...(ctx.shopId ? { shopId: ctx.shopId } : {})
                }
            })
        }

        if (!client) {
            client = await db.billingClient.create({
                data: {
                    name: cName,
                    phone: cPhone,
                    email: clientEmail ? clientEmail.trim() : null,
                    address: clientAddress ? clientAddress.trim() : null,
                    vehicleName: vehicleName.trim(),
                    vehicleRegNo: cleanPlate,
                    vehicleChassis: vehicleChassis ? vehicleChassis.trim() : null,
                    odometer: odometer ? String(odometer).trim() : null,
                    shopId: ctx.shopId || null
                }
            })
        } else {
            // Update client's vehicle if empty
            await db.billingClient.update({
                where: { id: client.id },
                data: {
                    vehicleName: vehicleName.trim(),
                    vehicleRegNo: cleanPlate,
                    odometer: odometer ? String(odometer).trim() : client.odometer,
                    vehicleChassis: vehicleChassis ? vehicleChassis.trim() : client.vehicleChassis
                }
            })
        }

        // 2. Resolve staff member
        let staff = null
        if (staffId) {
            staff = await db.shopStaff.findUnique({ where: { id: staffId } })
        }
        if (!staff) {
            staff = await db.shopStaff.findFirst({
                where: ctx.shopId ? { shopId: ctx.shopId, status: "ACTIVE" } : { status: "ACTIVE" }
            })
        }

        // 3. Create Job Card sequence number
        const jobCount = await db.staffJobCard.count({ where: ctx.shopId ? { shopId: ctx.shopId } : {} })
        const jobNumber = `JC-${new Date().getFullYear()}-${String(jobCount + 1).padStart(4, "0")}`

        const serviceList = Array.isArray(services) && services.length > 0 ? services : ["General Detailing & Inspection"]
        const checklist = serviceList.map((s: string, idx: number) => ({
            id: String(idx + 1),
            task: s,
            isDone: status === "COMPLETED" || status === "DELIVERED"
        }))

        // 4. Optionally create Invoice if amount is given
        let invoiceId: string | null = null
        const numericAmount = Number(amount) || 0
        const numericPaid = Number(amountPaid) || 0

        if (numericAmount > 0) {
            const invCount = await db.invoice.count({
                where: {
                    type: "INVOICE",
                    ...(ctx.shopId ? { shopId: ctx.shopId } : {})
                }
            })
            const invNum = `INV-${new Date().getFullYear()}-${String(invCount + 1).padStart(4, "0")}`
            const invoiceStatus = numericPaid >= numericAmount ? "PAID" : numericPaid > 0 ? "PARTIALLY_PAID" : "UNPAID"

            const createdInvoice = await db.invoice.create({
                data: {
                    invoiceNumber: invNum,
                    type: "INVOICE",
                    clientId: client.id,
                    shopId: ctx.shopId || null,
                    vehicleName: vehicleName.trim(),
                    vehicleRegNo: cleanPlate,
                    vehicleChassis: vehicleChassis ? vehicleChassis.trim() : null,
                    odometer: odometer ? String(odometer).trim() : null,
                    assignedStaffId: staff ? staff.id : null,
                    status: invoiceStatus,
                    subTotal: numericAmount,
                    taxTotal: 0,
                    grandTotal: numericAmount,
                    amountPaid: numericPaid,
                    notes: notes || `Service record for ${vehicleName.trim()} (${cleanPlate})`,
                    items: {
                        create: serviceList.map((s: string) => ({
                            name: s,
                            rate: Math.round(numericAmount / serviceList.length),
                            taxRate: 0,
                            quantity: 1,
                            total: Math.round(numericAmount / serviceList.length)
                        }))
                    },
                    payments: numericPaid > 0 ? {
                        create: {
                            amount: numericPaid,
                            paymentMethod: paymentMethod || "UPI",
                            notes: "Payment recorded during vehicle entry"
                        }
                    } : undefined
                }
            })
            invoiceId = createdInvoice.id
        }

        // 5. Create Job Card
        const jobCardStatus = status === "DELIVERED" ? "DELIVERED" : status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS"
        const jobCard = await db.staffJobCard.create({
            data: {
                jobNumber,
                shopId: ctx.shopId || null,
                staffId: staff ? staff.id : "",
                invoiceId: invoiceId,
                vehicleName: vehicleName.trim(),
                vehicleRegNo: cleanPlate,
                vehicleChassis: vehicleChassis ? vehicleChassis.trim() : null,
                odometer: odometer ? String(odometer).trim() : null,
                clientName: cName,
                clientPhone: cPhone,
                jobCategory: jobCategory || "DETAILING",
                priority: "NORMAL",
                status: jobCardStatus,
                checklist: JSON.stringify(checklist),
                workSummary: `Services: ${serviceList.join(", ")}${notes ? ` | Notes: ${notes}` : ""}`,
                partsConsumed: "[]",
                workImages: "[]"
            }
        })

        return NextResponse.json({
            success: true,
            message: `Vehicle record successfully logged for ${cleanPlate} (${vehicleName})!`,
            jobCard,
            invoiceId
        })
    } catch (error: any) {
        console.error("Error creating vehicle record:", error)
        return NextResponse.json({ error: error?.message || "Failed to log vehicle record" }, { status: 500 })
    }
}
