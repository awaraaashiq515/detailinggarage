import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getShopOwnerContext } from "@/lib/auth/shop-auth"

export async function GET(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { searchParams } = new URL(request.url)
        const now = new Date()
        const month = parseInt(searchParams.get("month") || String(now.getMonth() + 1))
        const year = parseInt(searchParams.get("year") || String(now.getFullYear()))
        const period = `${year}-${String(month).padStart(2, "0")}`

        const shopWhere = ctx.isAdmin ? {} : { shopId: ctx.shopId }

        // Fetch all active staff
        const staffList = await db.shopStaff.findMany({
            where: {
                ...shopWhere,
                status: "ACTIVE"
            },
            include: {
                salaries: {
                    where: { period }
                },
                advances: {
                    where: {
                        status: { in: ["PENDING", "PARTIALLY_RECOVERED"] }
                    },
                    orderBy: { advanceDate: "asc" }
                },
                attendance: {
                    where: {
                        date: {
                            startsWith: period
                        }
                    }
                }
            },
            orderBy: { name: "asc" }
        })

        // Format staff payroll rows
        const staffPayroll = staffList.map(staff => {
            const salaryRecord = staff.salaries[0] || null
            const pendingAdvancesTotal = staff.advances.reduce((sum, adv) => sum + (adv.amount - adv.recoveredAmount), 0)

            const presentDays = staff.attendance.filter(a => a.status === "PRESENT").length
            const halfDays = staff.attendance.filter(a => a.status === "HALF_DAY").length
            const absentDays = staff.attendance.filter(a => a.status === "ABSENT").length

            const baseSalary = salaryRecord ? salaryRecord.baseSalary : staff.salary
            const bonus = salaryRecord ? salaryRecord.bonus : 0
            const advanceDeducted = salaryRecord ? salaryRecord.advanceDeducted : 0
            const otherDeductions = salaryRecord ? salaryRecord.otherDeductions : 0
            const netPaid = salaryRecord ? salaryRecord.netPaid : (baseSalary + bonus - advanceDeducted - otherDeductions)
            const status = salaryRecord ? salaryRecord.status : "UNPAID"

            return {
                staffId: staff.id,
                name: staff.name,
                phone: staff.phone,
                role: staff.role,
                salaryType: staff.salaryType,
                baseSalary,
                pendingAdvancesTotal,
                advances: staff.advances,
                attendanceSummary: {
                    presentDays,
                    halfDays,
                    absentDays,
                    totalPunched: staff.attendance.length
                },
                salaryRecord: salaryRecord ? {
                    id: salaryRecord.id,
                    period: salaryRecord.period,
                    baseSalary: salaryRecord.baseSalary,
                    bonus: salaryRecord.bonus,
                    advanceDeducted: salaryRecord.advanceDeducted,
                    otherDeductions: salaryRecord.otherDeductions,
                    netPaid: salaryRecord.netPaid,
                    status: salaryRecord.status,
                    paymentMethod: salaryRecord.paymentMethod,
                    paymentDate: salaryRecord.paymentDate,
                    transactionRef: salaryRecord.transactionRef,
                    notes: salaryRecord.notes
                } : null,
                calculated: {
                    baseSalary,
                    bonus,
                    advanceDeducted,
                    otherDeductions,
                    netPayable: Math.max(0, baseSalary + bonus - advanceDeducted - otherDeductions),
                    status
                }
            }
        })

        // Summary KPI Metrics
        const totalBaseBudget = staffPayroll.reduce((sum, s) => sum + s.baseSalary, 0)
        const totalPaidOut = staffPayroll
            .filter(s => s.salaryRecord && s.salaryRecord.status === "PAID")
            .reduce((sum, s) => sum + (s.salaryRecord?.netPaid || 0), 0)
        const totalPendingSalary = staffPayroll
            .filter(s => !s.salaryRecord || s.salaryRecord.status !== "PAID")
            .reduce((sum, s) => sum + s.calculated.netPayable, 0)
        const totalOutstandingAdvances = staffPayroll.reduce((sum, s) => sum + s.pendingAdvancesTotal, 0)
        const paidCount = staffPayroll.filter(s => s.salaryRecord?.status === "PAID").length
        const unpaidCount = staffPayroll.length - paidCount

        return NextResponse.json({
            period,
            month,
            year,
            metrics: {
                totalBaseBudget,
                totalPaidOut,
                totalPendingSalary,
                totalOutstandingAdvances,
                totalStaff: staffPayroll.length,
                paidCount,
                unpaidCount
            },
            staffPayroll
        })
    } catch (error: any) {
        console.error("Failed to fetch salary data:", error)
        return NextResponse.json({ error: error.message || "Failed to fetch salary data" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const ctx = await getShopOwnerContext()
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const body = await request.json()
        const {
            staffId,
            month,
            year,
            baseSalary,
            bonus = 0,
            advanceDeducted = 0,
            otherDeductions = 0,
            netPaid,
            paymentMethod = "CASH",
            paymentDate = new Date().toISOString(),
            status = "PAID",
            transactionRef,
            notes
        } = body

        if (!staffId || !month || !year) {
            return NextResponse.json({ error: "staffId, month, and year are required" }, { status: 400 })
        }

        const period = `${year}-${String(month).padStart(2, "0")}`

        // Verify staff exists and belongs to shop
        const staff = await db.shopStaff.findUnique({
            where: { id: staffId }
        })
        if (!staff) {
            return NextResponse.json({ error: "Staff not found" }, { status: 404 })
        }
        if (!ctx.isAdmin && staff.shopId !== ctx.shopId) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 })
        }

        const shopId = staff.shopId || ctx.shopId

        // Upsert salary payment record
        const existingRecord = await db.staffSalaryPayment.findFirst({
            where: {
                staffId,
                period
            }
        })

        let record
        if (existingRecord) {
            record = await db.staffSalaryPayment.update({
                where: { id: existingRecord.id },
                data: {
                    baseSalary: Number(baseSalary),
                    bonus: Number(bonus),
                    advanceDeducted: Number(advanceDeducted),
                    otherDeductions: Number(otherDeductions),
                    netPaid: Number(netPaid),
                    status,
                    paymentMethod,
                    paymentDate: new Date(paymentDate),
                    transactionRef: transactionRef || null,
                    notes: notes || null
                }
            })
        } else {
            record = await db.staffSalaryPayment.create({
                data: {
                    staffId,
                    shopId,
                    month: Number(month),
                    year: Number(year),
                    period,
                    baseSalary: Number(baseSalary),
                    bonus: Number(bonus),
                    advanceDeducted: Number(advanceDeducted),
                    otherDeductions: Number(otherDeductions),
                    netPaid: Number(netPaid),
                    status,
                    paymentMethod,
                    paymentDate: new Date(paymentDate),
                    transactionRef: transactionRef || null,
                    notes: notes || null
                }
            })
        }

        // If advance is deducted, recover from outstanding advances
        if (Number(advanceDeducted) > 0) {
            let remainingDeduction = Number(advanceDeducted)

            const pendingAdvances = await db.staffAdvance.findMany({
                where: {
                    staffId,
                    status: { in: ["PENDING", "PARTIALLY_RECOVERED"] }
                },
                orderBy: { advanceDate: "asc" }
            })

            for (const adv of pendingAdvances) {
                if (remainingDeduction <= 0) break

                const unrecoveredOnAdv = adv.amount - adv.recoveredAmount
                const toDeduct = Math.min(unrecoveredOnAdv, remainingDeduction)
                const newRecovered = adv.recoveredAmount + toDeduct
                const newStatus = newRecovered >= adv.amount ? "DEDUCTED" : "PARTIALLY_RECOVERED"

                await db.staffAdvance.update({
                    where: { id: adv.id },
                    data: {
                        recoveredAmount: newRecovered,
                        status: newStatus
                    }
                })

                remainingDeduction -= toDeduct
            }
        }

        return NextResponse.json({ success: true, record })
    } catch (error: any) {
        console.error("Failed to save salary payment:", error)
        return NextResponse.json({ error: error.message || "Failed to save salary payment" }, { status: 500 })
    }
}
