import { NextRequest, NextResponse } from "next/server"
import { getStaffContext } from "@/lib/auth/staff-auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
    const ctx = await getStaffContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const month = searchParams.get("month") // "YYYY-MM"
        const year = searchParams.get("year")   // "YYYY"
        const startDate = searchParams.get("startDate") // "YYYY-MM-DD"
        const endDate = searchParams.get("endDate")     // "YYYY-MM-DD"

        const where: any = {
            staffId: ctx.staff.id
        }

        let periodLabel = "All Time"

        if (startDate && endDate) {
            where.date = { gte: startDate, lte: endDate }
            periodLabel = `${startDate} to ${endDate}`
        } else if (year) {
            where.date = { startsWith: year }
            periodLabel = `Year ${year}`
        } else if (month) {
            where.date = { startsWith: month }
            periodLabel = month
        } else {
            // Default: current month
            const currentMonth = new Date().toISOString().slice(0, 7)
            where.date = { startsWith: currentMonth }
            periodLabel = currentMonth
        }

        const [records, shop] = await Promise.all([
            db.staffAttendance.findMany({
                where,
                orderBy: { date: "desc" }
            }),
            ctx.staff.shopId ? db.shop.findUnique({
                where: { id: ctx.staff.shopId },
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    address: true,
                    city: true,
                    latitude: true,
                    longitude: true,
                    geofenceRadius: true,
                    autoAttendanceEnabled: true
                }
            }) : null
        ])

        const presentCount = records.filter(r => r.status === "PRESENT").length
        const halfDayCount = records.filter(r => r.status === "HALF_DAY").length
        const absentCount = records.filter(r => r.status === "ABSENT").length
        const leaveCount = records.filter(r => r.status === "LEAVE").length
        const payableDays = presentCount + (halfDayCount * 0.5)

        // Calculate total hours if checkIn and checkOut available
        let totalMinutesWorked = 0
        records.forEach(r => {
            if (r.checkIn && r.checkOut) {
                const mins = getMinutesDifference(r.checkIn, r.checkOut)
                if (mins > 0) totalMinutesWorked += mins
            }
        })
        const totalHoursWorked = (totalMinutesWorked / 60).toFixed(1)

        // Estimated payout if daily wage or monthly salary
        let estimatedEarnings: number | null = null
        if (ctx.staff.salaryType === "DAILY" && ctx.staff.salary > 0) {
            estimatedEarnings = Math.round(payableDays * ctx.staff.salary)
        } else if (ctx.staff.salaryType === "MONTHLY" && ctx.staff.salary > 0 && records.length > 0) {
            const dailyRate = ctx.staff.salary / 30
            estimatedEarnings = Math.round(payableDays * dailyRate)
        }

        return NextResponse.json({
            success: true,
            periodLabel,
            records,
            staffInfo: {
                id: ctx.staff.id,
                name: ctx.staff.name,
                role: ctx.staff.role,
                phone: ctx.staff.phone,
                salaryType: ctx.staff.salaryType,
                salary: ctx.staff.salary,
                shopName: shop?.name || "Detailing Garage",
                shopAddress: shop?.address || "",
                shopCity: shop?.city || "",
                shopPhone: shop?.phone || "",
            },
            shopGeofence: shop ? {
                hasLocation: !!(shop.latitude && shop.longitude),
                latitude: shop.latitude,
                longitude: shop.longitude,
                radius: shop.geofenceRadius || 150,
                autoAttendanceEnabled: shop.autoAttendanceEnabled ?? true
            } : null,
            stats: {
                totalLoggedDays: records.length,
                presentDays: presentCount,
                halfDays: halfDayCount,
                absentDays: absentCount,
                leaveDays: leaveCount,
                totalPayableDays: payableDays,
                totalHoursWorked: parseFloat(totalHoursWorked),
                estimatedEarnings,
                attendancePercentage: records.length > 0
                    ? Math.round((payableDays / records.length) * 100)
                    : 0
            }
        })
    } catch (error: any) {
        console.error("Error fetching staff attendance:", error)
        return NextResponse.json({ error: error?.message || "Failed to fetch attendance" }, { status: 500 })
    }
}

// Helper to calculate difference in minutes between two 12h time strings (e.g. "09:30 AM", "06:45 PM")
function getMinutesDifference(time1: string, time2: string): number {
    try {
        const parseTime = (t: string) => {
            const parts = t.trim().match(/(\d+):(\d+)\s*(AM|PM)/i)
            if (!parts) return null
            let hours = parseInt(parts[1], 10)
            const minutes = parseInt(parts[2], 10)
            const modifier = parts[3].toUpperCase()
            if (modifier === "PM" && hours < 12) hours += 12
            if (modifier === "AM" && hours === 12) hours = 0
            return hours * 60 + minutes
        }
        const m1 = parseTime(time1)
        const m2 = parseTime(time2)
        if (m1 === null || m2 === null) return 0
        if (m2 >= m1) return m2 - m1
        return (1440 - m1) + m2 // wrapped past midnight
    } catch {
        return 0
    }
}
