import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

async function checkAdminAuth() {
    const user = await getCurrentUser()
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) return null
    return user
}

// GET all billing clients
export async function GET(request: Request) {
    if (!await checkAdminAuth()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get("search") || ""

        const clients = await db.billingClient.findMany({
            where: search ? {
                OR: [
                    { name: { contains: search } },
                    { phone: { contains: search } },
                    { gstin: { contains: search } },
                ]
            } : undefined,
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
    if (!await checkAdminAuth()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { name, phone, email, address, gstin, state, vehicleName, vehicleRegNo, vehicleChassis, odometer } = body

        if (!name) {
            return NextResponse.json({ error: "Client name is required" }, { status: 400 })
        }

        const client = await db.billingClient.create({
            data: { name, phone, email, address, gstin, state, vehicleName, vehicleRegNo, vehicleChassis, odometer }
        })

        return NextResponse.json({ success: true, client })
    } catch (error) {
        console.error("Error creating billing client:", error)
        return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
    }
}

// PATCH update billing client
export async function PATCH(request: Request) {
    if (!await checkAdminAuth()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { id, ...data } = body

        if (!id) return NextResponse.json({ error: "Client ID required" }, { status: 400 })

        const client = await db.billingClient.update({ where: { id }, data })
        return NextResponse.json({ success: true, client })
    } catch (error) {
        console.error("Error updating billing client:", error)
        return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
    }
}

// DELETE billing client
export async function DELETE(request: Request) {
    if (!await checkAdminAuth()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")
        if (!id) return NextResponse.json({ error: "Client ID required" }, { status: 400 })

        await db.billingClient.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting billing client:", error)
        return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
    }
}
