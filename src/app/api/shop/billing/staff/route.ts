import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getShopOwnerContext } from "@/lib/auth/shop-auth"
import bcrypt from "bcryptjs"

// GET all staff members for this shop
export async function GET(request: NextRequest) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get("search") || ""
        const status = searchParams.get("status") || ""
        const role = searchParams.get("role") || ""

        let targetShopId = ctx.shopId
        if (ctx.isAdmin) {
            const queryShopId = searchParams.get("shopId")
            if (queryShopId) targetShopId = queryShopId
        }

        const where: any = {}
        if (targetShopId) {
            where.shopId = targetShopId
        }
        if (status) {
            where.status = status
        }
        if (role) {
            where.role = role
        }
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { phone: { contains: search } },
                { specialization: { contains: search } },
                { role: { contains: search } },
            ]
        }

        const today = new Date().toISOString().split("T")[0]

        const staffMembers = await db.shopStaff.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        status: true
                    }
                },
                attendance: {
                    where: { date: today },
                    take: 1
                },
                _count: {
                    select: {
                        invoices: true,
                        commissions: true,
                        jobCards: true
                    }
                },
                commissions: {
                    where: { status: "PENDING" },
                    select: { amount: true }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        // Format and aggregate
        const formattedStaff = staffMembers.map(staff => {
            const pendingCommissionTotal = staff.commissions.reduce((acc, c) => acc + c.amount, 0)
            const todayAttendance = staff.attendance[0] || null

            return {
                id: staff.id,
                userId: staff.userId,
                name: staff.name,
                phone: staff.phone,
                email: staff.email || staff.user?.email || null,
                hasPortalAccess: !!staff.userId,
                role: staff.role,
                specialization: staff.specialization,
                salaryType: staff.salaryType,
                salary: staff.salary,
                commissionRate: staff.commissionRate,
                status: staff.status,
                joinedDate: staff.joinedDate,
                aadharOrId: staff.aadharOrId,
                address: staff.address,
                notes: staff.notes,
                shopId: staff.shopId,
                createdAt: staff.createdAt,
                todayStatus: todayAttendance ? todayAttendance.status : "NOT_MARKED",
                checkIn: todayAttendance?.checkIn || null,
                checkOut: todayAttendance?.checkOut || null,
                punchMethod: todayAttendance?.punchMethod || null,
                latitude: todayAttendance?.latitude || null,
                longitude: todayAttendance?.longitude || null,
                distanceMeters: todayAttendance?.distanceMeters || null,
                completedJobsCount: staff._count.invoices,
                assignedJobCardsCount: staff._count.jobCards,
                pendingCommissionsCount: staff.commissions.length,
                pendingCommissionAmount: pendingCommissionTotal
            }
        })

        // Summary metrics
        const totalStaff = formattedStaff.length
        const activeStaff = formattedStaff.filter(s => s.status === "ACTIVE").length
        const presentToday = formattedStaff.filter(s => s.todayStatus === "PRESENT" || s.todayStatus === "HALF_DAY").length
        const totalMonthlySalary = formattedStaff
            .filter(s => s.status === "ACTIVE" && s.salaryType === "MONTHLY")
            .reduce((sum, s) => sum + (s.salary || 0), 0)
        const totalPendingCommissions = formattedStaff.reduce((sum, s) => sum + s.pendingCommissionAmount, 0)

        return NextResponse.json({
            success: true,
            staff: formattedStaff,
            summary: {
                totalStaff,
                activeStaff,
                presentToday,
                totalMonthlySalary,
                totalPendingCommissions
            }
        })
    } catch (error: any) {
        console.error("Error fetching staff:", error)
        return NextResponse.json({ error: error?.message || "Failed to fetch staff" }, { status: 500 })
    }
}

// POST create new staff member
export async function POST(request: NextRequest) {
    const ctx = await getShopOwnerContext()
    if (!ctx) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const {
            name,
            phone,
            email,
            password,
            role,
            specialization,
            salaryType,
            salary,
            commissionRate,
            status,
            joinedDate,
            aadharOrId,
            address,
            notes,
            shopId: customShopId
        } = body

        if (!name || !name.trim()) {
            return NextResponse.json({ error: "Staff name is required" }, { status: 400 })
        }

        const effectiveShopId = ctx.isAdmin && customShopId ? customShopId : ctx.shopId

        let createdUserId: string | null = null

        // If email and password provided, create User account with role STAFF
        const cleanEmail = email ? email.trim().toLowerCase() : null
        if (cleanEmail && password && password.trim()) {
            // Check if user already exists
            const existingUser = await db.user.findUnique({
                where: { email: cleanEmail }
            })

            if (existingUser) {
                // If user exists and is already linked to staff
                const existingStaffWithUser = await db.shopStaff.findFirst({
                    where: { userId: existingUser.id }
                })
                if (existingStaffWithUser) {
                    return NextResponse.json({ error: `An account with email ${cleanEmail} is already linked to another staff member` }, { status: 400 })
                }
                // If user exists without staff profile and has role STAFF
                if (existingUser.role === "STAFF") {
                    createdUserId = existingUser.id
                } else {
                    return NextResponse.json({ error: `Email ${cleanEmail} is already registered with role ${existingUser.role}` }, { status: 400 })
                }
            } else {
                // Create brand new User for staff
                const hashedPassword = await bcrypt.hash(password.trim(), 12)
                const newUser = await db.user.create({
                    data: {
                        name: name.trim(),
                        email: cleanEmail,
                        mobile: phone ? phone.trim() : null,
                        password: hashedPassword,
                        role: "STAFF",
                        status: "APPROVED",
                        emailVerified: true
                    }
                })
                createdUserId = newUser.id
            }
        }

        const newStaff = await db.shopStaff.create({
            data: {
                name: name.trim(),
                phone: phone ? phone.trim() : null,
                email: cleanEmail,
                role: role || "TECHNICIAN",
                specialization: specialization ? specialization.trim() : null,
                salaryType: salaryType || "MONTHLY",
                salary: parseFloat(salary) || 0,
                commissionRate: parseFloat(commissionRate) || 0,
                status: status || "ACTIVE",
                joinedDate: joinedDate ? new Date(joinedDate) : new Date(),
                aadharOrId: aadharOrId ? aadharOrId.trim() : null,
                address: address ? address.trim() : null,
                notes: notes ? notes.trim() : null,
                shopId: effectiveShopId || null,
                userId: createdUserId
            },
            include: {
                user: {
                    select: { id: true, email: true, role: true }
                }
            }
        })

        return NextResponse.json({
            success: true,
            staff: newStaff,
            message: createdUserId 
                ? "Staff member & login portal account created successfully" 
                : "Staff member added successfully"
        })
    } catch (error: any) {
        console.error("Error creating staff:", error)
        return NextResponse.json({ error: error?.message || "Failed to create staff" }, { status: 500 })
    }
}
