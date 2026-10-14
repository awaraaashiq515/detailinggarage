import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getShopOwnerContext } from "@/lib/auth/shop-auth"

export async function POST(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { items, vendorName, invoiceNumber, invoiceDate } = body

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "No items provided for stock import" }, { status: 400 })
        }

        const selectedItems = items.filter(it => it && it.selected !== false)
        if (selectedItems.length === 0) {
            return NextResponse.json({ error: "No items selected to import" }, { status: 400 })
        }

        let countCreated = 0
        let countRestocked = 0
        let totalUnitsAdded = 0

        const billRef = invoiceNumber ? `Bill #${invoiceNumber}` : "Invoice"
        const vendorRef = vendorName ? `from ${vendorName}` : "Supplier"
        const logNotePrefix = `AI Bill Scan: Purchased via ${billRef} ${vendorRef}`

        // Execute in sequential database operations
        for (const it of selectedItems) {
            const qty = Math.max(0, parseFloat(it.quantity) || 0)
            if (qty <= 0) continue

            const pPrice = parseFloat(it.purchasePrice) >= 0 ? parseFloat(it.purchasePrice) : null
            const sPrice = parseFloat(it.sellingPrice) >= 0 ? parseFloat(it.sellingPrice) : (pPrice ? Math.round(pPrice * 1.35) : 0)
            const cleanName = (it.name || "Unnamed Product").trim()
            const cleanUnit = (it.unit || "PCS").toUpperCase().trim()
            const cleanSku = it.sku ? String(it.sku).trim() : null
            const cleanHsn = it.hsnSacCode ? String(it.hsnSacCode).trim() : null
            const taxRate = typeof it.taxRate === "number" ? it.taxRate : 18

            // 1. RESTOCK existing item
            if (it.action === "RESTOCK" && it.existingItemId) {
                const existing = await db.billingItem.findUnique({
                    where: { id: it.existingItemId }
                })

                if (existing) {
                    const prevStock = existing.stock || 0
                    const newStock = prevStock + qty

                    // Update existing item stock and purchase rate
                    await db.billingItem.update({
                        where: { id: existing.id },
                        data: {
                            stock: newStock,
                            purchasePrice: pPrice !== null ? pPrice : existing.purchasePrice,
                            // Optionally update selling price if provided and not 0
                            price: sPrice > 0 ? sPrice : existing.price,
                            sku: cleanSku || existing.sku,
                            hsnSacCode: cleanHsn || existing.hsnSacCode,
                            trackStock: true
                        }
                    })

                    // Create audit stock log
                    await db.stockLog.create({
                        data: {
                            itemId: existing.id,
                            quantity: qty,
                            previousStock: prevStock,
                            newStock: newStock,
                            type: "RESTOCK",
                            note: `${logNotePrefix} (+${qty} ${existing.unit || cleanUnit})`,
                            referenceId: invoiceNumber || null,
                            shopId: ctx.shopId || null,
                        }
                    })

                    countRestocked++
                    totalUnitsAdded += qty
                    continue
                }
            }

            // 2. CREATE new product item
            const newItem = await db.billingItem.create({
                data: {
                    name: cleanName,
                    description: `Imported via AI Bill Scan (${billRef})`,
                    price: sPrice,
                    purchasePrice: pPrice,
                    hsnSacCode: cleanHsn,
                    taxRate: taxRate,
                    type: "PRODUCT",
                    stock: qty,
                    unit: cleanUnit,
                    minStockAlert: 5,
                    sku: cleanSku,
                    trackStock: true,
                    shopId: ctx.shopId || null,
                }
            })

            // Create initial stock log for new product
            await db.stockLog.create({
                data: {
                    itemId: newItem.id,
                    quantity: qty,
                    previousStock: 0,
                    newStock: qty,
                    type: "RESTOCK",
                    note: `${logNotePrefix} (Initial Opening Stock: ${qty} ${cleanUnit})`,
                    referenceId: invoiceNumber || null,
                    shopId: ctx.shopId || null,
                }
            })

            countCreated++
            totalUnitsAdded += qty
        }

        return NextResponse.json({
            success: true,
            message: `Successfully added ${totalUnitsAdded} units (${countCreated} new products created, ${countRestocked} existing items restocked)!`,
            countCreated,
            countRestocked,
            totalUnitsAdded,
            vendorName,
            invoiceNumber,
        })

    } catch (error: any) {
        console.error("[AI Bill Import] Error importing stock:", error)
        return NextResponse.json({
            error: "IMPORT_FAILED",
            message: error.message || "Failed to import items into inventory."
        }, { status: 500 })
    }
}
