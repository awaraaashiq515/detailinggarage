import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getShopOwnerContext } from "@/lib/auth/shop-auth"

// GET all billing items or logs
export async function GET(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get("search") || ""
        const type = searchParams.get("type") || ""
        const stockStatus = searchParams.get("stockStatus") || "" // "LOW", "OUT", "IN"
        const itemId = searchParams.get("itemId")
        const logsOnly = searchParams.get("logs") === "true"

        // If logs requested for a specific item
        if (logsOnly && itemId) {
            const logs = await db.stockLog.findMany({
                where: { itemId },
                orderBy: { createdAt: "desc" },
                take: 50,
            })
            return NextResponse.json({ success: true, logs })
        }

        const where: any = {}
        if (!ctx.isAdmin) {
            where.OR = [
                { shopId: ctx.shopId },
                { shopId: null } // System default items can be visible
            ]
        }
        if (type) where.type = type
        if (search) {
            const searchClause = {
                OR: [
                    { name: { contains: search } },
                    { hsnSacCode: { contains: search } },
                    { sku: { contains: search } },
                ]
            }
            if (where.OR) {
                where.AND = [
                    { OR: where.OR },
                    searchClause
                ]
                delete where.OR
            } else {
                where.OR = searchClause.OR
            }
        }

        const items = await db.billingItem.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                stockLogs: {
                    orderBy: { createdAt: "desc" },
                    take: 3,
                }
            }
        })

        // Filter by stock status if requested
        let filteredItems = items
        if (stockStatus === "OUT") {
            filteredItems = items.filter(it => it.type === "PRODUCT" && it.stock <= 0)
        } else if (stockStatus === "LOW") {
            filteredItems = items.filter(it => it.type === "PRODUCT" && it.stock > 0 && it.stock <= (it.minStockAlert || 5))
        } else if (stockStatus === "IN") {
            filteredItems = items.filter(it => it.type === "PRODUCT" && it.stock > (it.minStockAlert || 5))
        }

        // Calculate summary
        const productItems = items.filter(it => it.type === "PRODUCT")
        const totalItems = items.length
        const totalProducts = productItems.length
        const totalStockUnits = productItems.reduce((acc, it) => acc + (it.stock || 0), 0)
        const lowStockCount = productItems.filter(it => (it.stock || 0) > 0 && (it.stock || 0) <= (it.minStockAlert || 5)).length
        const outOfStockCount = productItems.filter(it => (it.stock || 0) <= 0).length
        const inventoryValue = productItems.reduce((acc, it) => {
            const cost = it.purchasePrice || it.price || 0
            return acc + (it.stock || 0) * cost
        }, 0)

        return NextResponse.json({
            success: true,
            items: filteredItems,
            summary: {
                totalItems,
                totalProducts,
                totalStockUnits,
                lowStockCount,
                outOfStockCount,
                inventoryValue,
            }
        })
    } catch (error) {
        console.error("Error fetching billing items:", error)
        return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
    }
}

// POST create new billing item
export async function POST(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const {
            name,
            description,
            price,
            hsnSacCode,
            taxRate,
            type,
            stock,
            unit,
            purchasePrice,
            minStockAlert,
            sku,
            trackStock,
        } = body

        if (!name || price === undefined || taxRate === undefined) {
            return NextResponse.json({ error: "Name, price and tax rate are required" }, { status: 400 })
        }

        const initialStock = stock !== undefined && stock !== "" ? parseFloat(stock) : 0
        const parsedPurchasePrice = purchasePrice !== undefined && purchasePrice !== "" ? parseFloat(purchasePrice) : null
        const parsedMinStock = minStockAlert !== undefined && minStockAlert !== "" ? parseFloat(minStockAlert) : 5

        const item = await db.billingItem.create({
            data: {
                name,
                description: description || null,
                price: parseFloat(price),
                hsnSacCode: hsnSacCode || null,
                taxRate: parseFloat(taxRate),
                type: type || "SERVICE",
                stock: initialStock,
                unit: unit || "PCS",
                purchasePrice: parsedPurchasePrice,
                minStockAlert: parsedMinStock,
                sku: sku || null,
                trackStock: trackStock !== undefined ? Boolean(trackStock) : (type === "PRODUCT"),
                shopId: ctx.shopId || null,
            }
        })

        // If initial stock was given > 0, log it
        if (initialStock > 0) {
            await db.stockLog.create({
                data: {
                    itemId: item.id,
                    quantity: initialStock,
                    previousStock: 0,
                    newStock: initialStock,
                    type: "RESTOCK",
                    note: "Initial opening stock",
                    shopId: ctx.shopId || null,
                }
            })
        }

        return NextResponse.json({ success: true, item })
    } catch (error) {
        console.error("Error creating billing item:", error)
        return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
    }
}

// PATCH update billing item or adjust stock
export async function PATCH(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { id, action, ...data } = body
        if (!id) return NextResponse.json({ error: "Item ID required" }, { status: 400 })

        const existing = await db.billingItem.findUnique({ where: { id } })
        if (!existing) return NextResponse.json({ error: "Item not found" }, { status: 404 })
        if (!ctx.isAdmin && existing.shopId && existing.shopId !== ctx.shopId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        // Quick Stock Adjust / Restock action
        if (action === "adjust-stock") {
            const qtyChange = parseFloat(data.quantity)
            if (isNaN(qtyChange)) {
                return NextResponse.json({ error: "Valid quantity is required" }, { status: 400 })
            }

            const prevStock = existing.stock ?? 0
            const newStock = Math.max(0, prevStock + qtyChange)
            const updateFields: any = { stock: newStock }

            if (data.purchasePrice !== undefined && data.purchasePrice !== null && data.purchasePrice !== "") {
                updateFields.purchasePrice = parseFloat(data.purchasePrice)
            }

            const [item, log] = await db.$transaction([
                db.billingItem.update({
                    where: { id },
                    data: updateFields,
                }),
                db.stockLog.create({
                    data: {
                        itemId: id,
                        quantity: qtyChange,
                        previousStock: prevStock,
                        newStock,
                        type: data.type || (qtyChange >= 0 ? "RESTOCK" : "ADJUSTMENT"),
                        note: data.note || (qtyChange >= 0 ? "Stock Added" : "Stock Adjusted"),
                        shopId: ctx.shopId || existing.shopId || null,
                    }
                })
            ])

            return NextResponse.json({ success: true, item, log })
        }

        // Standard Item Edit
        const updateData: any = { ...data }
        if (data.price !== undefined) updateData.price = parseFloat(data.price)
        if (data.taxRate !== undefined) updateData.taxRate = parseFloat(data.taxRate)
        if (data.stock !== undefined && data.stock !== "") updateData.stock = parseFloat(data.stock)
        if (data.purchasePrice !== undefined) {
            updateData.purchasePrice = data.purchasePrice === "" || data.purchasePrice === null ? null : parseFloat(data.purchasePrice)
        }
        if (data.minStockAlert !== undefined && data.minStockAlert !== "") {
            updateData.minStockAlert = parseFloat(data.minStockAlert)
        }
        if (data.trackStock !== undefined) {
            updateData.trackStock = Boolean(data.trackStock)
        }

        // If stock manually changed during regular edit, log difference
        const prevStock = existing.stock ?? 0
        const hasStockDiff = updateData.stock !== undefined && updateData.stock !== prevStock

        const item = await db.billingItem.update({
            where: { id },
            data: updateData,
        })

        if (hasStockDiff) {
            const diff = updateData.stock - prevStock
            await db.stockLog.create({
                data: {
                    itemId: id,
                    quantity: diff,
                    previousStock: prevStock,
                    newStock: updateData.stock,
                    type: "ADJUSTMENT",
                    note: data.stockNote || "Manual stock update via item edit",
                    shopId: ctx.shopId || existing.shopId || null,
                }
            })
        }

        return NextResponse.json({ success: true, item })
    } catch (error) {
        console.error("Error updating billing item:", error)
        return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
    }
}

// DELETE billing item
export async function DELETE(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")
        if (!id) return NextResponse.json({ error: "Item ID required" }, { status: 400 })

        const existing = await db.billingItem.findUnique({ where: { id } })
        if (!existing) return NextResponse.json({ error: "Item not found" }, { status: 404 })
        if (!ctx.isAdmin && existing.shopId && existing.shopId !== ctx.shopId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        await db.billingItem.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting billing item:", error)
        return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
    }
}
