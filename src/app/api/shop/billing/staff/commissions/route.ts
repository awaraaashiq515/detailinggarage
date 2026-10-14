import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getShopOwnerContext } from "@/lib/auth/shop-auth"

// GET commissions list
export async function GET(request: NextRequest) {
    const ctx = await getShopOwnerContext()
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { searchParams } = new URL(request.url)
        const staffId = searchParams.get("staffId")
        const status = searchParams.get("status")

        let targetShopId = ctx.shopId
        if (ctx.isAdmin) {
            const queryShopId = searchParams.get("shopId")
            if (queryShopId) targetShopId = queryShopId
        }

        const where: any = {}
        if (targetShopId) where.shopId = targetShopId
        if (staffId) where.staffId = staffId
        if (status) where.status = status

        const commissions = await db.staffCommission.findMany({
            where,
            include: {
                staff: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        phone: true,
                        commissionRate: true
                    }
                },
                invoice: {
                    select: {
                        id: true,
                        invoiceNumber: true,
                        grandTotal: true,
                        subTotal: true,
                        vehicleName: true,
                        vehicleRegNo: true,
                        date: true,
                        status: true,
                        client: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        const totalPending = commissions
            .filter(c => c.status === "PENDING")
            .reduce((s, c) => s + c.amount, 0)
        const totalPaid = commissions
            .filter(c => c.status === "PAID")
            .reduce((s, c) => s + c.amount, 0)

        return NextResponse.json({
            success: true,
            commissions,
            summary: {
                totalCommissions: commissions.length,
                totalPending,
                totalPaid
            }
        })
    } catch (error: any) {
        console.error("Error fetching commissions:", error)
        return NextResponse.json({ error: error?.message || "Failed to fetch commissions" }, { status: 500 })
    }
}

// POST create manual commission OR mark existing commission as PAID
export async function POST(request: NextRequest) {
    const ctx = await getShopOwnerContext()
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const body = await request.json()
        const { action, commissionId, staffId, invoiceId, amount, rate, notes } = body

        if (action === "PAY" || action === "MARK_PAID") {
            if (!commissionId) {
                return NextResponse.json({ error: "Commission ID is required" }, { status: 400 })
            }

            const updated = await db.staffCommission.update({
                where: { id: commissionId },
                data: {
                    status: "PAID",
                    paidAt: new Date(),
                    notes: notes || "Settled / Paid"
                }
            })

            return NextResponse.json({
                success: true,
                commission: updated,
                message: "Commission marked as paid"
            })
        }

        // Action: CREATE manual commission entry
        if (!staffId || !amount) {
            return NextResponse.json({ error: "Staff and amount are required" }, { status: 400 })
        }

        const newCommission = await db.staffCommission.create({
            data: {
                staffId,
                invoiceId: invoiceId || null,
                shopId: ctx.shopId || null,
                amount: parseFloat(amount) || 0,
                rate: parseFloat(rate) || 0,
                status: "PENDING",
                notes: notes || "Direct / Job commission"
            }
        })

        return NextResponse.json({
            success: true,
            commission: newCommission,
            message: "Commission entry added successfully"
        })
    } catch (error: any) {
        console.error("Error processing commission:", error)
        return NextResponse.json({ error: error?.message || "Failed to process commission" }, { status: 500 })
    }
}
