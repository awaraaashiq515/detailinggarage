import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

async function checkAdminAuth() {
    const user = await getCurrentUser()
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) return null
    return user
}

// POST - Record a payment against an invoice
export async function POST(request: Request) {
    if (!await checkAdminAuth()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { invoiceId, amount, paymentMethod, reference, notes, paymentDate } = body

        if (!invoiceId || !amount || !paymentMethod) {
            return NextResponse.json({ error: "Invoice ID, amount, and payment method are required" }, { status: 400 })
        }

        const invoice = await db.invoice.findUnique({ where: { id: invoiceId } })
        if (!invoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
        }

        const paidAmount = parseFloat(amount)
        const newAmountPaid = invoice.amountPaid + paidAmount
        const balance = invoice.grandTotal - newAmountPaid

        // Determine new status
        let newStatus = invoice.status
        if (balance <= 0) {
            newStatus = "PAID"
        } else if (newAmountPaid > 0) {
            newStatus = "PARTIALLY_PAID"
        }

        // Create payment record and update invoice
        const [payment] = await db.$transaction([
            db.invoicePayment.create({
                data: {
                    invoiceId,
                    amount: paidAmount,
                    paymentMethod,
                    reference,
                    notes,
                    paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
                }
            }),
            db.invoice.update({
                where: { id: invoiceId },
                data: {
                    amountPaid: newAmountPaid,
                    status: newStatus,
                }
            })
        ])

        return NextResponse.json({ success: true, payment, newStatus, balance: Math.max(0, balance) })
    } catch (error) {
        console.error("Error recording payment:", error)
        return NextResponse.json({ error: "Failed to record payment" }, { status: 500 })
    }
}
