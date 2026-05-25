import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

async function checkAdminAuth() {
    const user = await getCurrentUser()
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) return null
    return user
}

const TYPE_PREFIX: Record<string, string> = {
    INVOICE:      "DG",
    RECEIPT:      "RC",
    CREDIT_NOTE:  "CN",
    QUOTATION:    "QT",
    ESTIMATE:     "QT",
    PROFORMA:     "PF",
    CHALLAN:      "CH",
}

function generateInvoiceNumber(lastNumber: number, type = "INVOICE") {
    const year = new Date().getFullYear()
    const shortYear = String(year).slice(2)
    const prefix = TYPE_PREFIX[type] || "DG"
    return `${prefix}-${shortYear}-${String(lastNumber + 1).padStart(4, "0")}`
}

// GET all invoices with filters
export async function GET(request: Request) {
    if (!await checkAdminAuth()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")
        const search = searchParams.get("search") || ""
        const status = searchParams.get("status") || ""
        const type = searchParams.get("type") || ""
        const fromDate = searchParams.get("fromDate")
        const toDate = searchParams.get("toDate")

        // Single invoice by ID
        if (id) {
            const invoice = await db.invoice.findUnique({
                where: { id },
                include: { client: true, items: true, payments: true },
            })
            if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
            return NextResponse.json({ success: true, invoice })
        }

        const where: any = {}

        if (status) where.status = status
        if (type) where.type = type
        if (fromDate || toDate) {
            where.date = {}
            if (fromDate) where.date.gte = new Date(fromDate)
            if (toDate) where.date.lte = new Date(toDate)
        }
        if (search) {
            where.OR = [
                { invoiceNumber: { contains: search } },
                { client: { name: { contains: search } } },
            ]
        }

        const invoices = await db.invoice.findMany({
            where,
            include: {
                client: true,
                items: true,
                payments: true,
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
    if (!await checkAdminAuth()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { clientId, type, date, dueDate, items, discount, notes, terms } = body

        if (!clientId || !items || items.length === 0) {
            return NextResponse.json({ error: "Client and at least one item are required" }, { status: 400 })
        }

        // Get client to determine intra vs inter state
        const client = await db.billingClient.findUnique({ where: { id: clientId } })
        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 })
        }

        // Generate number (each type has its own sequence)
        const docType = type || "INVOICE"
        const lastInvoice = await db.invoice.findFirst({
            where: { type: docType },
            orderBy: { createdAt: "desc" }
        })
        const lastNum = lastInvoice
            ? parseInt(lastInvoice.invoiceNumber.split("-").pop() || "0")
            : 0
        const invoiceNumber = generateInvoiceNumber(lastNum, docType)

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
                items: {
                    create: processedItems
                }
            },
            include: { client: true, items: true }
        })

        return NextResponse.json({ success: true, invoice })
    } catch (error) {
        console.error("Error creating invoice:", error)
        return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
    }
}

// PATCH update invoice status
export async function PATCH(request: Request) {
    if (!await checkAdminAuth()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { id, status } = body
        if (!id) return NextResponse.json({ error: "Invoice ID required" }, { status: 400 })

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

// DELETE invoice
export async function DELETE(request: Request) {
    if (!await checkAdminAuth()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")
        if (!id) return NextResponse.json({ error: "Invoice ID required" }, { status: 400 })

        await db.invoice.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting invoice:", error)
        return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 })
    }
}
