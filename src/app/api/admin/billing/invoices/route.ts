import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

import { getShopOwnerContext } from "@/lib/auth/shop-auth"

const TYPE_PREFIX: Record<string, string> = {
    INVOICE:      "DG",
    RECEIPT:      "RC",
    CREDIT_NOTE:  "CN",
    QUOTATION:    "QT",
    ESTIMATE:     "QT",
    PROFORMA:     "PF",
    CHALLAN:      "CH",
}

function generateInvoiceNumber(lastNumber: number, type = "INVOICE", customPrefix?: string, isShop = false) {
    const year = new Date().getFullYear()
    const shortYear = String(year).slice(2)
    let prefix = customPrefix?.trim().toUpperCase()
    if (!prefix) {
        if (type === "QUOTATION" || type === "ESTIMATE") prefix = "QT"
        else if (type === "PROFORMA") prefix = "PF"
        else prefix = isShop ? "INV" : (TYPE_PREFIX[type] || "DG")
    }
    return `${prefix}-${shortYear}-${String(lastNumber + 1).padStart(4, "0")}`
}

// GET all invoices with filters
export async function GET(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")
        const search = searchParams.get("search") || ""
        const status = searchParams.get("status") || ""
        const type = searchParams.get("type") || ""
        const clientId = searchParams.get("clientId") || ""
        const fromDate = searchParams.get("fromDate")
        const toDate = searchParams.get("toDate")

        // Single invoice by ID
        if (id) {
            const invoice = await db.invoice.findUnique({
                where: { id },
                include: {
                    client: true,
                    items: true,
                    payments: true,
                    assignedStaff: {
                        select: { id: true, name: true, role: true, phone: true }
                    },
                    shop: {
                        include: {
                            billingProfile: true
                        }
                    }
                },
            })
            if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
            if (!ctx.isAdmin && invoice.shopId !== ctx.shopId) {
                return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
            }
            return NextResponse.json({ success: true, invoice })
        }

        const where: any = {}

        if (!ctx.isAdmin) {
            where.shopId = ctx.shopId
        } else {
            const shopFilter = searchParams.get("shopId")
            if (shopFilter) where.shopId = shopFilter
        }

        if (status) where.status = status
        if (type) where.type = type
        if (clientId) where.clientId = clientId
        if (fromDate || toDate) {
            where.date = {}
            if (fromDate) where.date.gte = new Date(fromDate)
            if (toDate) where.date.lte = new Date(toDate)
        }
        if (search) {
            where.OR = [
                { invoiceNumber: { contains: search } },
                { client: { name: { contains: search } } },
                { vehicleRegNo: { contains: search } },
                { vehicleName: { contains: search } },
                { vehicleChassis: { contains: search } },
            ]
        }

        const invoices = await db.invoice.findMany({
            where,
            include: {
                client: true,
                items: true,
                payments: true,
                assignedStaff: {
                    select: { id: true, name: true, role: true, phone: true }
                },
            },
            orderBy: { date: "desc" },
        })

        // Compute summary totals
        const totalInvoices = invoices.length
        const totalOutstanding = invoices
            .filter(i => i.status !== "PAID" && i.status !== "CANCELLED")
            .reduce((sum, i) => sum + (i.grandTotal - i.amountPaid), 0)
        const totalPaid = invoices
            .filter(i => i.status === "PAID")
            .reduce((sum, i) => sum + i.grandTotal, 0)
        const grandSum = invoices.reduce((acc, i) => ({
            subTotal: acc.subTotal + i.subTotal,
            taxTotal: acc.taxTotal + i.taxTotal,
            grandTotal: acc.grandTotal + i.grandTotal,
            amountPaid: acc.amountPaid + i.amountPaid,
        }), { subTotal: 0, taxTotal: 0, grandTotal: 0, amountPaid: 0 })

        return NextResponse.json({
            success: true,
            invoices,
            summary: { totalInvoices, totalOutstanding, totalPaid, ...grandSum }
        })
    } catch (error) {
        console.error("Error fetching invoices:", error)
        return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
    }
}

// POST create new invoice
export async function POST(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { clientId, type, date, dueDate, items, discount, notes, terms, vehicleName, vehicleRegNo, vehicleChassis, odometer, prefix: customPrefix, assignedStaffId } = body

        if (!clientId || !items || items.length === 0) {
            return NextResponse.json({ error: "Client and at least one item are required" }, { status: 400 })
        }

        // Get client to determine intra vs inter state
        const client = await db.billingClient.findUnique({ where: { id: clientId } })
        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 })
        }

        // Generate number (each type has its own sequence per shop)
        const docType = type || "INVOICE"
        const isShop = !ctx.isAdmin && !!ctx.shopId

        const lastInvoice = await db.invoice.findFirst({
            where: {
                type: docType,
                ...(ctx.shopId ? { shopId: ctx.shopId } : { shopId: null })
            },
            orderBy: { createdAt: "desc" }
        })
        let lastNum = lastInvoice
            ? parseInt(lastInvoice.invoiceNumber.split("-").pop() || "0")
            : 0
        let nextNum = lastNum + 1
        let invoiceNumber = generateInvoiceNumber(nextNum - 1, docType, customPrefix, isShop)

        // Ensure collision-safe within this tenant
        while (await db.invoice.findFirst({
            where: {
                invoiceNumber,
                ...(ctx.shopId ? { shopId: ctx.shopId } : { shopId: null })
            }
        })) {
            nextNum++
            invoiceNumber = generateInvoiceNumber(nextNum - 1, docType, customPrefix, isShop)
        }

        // Calculate totals
        // Business state is assumed Delhi/India - you can make this a setting later
        const businessState = "07-Delhi"
        const isInterState = client.state && !client.state.startsWith("07")

        let subTotal = 0
        let cgstTotal = 0
        let sgstTotal = 0
        let igstTotal = 0

        const processedItems = items.map((item: any) => {
            const qty = parseFloat(item.quantity) || 1
            const rate = parseFloat(item.rate) || 0
            const taxRate = parseFloat(item.taxRate) || 0
            const discountPct = parseFloat(item.discount) || 0

            const itemValue = qty * rate
            const discountAmt = (itemValue * discountPct) / 100
            const taxableValue = itemValue - discountAmt
            const taxAmt = (taxableValue * taxRate) / 100

            let cgst = 0, sgst = 0, igst = 0
            if (isInterState) {
                igst = taxAmt
            } else {
                cgst = taxAmt / 2
                sgst = taxAmt / 2
            }

            const total = taxableValue + taxAmt
            subTotal += taxableValue
            cgstTotal += cgst
            sgstTotal += sgst
            igstTotal += igst

            return {
                name: item.name,
                hsnSacCode: item.hsnSacCode || "",
                quantity: qty,
                rate,
                taxRate,
                cgst,
                sgst,
                igst,
                total,
            }
        })

        const discountAmt = parseFloat(discount) || 0
        const taxTotal = cgstTotal + sgstTotal + igstTotal
        const grandTotal = subTotal + taxTotal - discountAmt

        const invoice = await db.invoice.create({
            data: {
                invoiceNumber,
                type: type || "INVOICE",
                date: date ? new Date(date) : new Date(),
                dueDate: dueDate ? new Date(dueDate) : null,
                clientId,
                status: "UNPAID",
                subTotal,
                cgstTotal,
                sgstTotal,
                igstTotal,
                taxTotal,
                discount: discountAmt,
                grandTotal,
                amountPaid: 0,
                notes,
                terms,
                shopId: ctx.shopId || null,
                vehicleName: vehicleName || null,
                vehicleRegNo: vehicleRegNo || null,
                vehicleChassis: vehicleChassis || null,
                odometer: odometer || null,
                assignedStaffId: assignedStaffId || null,
                items: {
                    create: processedItems
                }
            },
            include: { client: true, items: true }
        })

        // Auto-record commission for assigned staff if commissionRate > 0
        if (assignedStaffId && (docType === "INVOICE" || docType === "TAX_INVOICE")) {
            try {
                const staff = await db.shopStaff.findUnique({ where: { id: assignedStaffId } })
                if (staff) {
                    if (staff.commissionRate > 0) {
                        const commAmt = Math.round((subTotal * staff.commissionRate) / 100)
                        if (commAmt > 0) {
                            await db.staffCommission.create({
                                data: {
                                    staffId: staff.id,
                                    invoiceId: invoice.id,
                                    shopId: ctx.shopId || null,
                                    amount: commAmt,
                                    rate: staff.commissionRate,
                                    status: "PENDING",
                                    notes: `Commission on ${invoice.invoiceNumber} (${staff.commissionRate}%)`
                                }
                            })
                        }
                    }

                    // Auto-create StaffJobCard for this staff member
                    const taskChecklist = processedItems.length > 0
                        ? processedItems.map((item: any, idx: number) => ({
                            id: String(idx + 1),
                            task: `${item.name}${item.quantity > 1 ? ` (Qty: ${item.quantity})` : ""}`,
                            isDone: false
                        }))
                        : [
                            { id: "1", task: "Initial Vehicle Inspection", isDone: false },
                            { id: "2", task: "Perform Assigned Service / Repair", isDone: false },
                            { id: "3", task: "Final Quality Check & Wipe", isDone: false }
                        ]

                    await db.staffJobCard.create({
                        data: {
                            jobNumber: `JC-${invoice.invoiceNumber}`,
                            shopId: ctx.shopId || null,
                            staffId: staff.id,
                            invoiceId: invoice.id,
                            vehicleName: vehicleName || "Client Vehicle",
                            vehicleRegNo: vehicleRegNo || "UNREGISTERED",
                            vehicleChassis: vehicleChassis || null,
                            odometer: odometer || null,
                            clientName: invoice.client?.name || "Customer",
                            clientPhone: invoice.client?.phone || null,
                            jobCategory: "DETAILING",
                            priority: "NORMAL",
                            status: "ASSIGNED",
                            checklist: JSON.stringify(taskChecklist),
                            workSummary: `Assigned via invoice #${invoice.invoiceNumber}. Services: ${processedItems.map((x: any) => x.name).join(", ")}`,
                            partsConsumed: "[]",
                            workImages: "[]",
                            commissionAmount: staff.commissionRate > 0 ? Math.round((subTotal * staff.commissionRate) / 100) : 0
                        }
                    })
                }
            } catch (commErr) {
                console.error("Failed to auto-record staff commission and job card:", commErr)
            }
        }

        // Automatically deduct stock for matching catalog products
        if (docType === "INVOICE" || docType === "TAX_INVOICE") {
            try {
                for (const it of processedItems) {
                    const catalogItem = await db.billingItem.findFirst({
                        where: {
                            name: it.name,
                            trackStock: true,
                            ...(ctx.shopId ? { shopId: ctx.shopId } : { shopId: null })
                        }
                    })
                    if (catalogItem && catalogItem.type === "PRODUCT") {
                        const prevStock = catalogItem.stock ?? 0
                        const newStock = Math.max(0, prevStock - it.quantity)
                        await db.$transaction([
                            db.billingItem.update({
                                where: { id: catalogItem.id },
                                data: { stock: newStock }
                            }),
                            db.stockLog.create({
                                data: {
                                    itemId: catalogItem.id,
                                    quantity: -it.quantity,
                                    previousStock: prevStock,
                                    newStock,
                                    type: "SALE",
                                    note: `Invoice ${invoice.invoiceNumber}`,
                                    referenceId: invoice.id,
                                    shopId: ctx.shopId || null
                                }
                            })
                        ])
                    }
                }
            } catch (stockErr) {
                console.error("Failed to auto-deduct stock on invoice creation:", stockErr)
            }
        }

        return NextResponse.json({ success: true, invoice })
    } catch (error: any) {
        console.error("Error creating invoice:", error)
        return NextResponse.json({ error: error?.message || "Failed to create invoice" }, { status: 500 })
    }
}

// PATCH update invoice status / convert type
export async function PATCH(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { id, status, action, targetType } = body
        if (!id) return NextResponse.json({ error: "Invoice ID required" }, { status: 400 })

        // ── Convert invoice ↔ quotation ──────────────────────────────────────
        if (action === "convert") {
            const docType = targetType || "QUOTATION"

            // Fetch original with items
            const original = await db.invoice.findUnique({
                where: { id },
                include: { items: true }
            })
            if (!original) return NextResponse.json({ error: "Invoice not found" }, { status: 404 })

            const originalShopId = original.shopId || ctx.shopId || null
            const isShop = !!originalShopId

            // Generate new number for target type scoped by shop
            const lastDoc = await db.invoice.findFirst({
                where: {
                    type: docType,
                    ...(originalShopId ? { shopId: originalShopId } : { shopId: null })
                },
                orderBy: { createdAt: "desc" }
            })
            let lastNum = lastDoc
                ? parseInt(lastDoc.invoiceNumber.split("-").pop() || "0")
                : 0
            let nextNum = lastNum + 1
            let newNumber = generateInvoiceNumber(nextNum - 1, docType, undefined, isShop)

            while (await db.invoice.findFirst({
                where: {
                    invoiceNumber: newNumber,
                    ...(originalShopId ? { shopId: originalShopId } : { shopId: null })
                }
            })) {
                nextNum++
                newNumber = generateInvoiceNumber(nextNum - 1, docType, undefined, isShop)
            }

            // Create the converted document
            const converted = await db.invoice.create({
                data: {
                    invoiceNumber: newNumber,
                    type: docType,
                    date: new Date(),
                    dueDate: null,
                    clientId: original.clientId,
                    status: "DRAFT",
                    subTotal: original.subTotal,
                    cgstTotal: original.cgstTotal,
                    sgstTotal: original.sgstTotal,
                    igstTotal: original.igstTotal,
                    taxTotal: original.taxTotal,
                    discount: original.discount,
                    grandTotal: original.grandTotal,
                    amountPaid: 0,
                    notes: original.notes,
                    terms: original.terms,
                    shopId: originalShopId,
                    vehicleName: original.vehicleName,
                    vehicleRegNo: original.vehicleRegNo,
                    vehicleChassis: original.vehicleChassis,
                    odometer: original.odometer,
                    items: {
                        create: original.items.map(item => ({
                            name: item.name,
                            hsnSacCode: item.hsnSacCode,
                            quantity: item.quantity,
                            rate: item.rate,
                            taxRate: item.taxRate,
                            cgst: item.cgst,
                            sgst: item.sgst,
                            igst: item.igst,
                            total: item.total,
                        }))
                    }
                },
                include: { client: true, items: true }
            })

            return NextResponse.json({ success: true, invoice: converted, message: `Converted to ${docType} successfully` })
        }

        // ── Simple status update ─────────────────────────────────────────────
        const invoice = await db.invoice.update({
            where: { id },
            data: { status }
        })

        return NextResponse.json({ success: true, invoice })
    } catch (error) {
        console.error("Error updating invoice:", error)
        return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
    }
}

// PUT update invoice details and items
export async function PUT(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { id, clientId, type, date, dueDate, status, items, discount, notes, terms, vehicleName, vehicleRegNo, vehicleChassis, odometer, assignedStaffId } = body

        if (!id) {
            return NextResponse.json({ error: "Invoice ID required" }, { status: 400 })
        }

        if (!clientId || !items || items.length === 0) {
            return NextResponse.json({ error: "Client and at least one item are required" }, { status: 400 })
        }

        // Get existing invoice to check payments and keep consistency
        const existingInvoice = await db.invoice.findUnique({
            where: { id },
            include: { payments: true }
        })

        if (!existingInvoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
        }

        // Get client to determine intra vs inter state
        const client = await db.billingClient.findUnique({ where: { id: clientId } })
        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 })
        }

        // Calculate totals
        const isInterState = client.state && !client.state.startsWith("07")

        let subTotal = 0
        let cgstTotal = 0
        let sgstTotal = 0
        let igstTotal = 0

        const processedItems = items.map((item: any) => {
            const qty = parseFloat(item.quantity) || 1
            const rate = parseFloat(item.rate) || 0
            const taxRate = parseFloat(item.taxRate) || 0
            const discountPct = parseFloat(item.discount) || 0

            const itemValue = qty * rate
            const discountAmt = (itemValue * discountPct) / 100
            const taxableValue = itemValue - discountAmt
            const taxAmt = (taxableValue * taxRate) / 100

            let cgst = 0, sgst = 0, igst = 0
            if (isInterState) {
                igst = taxAmt
            } else {
                cgst = taxAmt / 2
                sgst = taxAmt / 2
            }

            const total = taxableValue + taxAmt
            subTotal += taxableValue
            cgstTotal += cgst
            sgstTotal += sgst
            igstTotal += igst

            return {
                name: item.name,
                hsnSacCode: item.hsnSacCode || "",
                quantity: qty,
                rate,
                taxRate,
                cgst,
                sgst,
                igst,
                total,
            }
        })

        const discountAmt = parseFloat(discount) || 0
        const taxTotal = cgstTotal + sgstTotal + igstTotal
        const grandTotal = subTotal + taxTotal - discountAmt

        // Recalculate amountPaid and status based on existing payments
        const amountPaid = existingInvoice.payments.reduce((sum, p) => sum + p.amount, 0)
        let calculatedStatus = status || existingInvoice.status

        if (calculatedStatus !== "DRAFT" && calculatedStatus !== "CANCELLED") {
            if (amountPaid >= grandTotal) {
                calculatedStatus = "PAID"
            } else if (amountPaid > 0) {
                calculatedStatus = "PARTIALLY_PAID"
            } else {
                calculatedStatus = "UNPAID"
            }
        }

        // Perform transactional update
        const invoice = await db.$transaction(async (tx) => {
            // Delete old items
            await tx.invoiceItem.deleteMany({
                where: { invoiceId: id }
            })

            // Update invoice details and insert new items
            return await tx.invoice.update({
                where: { id },
                data: {
                    type: type || existingInvoice.type,
                    date: date ? new Date(date) : existingInvoice.date,
                    dueDate: dueDate ? new Date(dueDate) : null,
                    clientId,
                    status: calculatedStatus,
                    subTotal,
                    cgstTotal,
                    sgstTotal,
                    igstTotal,
                    taxTotal,
                    discount: discountAmt,
                    grandTotal,
                    amountPaid,
                    notes,
                    terms,
                    vehicleName: vehicleName !== undefined ? vehicleName : existingInvoice.vehicleName,
                    vehicleRegNo: vehicleRegNo !== undefined ? vehicleRegNo : existingInvoice.vehicleRegNo,
                    vehicleChassis: vehicleChassis !== undefined ? vehicleChassis : existingInvoice.vehicleChassis,
                    odometer: odometer !== undefined ? odometer : existingInvoice.odometer,
                    assignedStaffId: assignedStaffId !== undefined ? (assignedStaffId || null) : existingInvoice.assignedStaffId,
                    items: {
                        create: processedItems
                    }
                },
                include: { client: true, items: true, assignedStaff: true }
            })
        })

        return NextResponse.json({ success: true, invoice })
    } catch (error) {
        console.error("Error editing invoice:", error)
        return NextResponse.json({ error: "Failed to edit invoice" }, { status: 500 })
    }
}

// DELETE invoice
export async function DELETE(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")
        if (!id) return NextResponse.json({ error: "Invoice ID required" }, { status: 400 })

        const invoice = await db.invoice.findUnique({ where: { id } })
        if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 })

        if (!ctx.isAdmin && invoice.shopId !== ctx.shopId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        await db.invoice.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting invoice:", error)
        return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 })
    }
}
