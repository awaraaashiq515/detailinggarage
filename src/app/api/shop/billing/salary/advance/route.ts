import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getShopOwnerContext } from "@/lib/auth/shop-auth"

export async function GET(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { searchParams } = new URL(request.url)
        const staffId = searchParams.get("staffId")
        const status = searchParams.get("status")

        const where: any = {}
        if (!ctx.isAdmin) {
            where.shopId = ctx.shopId
        }
        if (staffId) where.staffId = staffId
        if (status) where.status = status

        const advances = await db.staffAdvance.findMany({
            where,
            include: {
                staff: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        phone: true,
                        salary: true
                    }
                }
            },
            orderBy: { advanceDate: "desc" }
        })

        const totalAdvanceGiven = advances.reduce((s, a) => s + a.amount, 0)
        const totalRecovered = advances.reduce((s, a) => s + a.recoveredAmount, 0)
        const totalPending = totalAdvanceGiven - totalRecovered

        return NextResponse.json({
            advances,
            summary: {
                totalAdvanceGiven,
                totalRecovered,
                totalPending,
                count: advances.length
            }
        })
    } catch (error: any) {
        console.error("Failed to fetch staff advances:", error)
        return NextResponse.json({ error: error.message || "Failed to fetch advances" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const body = await request.json()
        const {
            staffId,
            amount,
            advanceDate = new Date().toISOString(),
            reason = "Staff Advance",
            paymentMethod = "CASH",
            notes
        } = body

        if (!staffId || !amount || Number(amount) <= 0) {
            return NextResponse.json({ error: "Valid staffId and positive amount are required" }, { status: 400 })
        }

        const staff = await db.shopStaff.findUnique({
            where: { id: staffId }
        })
        if (!staff) {
            return NextResponse.json({ error: "Staff member not found" }, { status: 404 })
        }
        if (!ctx.isAdmin && staff.shopId !== ctx.shopId) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 })
        }

        const shopId = staff.shopId || ctx.shopId

        const advance = await db.staffAdvance.create({
            data: {
                staffId,
                shopId,
                amount: Number(amount),
                advanceDate: new Date(advanceDate),
                reason,
                paymentMethod,
                status: "PENDING",
                recoveredAmount: 0,
                notes: notes || null
            },
            include: {
                staff: {
                    select: { id: true, name: true, role: true, phone: true }
                }
            }
        })

        return NextResponse.json({ success: true, advance })
    } catch (error: any) {
        console.error("Failed to create staff advance:", error)
        return NextResponse.json({ error: error.message || "Failed to create advance" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "Advance ID is required" }, { status: 400 })
        }

        const advance = await db.staffAdvance.findUnique({
            where: { id }
        })
        if (!advance) {
            return NextResponse.json({ error: "Advance not found" }, { status: 404 })
        }
        if (!ctx.isAdmin && advance.shopId !== ctx.shopId) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 })
        }

        await db.staffAdvance.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Failed to delete staff advance:", error)
        return NextResponse.json({ error: error.message || "Failed to delete advance" }, { status: 500 })
    }
}
