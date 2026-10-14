import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getShopOwnerContext } from "@/lib/auth/shop-auth"

// GET attendance for a specific date or date range
export async function GET(request: NextRequest) {
    const ctx = await getShopOwnerContext()
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { searchParams } = new URL(request.url)
        const date = searchParams.get("date")
        const month = searchParams.get("month") // Format: YYYY-MM
        const staffId = searchParams.get("staffId")

        let targetShopId = ctx.shopId
        if (ctx.isAdmin) {
            const queryShopId = searchParams.get("shopId")
            if (queryShopId) targetShopId = queryShopId
        }

        const where: any = {}
        if (targetShopId) where.shopId = targetShopId
        if (staffId) where.staffId = staffId

        if (month) {
            where.date = { startsWith: month }
        } else if (date) {
            where.date = date
        } else {
            where.date = new Date().toISOString().split("T")[0]
        }

        const records = await db.staffAttendance.findMany({
            where,
            include: {
                staff: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        phone: true,
                        status: true,
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json({ success: true, date, records })
    } catch (error: any) {
        console.error("Error fetching attendance:", error)
        return NextResponse.json({ error: error?.message || "Failed to fetch attendance" }, { status: 500 })
    }
}

// POST mark or update attendance (single or batch)
export async function POST(request: NextRequest) {
    const ctx = await getShopOwnerContext()
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const body = await request.json()
        const targetShopId = ctx.shopId

        // Support array of records or single record
        const recordsToProcess = Array.isArray(body.records) ? body.records : [body]

        const results = []

        for (const item of recordsToProcess) {
            const { staffId, date, status, checkIn, checkOut, notes } = item
            if (!staffId || !date) continue

            // Upsert attendance for staffId + date
            const record = await db.staffAttendance.upsert({
                where: {
                    staffId_date: {
                        staffId,
                        date,
                    }
                },
                update: {
                    status: status || "PRESENT",
                    checkIn: checkIn !== undefined ? checkIn : undefined,
                    checkOut: checkOut !== undefined ? checkOut : undefined,
                    notes: notes !== undefined ? notes : undefined,
                },
                create: {
                    staffId,
                    date,
                    status: status || "PRESENT",
                    checkIn: checkIn || null,
                    checkOut: checkOut || null,
                    notes: notes || null,
                    shopId: targetShopId || null,
                }
            })
            results.push(record)
        }

        return NextResponse.json({
            success: true,
            updatedCount: results.length,
            records: results,
            message: "Attendance recorded successfully"
        })
    } catch (error: any) {
        console.error("Error updating attendance:", error)
        return NextResponse.json({ error: error?.message || "Failed to record attendance" }, { status: 500 })
    }
}
