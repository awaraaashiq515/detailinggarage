import { NextRequest, NextResponse } from 'next/server'
import * as pdiService from '@/services/pdi-service'
import { getCurrentUser } from '@/lib/auth/jwt'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        let targetShopId: string | undefined = undefined

        if (user.role === 'SHOP_OWNER') {
            const shop = await db.shop.findUnique({ where: { ownerUserId: user.userId } })
            if (!shop || !shop.hasPdiAccess) {
                return NextResponse.json({ error: 'PDI module is not enabled for your workshop' }, { status: 403 })
            }
            targetShopId = shop.id
        } else if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            // Admin can view all or filter by specific shopId
            const requestedShopId = searchParams.get('shopId')
            if (requestedShopId && requestedShopId !== 'all') {
                targetShopId = requestedShopId
            } else if (searchParams.get('shopPortal') === 'true' || request.headers.get('referer')?.includes('/shop/billing')) {
                // Admin previewing shop portal: isolate to the workshop
                const defaultShop = await db.shop.findFirst({ where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } })
                targetShopId = defaultShop ? defaultShop.id : 'unassigned'
            }
        } else {
            return NextResponse.json({ error: 'Unauthorized - Access denied' }, { status: 401 })
        }

        const filter = targetShopId ? { shopId: targetShopId } : undefined
        const inspections = await pdiService.getAllPDIInspections(filter)
        return NextResponse.json(inspections)
    } catch (error) {
        console.error('Failed to fetch PDI inspections:', error)
        return NextResponse.json(
            { error: 'Failed to load inspections' },
            { status: 500 }
        )
    }
}
