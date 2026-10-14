import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"

export interface StaffContext {
    user: {
        id: string
        name: string
        email: string
        role: string
    }
    staff: {
        id: string
        name: string
        email: string | null
        phone: string | null
        role: string
        specialization: string | null
        salaryType: string
        salary: number
        commissionRate: number
        status: string
        shopId: string | null
        shop?: {
            id: string
            name: string
            phone: string | null
            address: string | null
            city: string | null
            latitude?: number | null
            longitude?: number | null
            geofenceRadius?: number | null
            autoAttendanceEnabled?: boolean
        } | null
    }
    shopId: string | null
    isStaff: boolean
    isPreview: boolean
}

export async function getStaffContext(): Promise<StaffContext | null> {
    const user = await getCurrentUser()
    if (!user) return null

    // 1. Direct staff login
    if (user.role === "STAFF") {
        const staff = await db.shopStaff.findFirst({
            where: { userId: user.userId },
            include: {
                shop: {
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
                }
            }
        })

        if (!staff) {
            // Fallback: check by email match if userId wasn't set yet
            const staffByEmail = await db.shopStaff.findFirst({
                where: { email: user.email.toLowerCase() },
                include: {
                    shop: {
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
                    }
                }
            })

            if (staffByEmail) {
                // Link userId now
                await db.shopStaff.update({
                    where: { id: staffByEmail.id },
                    data: { userId: user.userId }
                })
                return {
                    user: { id: user.userId, name: user.name, email: user.email, role: user.role },
                    staff: staffByEmail,
                    shopId: staffByEmail.shopId,
                    isStaff: true,
                    isPreview: false
                }
            }

            return null
        }

        return {
            user: { id: user.userId, name: user.name, email: user.email, role: user.role },
            staff,
            shopId: staff.shopId,
            isStaff: true,
            isPreview: false
        }
    }

    // 2. Shop owner or Admin viewing/previewing staff portal
    if (user.role === "SHOP_OWNER" || user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        let targetShopId: string | null = null
        if (user.role === "SHOP_OWNER") {
            const shop = await db.shop.findFirst({ where: { ownerUserId: user.userId } })
            targetShopId = shop?.id || null
        }

        // Pick first active staff member of the shop for preview
        const firstStaff = await db.shopStaff.findFirst({
            where: targetShopId ? { shopId: targetShopId } : {},
            include: {
                shop: {
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
                }
            },
            orderBy: { createdAt: "desc" }
        })

        if (firstStaff) {
            return {
                user: { id: user.userId, name: user.name, email: user.email, role: user.role },
                staff: firstStaff,
                shopId: firstStaff.shopId,
                isStaff: false,
                isPreview: true
            }
        }
    }

    return null
}
