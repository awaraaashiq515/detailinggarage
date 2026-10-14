import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getShopOwnerContext } from "@/lib/auth/shop-auth"

// GET shop's invoices (scoped)
export async function GET(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get("search") || ""
        const status = searchParams.get("status") || ""
        const shopFilter = searchParams.get("shopId") // Admin-only: filter by specific shop

        const where: any = {}

        // Scope to shop
        if (!ctx.isAdmin) {
            where.shopId = ctx.shopId
        } else if (shopFilter) {
            where.shopId = shopFilter
        }

        if (status) where.status = status
        if (search) {
            where.OR = [
                { invoiceNumber: { contains: search } },
                { client: { name: { contains: search } } },
                { vehicleRegNo: { contains: search } },
            ]
        }

        const invoices = await db.invoice.findMany({
            where,
            include: {
                client: true,
                items: true,
                payments: true,
                assignedStaff: { select: { id: true, name: true, role: true, phone: true } },
                shop: { select: { id: true, name: true } }
            },
            orderBy: { date: "desc" }
        })

        const totalOutstanding = invoices
            .filter(i => i.status !== "PAID" && i.status !== "CANCELLED")
            .reduce((sum, i) => sum + (i.grandTotal - i.amountPaid), 0)
        const totalPaid = invoices
            .filter(i => i.status === "PAID")
            .reduce((sum, i) => sum + i.grandTotal, 0)

        return NextResponse.json({
            success: true,
            invoices,
            summary: {
                totalInvoices: invoices.length,
                totalOutstanding,
                totalPaid,
                grandTotal: invoices.reduce((s, i) => s + i.grandTotal, 0)
            }
        })
    } catch (error) {
        console.error("Error fetching shop invoices:", error)
        return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
    }
}
