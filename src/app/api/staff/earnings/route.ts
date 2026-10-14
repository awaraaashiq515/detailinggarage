import { NextRequest, NextResponse } from "next/server"
import { getStaffContext } from "@/lib/auth/staff-auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
    const ctx = await getStaffContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const commissions = await db.staffCommission.findMany({
            where: {
                staffId: ctx.staff.id
            },
            include: {
                invoice: {
                    select: {
                        id: true,
                        invoiceNumber: true,
                        date: true,
                        vehicleName: true,
                        vehicleRegNo: true,
                        grandTotal: true,
                        status: true,
                        client: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            take: 100
        })

        const pendingTotal = commissions.filter(c => c.status === "PENDING").reduce((sum, c) => sum + c.amount, 0)
        const paidTotal = commissions.filter(c => c.status === "PAID").reduce((sum, c) => sum + c.amount, 0)
        const grandCommissionTotal = pendingTotal + paidTotal

        // Monthly Attendance to compute pro-rata salary
        const currentMonth = new Date().toISOString().slice(0, 7)
        const attendanceRecords = await db.staffAttendance.findMany({
            where: {
                staffId: ctx.staff.id,
                date: { startsWith: currentMonth }
            }
        })
        const presentDays = attendanceRecords.filter(r => r.status === "PRESENT").length
        const halfDays = attendanceRecords.filter(r => r.status === "HALF_DAY").length
        const payableDays = presentDays + (halfDays * 0.5)

        let estimatedBaseSalary = ctx.staff.salary || 0
        if (ctx.staff.salaryType === "DAILY") {
            estimatedBaseSalary = (ctx.staff.salary || 0) * payableDays
        } else if (ctx.staff.salaryType === "MONTHLY" && ctx.staff.salary > 0) {
            // 30 days default month calculation
            estimatedBaseSalary = Math.round(((ctx.staff.salary || 0) / 30) * payableDays)
        }

        return NextResponse.json({
            success: true,
            salary: {
                type: ctx.staff.salaryType,
                rate: ctx.staff.salary,
                commissionRate: ctx.staff.commissionRate,
                currentMonthDays: payableDays,
                estimatedSalaryEarned: estimatedBaseSalary
            },
            commissions: {
                items: commissions,
                pendingTotal,
                paidTotal,
                grandCommissionTotal
            },
            estimatedTotalEarnings: estimatedBaseSalary + pendingTotal + paidTotal
        })
    } catch (error: any) {
        console.error("Error fetching staff earnings:", error)
        return NextResponse.json({ error: error?.message || "Failed to fetch earnings" }, { status: 500 })
    }
}
