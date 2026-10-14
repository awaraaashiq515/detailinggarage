import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"
import bcrypt from "bcryptjs"

async function checkAdminAuth() {
    const user = await getCurrentUser()
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) return null
    return user
}

// GET all shops (with owner info and stats)
export async function GET(request: Request) {
    if (!await checkAdminAuth()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (id) {
            const shop = await db.shop.findUnique({
                where: { id },
                include: {
                    owner: { select: { id: true, name: true, email: true, mobile: true, status: true, createdAt: true } },
                    billingProfile: true,
                    _count: { select: { clients: true, invoices: true } }
                }
            })
            if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 })
            return NextResponse.json({ success: true, shop })
        }

        const shops = await db.shop.findMany({
            include: {
                owner: { select: { id: true, name: true, email: true, mobile: true, status: true, createdAt: true } },
                billingProfile: true,
                _count: { select: { clients: true, invoices: true } }
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json({ success: true, shops })
    } catch (error) {
        console.error("Error fetching shops:", error)
        return NextResponse.json({ error: "Failed to fetch shops" }, { status: 500 })
    }
}

// POST create a new shop + user account
export async function POST(request: Request) {
    if (!await checkAdminAuth()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
            const {
                // Owner account
                ownerName, ownerEmail, ownerMobile, ownerPassword,
                // Shop info
                shopName, phone, email, address, city, state, gstin,
                hasPdiAccess, hasInsuranceAccess,
            } = body

            if (!ownerName?.trim() || !ownerEmail?.trim() || !ownerPassword || !shopName?.trim()) {
                return NextResponse.json({ error: "Owner name, email, password and shop name are required" }, { status: 400 })
            }

            const normalizedEmail = ownerEmail.trim().toLowerCase()
            const normalizedMobile = ownerMobile?.trim() ? ownerMobile.trim() : null

            // Check if email already exists
            const existing = await db.user.findUnique({ where: { email: normalizedEmail } })
            if (existing) {
                return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 })
            }

            // Check if mobile already exists (if provided)
            if (normalizedMobile) {
                const existingMobile = await db.user.findUnique({ where: { mobile: normalizedMobile } })
                if (existingMobile) {
                    return NextResponse.json({ error: "A user with this mobile number already exists" }, { status: 409 })
                }
            }

            const hashedPassword = await bcrypt.hash(ownerPassword, 12)

            // Create user + shop + profile in one transaction
            const result = await db.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        name: ownerName.trim(),
                        email: normalizedEmail,
                        mobile: normalizedMobile,
                        password: hashedPassword,
                        role: "SHOP_OWNER",
                        status: "APPROVED",
                        emailVerified: true,
                    }
                })

                const shop = await tx.shop.create({
                    data: {
                        name: shopName.trim(),
                        ownerUserId: user.id,
                        phone: phone?.trim() || null,
                        email: email?.trim() || null,
                        address: address?.trim() || null,
                        city: city?.trim() || null,
                        state: state?.trim() || null,
                        gstin: gstin?.trim() || null,
                        hasPdiAccess: Boolean(hasPdiAccess),
                        hasInsuranceAccess: Boolean(hasInsuranceAccess),
                    }
                })

                // Create empty billing profile for the shop
                await tx.shopBillingProfile.create({
                    data: {
                        shopId: shop.id,
                        businessName: shopName.trim(),
                        phone: phone?.trim() || null,
                        email: email?.trim() || null,
                        address: address?.trim() || null,
                        city: city?.trim() || null,
                        state: state?.trim() || null,
                        gstin: gstin?.trim() || null,
                    }
                })

                return { user, shop }
            })

            return NextResponse.json({
                success: true,
                shop: result.shop,
                message: `Shop "${shopName}" created successfully for ${ownerName}`
            })
        } catch (error: any) {
            console.error("Error creating shop:", error)
            return NextResponse.json({ error: error?.message || "Failed to create shop" }, { status: 500 })
        }
    }

    // PATCH update shop details or suspend/reactivate
    export async function PATCH(request: Request) {
        if (!await checkAdminAuth()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        try {
            const body = await request.json()
            const { id, status, name, phone, email, address, city, state, gstin, hasPdiAccess, hasInsuranceAccess } = body

            if (!id) return NextResponse.json({ error: "Shop ID required" }, { status: 400 })

            const shop = await db.shop.update({
                where: { id },
                data: {
                    ...(status && { status }),
                    ...(name && { name }),
                    ...(phone !== undefined && { phone }),
                    ...(email !== undefined && { email }),
                    ...(address !== undefined && { address }),
                    ...(city !== undefined && { city }),
                    ...(state !== undefined && { state }),
                    ...(gstin !== undefined && { gstin }),
                    ...(hasPdiAccess !== undefined && { hasPdiAccess: Boolean(hasPdiAccess) }),
                    ...(hasInsuranceAccess !== undefined && { hasInsuranceAccess: Boolean(hasInsuranceAccess) }),
                }
            })

        // If suspending/activating shop, also update owner user status
        if (status === "SUSPENDED") {
            await db.user.update({
                where: { id: shop.ownerUserId },
                data: { status: "SUSPENDED" }
            })
        } else if (status === "ACTIVE") {
            await db.user.update({
                where: { id: shop.ownerUserId },
                data: { status: "APPROVED" }
            })
        }

        return NextResponse.json({ success: true, shop })
    } catch (error: any) {
        console.error("Error updating shop:", error)
        return NextResponse.json({ error: error?.message || "Failed to update shop" }, { status: 500 })
    }
}

// DELETE shop (and owner account)
export async function DELETE(request: Request) {
    if (!await checkAdminAuth()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")
        if (!id) return NextResponse.json({ error: "Shop ID required" }, { status: 400 })

        const shop = await db.shop.findUnique({ where: { id } })
        if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 })

        // Deleting the shop cascades to clients, invoices, items, profile
        // Then delete the owner user
        await db.shop.delete({ where: { id } })
        await db.user.delete({ where: { id: shop.ownerUserId } })

        return NextResponse.json({ success: true, message: "Shop and owner account deleted" })
    } catch (error: any) {
        console.error("Error deleting shop:", error)
        return NextResponse.json({ error: error?.message || "Failed to delete shop" }, { status: 500 })
    }
}
