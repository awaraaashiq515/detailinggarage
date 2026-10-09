import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

// Helper: get current shop owner's shop
async function getShopOwnerContext() {
    const user = await getCurrentUser()
    if (!user) return null

    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        // Admin can access all — no shopId restriction
        return { user, shopId: null, isAdmin: true }
    }

    if (user.role === "SHOP_OWNER") {
        const shop = await db.shop.findUnique({
            where: { ownerUserId: user.userId }
        })
        if (!shop || shop.status !== "ACTIVE") return null
        return { user, shopId: shop.id, isAdmin: false, shop }
    }

    return null
}

export { getShopOwnerContext }
