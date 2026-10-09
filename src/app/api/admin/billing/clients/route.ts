import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getShopOwnerContext } from "@/lib/auth/shop-auth"

// GET all billing clients
export async function GET(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get("search") || ""

        const where: any = {}
        if (!ctx.isAdmin) {
            where.shopId = ctx.shopId
        } else {
            const shopFilter = searchParams.get("shopId")
            if (shopFilter) where.shopId = shopFilter
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { phone: { contains: search } },
                { gstin: { contains: search } },
            ]
        }

        const clients = await db.billingClient.findMany({
            where,
            include: {
                _count: { select: { invoices: true } },
                invoices: {
                    select: {
                        vehicleName: true,
                        vehicleRegNo: true,
                        vehicleChassis: true,
                        odometer: true,
                    },
                    orderBy: {
                        date: "desc"
                    },
                    take: 1
                }
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ success: true, clients })
    } catch (error) {
        console.error("Error fetching billing clients:", error)
        return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
    }
}

// POST create new billing client
export async function POST(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { name, phone, email, address, gstin, state, vehicleName, vehicleRegNo, vehicleChassis, odometer } = body

        if (!name) {
            return NextResponse.json({ error: "Client name is required" }, { status: 400 })
        }

        const client = await db.billingClient.create({
            data: {
                name,
                phone: phone || null,
                email: email || null,
                address: address || null,
                gstin: gstin || null,
                state: state || null,
                shopId: ctx.shopId || null,
                vehicleName: vehicleName || null,
                vehicleRegNo: vehicleRegNo || null,
                vehicleChassis: vehicleChassis || null,
                odometer: odometer || null,
            }
        })

        return NextResponse.json({ success: true, client })
    } catch (error) {
        console.error("Error creating billing client:", error)
        return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
    }
}

// PATCH update billing client
export async function PATCH(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { id, ...data } = body

        if (!id) return NextResponse.json({ error: "Client ID required" }, { status: 400 })

        const existing = await db.billingClient.findUnique({ where: { id } })
        if (!existing) return NextResponse.json({ error: "Client not found" }, { status: 404 })
        if (!ctx.isAdmin && existing.shopId && existing.shopId !== ctx.shopId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        const client = await db.billingClient.update({ where: { id }, data })
        return NextResponse.json({ success: true, client })
    } catch (error) {
        console.error("Error updating billing client:", error)
        return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
    }
}

// DELETE billing client
export async function DELETE(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")
        if (!id) return NextResponse.json({ error: "Client ID required" }, { status: 400 })

        const existing = await db.billingClient.findUnique({ where: { id } })
        if (!existing) return NextResponse.json({ error: "Client not found" }, { status: 404 })
        if (!ctx.isAdmin && existing.shopId && existing.shopId !== ctx.shopId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        await db.billingClient.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting billing client:", error)
        return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
    }
}
