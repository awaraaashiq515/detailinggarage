import { NextRequest, NextResponse } from "next/server"
import { db as prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth/jwt"

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { searchParams } = new URL(req.url)
        let targetShopId: string | undefined = undefined

        if (user.role === "SHOP_OWNER") {
            const shop = await prisma.shop.findUnique({ where: { ownerUserId: user.userId } })
            if (!shop || !shop.hasPdiAccess) {
                return NextResponse.json({ error: "PDI module is not enabled for your workshop" }, { status: 403 })
            }
            targetShopId = shop.id
        } else if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
            const requestedShopId = searchParams.get("shopId")
            if (requestedShopId && requestedShopId !== "all") {
                targetShopId = requestedShopId
            } else if (searchParams.get("shopPortal") === "true" || req.headers.get("referer")?.includes("/shop/billing")) {
                const defaultShop = await prisma.shop.findFirst({ where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" } })
                targetShopId = defaultShop ? defaultShop.id : "unassigned"
            }
        } else {
            return NextResponse.json({ error: "Unauthorized - Access denied" }, { status: 401 })
        }

        const where: any = {}
        if (targetShopId) {
            where.shopId = targetShopId
        }

        const inspections = await prisma.eVPDIInspection.findMany({
            where,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                shopId: true,
                vehicleMake: true,
                vehicleModel: true,
                vehicleVariant: true,
                vehicleColor: true,
                vehicleYear: true,
                vin: true,
                registrationNumber: true,
                customerName: true,
                customerEmail: true,
                customerPhone: true,
                inspectionDate: true,
                inspectedBy: true,
                status: true,
                finalResult: true,
                scores: true,
                createdAt: true,
                shop: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
        })

        return NextResponse.json(inspections)
    } catch (error) {
        console.error("EV PDI list error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
