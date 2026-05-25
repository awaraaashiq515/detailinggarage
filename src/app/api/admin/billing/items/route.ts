import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

async function checkAdminAuth() {
    const user = await getCurrentUser()
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) return null
    return user
}

// GET all billing items
export async function GET(request: Request) {
    if (!await checkAdminAuth()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get("search") || ""
        const type = searchParams.get("type") || ""

        const items = await db.billingItem.findMany({
            where: {
                ...(type ? { type } : {}),
                ...(search ? {
                    OR: [
                        { name: { contains: search } },
                        { hsnSacCode: { contains: search } },
                    ]
                } : {})
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ success: true, items })
    } catch (error) {
        console.error("Error fetching billing items:", error)
        return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
    }
}

// POST create new billing item
export async function POST(request: Request) {
    if (!await checkAdminAuth()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { name, description, price, hsnSacCode, taxRate, type } = body

        if (!name || price === undefined || taxRate === undefined) {
            return NextResponse.json({ error: "Name, price and tax rate are required" }, { status: 400 })
        }

        const item = await db.billingItem.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                hsnSacCode,
                taxRate: parseFloat(taxRate),
                type: type || "SERVICE"
            }
        })

        return NextResponse.json({ success: true, item })
    } catch (error) {
        console.error("Error creating billing item:", error)
        return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
    }
}

// PATCH update billing item
export async function PATCH(request: Request) {
    if (!await checkAdminAuth()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { id, ...data } = body
        if (!id) return NextResponse.json({ error: "Item ID required" }, { status: 400 })

        const item = await db.billingItem.update({
            where: { id },
            data: {
                ...data,
                price: data.price !== undefined ? parseFloat(data.price) : undefined,
                taxRate: data.taxRate !== undefined ? parseFloat(data.taxRate) : undefined,
            }
        })

        return NextResponse.json({ success: true, item })
    } catch (error) {
        console.error("Error updating billing item:", error)
        return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
    }
}

// DELETE billing item
export async function DELETE(request: Request) {
    if (!await checkAdminAuth()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")
        if (!id) return NextResponse.json({ error: "Item ID required" }, { status: 400 })

        await db.billingItem.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting billing item:", error)
        return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
    }
}
