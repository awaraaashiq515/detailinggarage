import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getShopOwnerContext } from "@/lib/auth/shop-auth"

// GET single staff member with history
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const ctx = await getShopOwnerContext()
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { id } = await params

        const staff = await db.shopStaff.findUnique({
            where: { id },
            include: {
                invoices: {
                    select: {
                        id: true,
                        invoiceNumber: true,
                        date: true,
                        grandTotal: true,
                        status: true,
                        vehicleName: true,
                        vehicleRegNo: true,
                        client: { select: { name: true, phone: true } }
                    },
                    orderBy: { date: "desc" },
                    take: 20
                },
                attendance: {
                    orderBy: { date: "desc" },
                    take: 30
                },
                commissions: {
                    include: {
                        invoice: {
                            select: { invoiceNumber: true, grandTotal: true }
                        }
                    },
                    orderBy: { createdAt: "desc" },
                    take: 50
                }
            }
        })

        if (!staff) {
            return NextResponse.json({ error: "Staff member not found" }, { status: 404 })
        }

        // Check ownership
        if (!ctx.isAdmin && staff.shopId && staff.shopId !== ctx.shopId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        return NextResponse.json({ success: true, staff })
    } catch (error: any) {
        console.error("Error fetching staff details:", error)
        return NextResponse.json({ error: error?.message || "Failed to fetch staff" }, { status: 500 })
    }
}

// PUT update staff member
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const ctx = await getShopOwnerContext()
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { id } = await params
        const body = await request.json()

        const existing = await db.shopStaff.findUnique({ where: { id } })
        if (!existing) {
            return NextResponse.json({ error: "Staff member not found" }, { status: 404 })
        }

        if (!ctx.isAdmin && existing.shopId && existing.shopId !== ctx.shopId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        let currentUserId = existing.userId
        const cleanEmail = body.email !== undefined ? (body.email ? body.email.trim().toLowerCase() : null) : existing.email

        if (body.password && body.password.trim()) {
            const bcrypt = await import("bcryptjs")
            const hashedPassword = await bcrypt.default.hash(body.password.trim(), 12)
            if (currentUserId) {
                await db.user.update({
                    where: { id: currentUserId },
                    data: {
                        password: hashedPassword,
                        ...(cleanEmail ? { email: cleanEmail } : {}),
                        ...(body.name ? { name: body.name.trim() } : {})
                    }
                })
            } else if (cleanEmail) {
                const existingUser = await db.user.findUnique({ where: { email: cleanEmail } })
                if (existingUser) {
                    await db.user.update({
                        where: { id: existingUser.id },
                        data: { password: hashedPassword, role: "STAFF" }
                    })
                    currentUserId = existingUser.id
                } else {
                    const newUser = await db.user.create({
                        data: {
                            name: body.name ? body.name.trim() : existing.name,
                            email: cleanEmail,
                            mobile: body.phone ? body.phone.trim() : existing.phone,
                            password: hashedPassword,
                            role: "STAFF",
                            status: "APPROVED",
                            emailVerified: true
                        }
                    })
                    currentUserId = newUser.id
                }
            }
        }

        const updated = await db.shopStaff.update({
            where: { id },
            data: {
                name: body.name !== undefined ? body.name.trim() : existing.name,
                phone: body.phone !== undefined ? (body.phone ? body.phone.trim() : null) : existing.phone,
                email: cleanEmail,
                role: body.role !== undefined ? body.role : existing.role,
                specialization: body.specialization !== undefined ? (body.specialization ? body.specialization.trim() : null) : existing.specialization,
                salaryType: body.salaryType !== undefined ? body.salaryType : existing.salaryType,
                salary: body.salary !== undefined ? parseFloat(body.salary) || 0 : existing.salary,
                commissionRate: body.commissionRate !== undefined ? parseFloat(body.commissionRate) || 0 : existing.commissionRate,
                status: body.status !== undefined ? body.status : existing.status,
                joinedDate: body.joinedDate ? new Date(body.joinedDate) : existing.joinedDate,
                aadharOrId: body.aadharOrId !== undefined ? (body.aadharOrId ? body.aadharOrId.trim() : null) : existing.aadharOrId,
                address: body.address !== undefined ? (body.address ? body.address.trim() : null) : existing.address,
                notes: body.notes !== undefined ? (body.notes ? body.notes.trim() : null) : existing.notes,
                userId: currentUserId
            }
        })

        return NextResponse.json({
            success: true,
            staff: updated,
            message: "Staff member updated successfully"
        })
    } catch (error: any) {
        console.error("Error updating staff:", error)
        return NextResponse.json({ error: error?.message || "Failed to update staff" }, { status: 500 })
    }
}

// DELETE staff member
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const ctx = await getShopOwnerContext()
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { id } = await params

        const existing = await db.shopStaff.findUnique({ where: { id } })
        if (!existing) {
            return NextResponse.json({ error: "Staff member not found" }, { status: 404 })
        }

        if (!ctx.isAdmin && existing.shopId && existing.shopId !== ctx.shopId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        await db.shopStaff.delete({ where: { id } })

        return NextResponse.json({
            success: true,
            message: "Staff member removed successfully"
        })
    } catch (error: any) {
        console.error("Error deleting staff:", error)
        return NextResponse.json({ error: error?.message || "Failed to delete staff" }, { status: 500 })
    }
}
