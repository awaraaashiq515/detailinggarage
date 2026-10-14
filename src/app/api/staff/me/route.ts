import { NextRequest, NextResponse } from "next/server"
import { getStaffContext } from "@/lib/auth/staff-auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
    const ctx = await getStaffContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized. Staff login required." }, { status: 401 })
    }

    try {
        const today = new Date().toISOString().split("T")[0]

        // 1. Today's attendance
        const todayAttendance = await db.staffAttendance.findUnique({
            where: {
                staffId_date: {
                    staffId: ctx.staff.id,
                    date: today
                }
            }
        })

        // 2. Active vehicle jobs count
        const activeJobsCount = await db.staffJobCard.count({
            where: {
                staffId: ctx.staff.id,
                status: { in: ["ASSIGNED", "IN_PROGRESS"] }
            }
        })

        // 3. Jobs completed today
        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)
        const completedTodayCount = await db.staffJobCard.count({
            where: {
                staffId: ctx.staff.id,
                status: "COMPLETED",
                updatedAt: { gte: startOfToday }
            }
        })

        // 4. Pending commissions
        const commissions = await db.staffCommission.findMany({
            where: {
                staffId: ctx.staff.id,
                status: "PENDING"
            },
            select: { amount: true }
        })
        const totalPendingCommission = commissions.reduce((sum, c) => sum + c.amount, 0)

        // 5. Active job card (currently in progress)
        const currentActiveJob = await db.staffJobCard.findFirst({
            where: {
                staffId: ctx.staff.id,
                status: "IN_PROGRESS"
            },
            orderBy: { updatedAt: "desc" }
        })

        return NextResponse.json({
            success: true,
            staff: {
                id: ctx.staff.id,
                name: ctx.staff.name,
                email: ctx.staff.email,
                phone: ctx.staff.phone,
                role: ctx.staff.role,
                specialization: ctx.staff.specialization,
                salaryType: ctx.staff.salaryType,
                salary: ctx.staff.salary,
                commissionRate: ctx.staff.commissionRate,
                status: ctx.staff.status,
                shop: ctx.staff.shop
            },
            isPreview: ctx.isPreview,
            today: {
                date: today,
                status: todayAttendance ? todayAttendance.status : "NOT_MARKED",
                checkIn: todayAttendance?.checkIn || null,
                checkOut: todayAttendance?.checkOut || null,
                notes: todayAttendance?.notes || null,
                punchMethod: todayAttendance?.punchMethod || null,
                distanceMeters: todayAttendance?.distanceMeters || null,
                latitude: todayAttendance?.latitude || null,
                longitude: todayAttendance?.longitude || null,
            },
            stats: {
                activeJobs: activeJobsCount,
                completedToday: completedTodayCount,
                pendingCommissions: totalPendingCommission
            },
            currentActiveJob
        })
    } catch (error: any) {
        console.error("Error fetching staff me:", error)
        return NextResponse.json({ error: error?.message || "Failed to fetch staff details" }, { status: 500 })
    }
}
