import { NextRequest, NextResponse } from 'next/server'
import * as pdiService from '@/services/pdi-service'
import { getCurrentUser } from '@/lib/auth/jwt'
import { db } from '@/lib/db'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const inspection = await pdiService.getPDIInspection(id)

        if (!inspection) {
            return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
        }

        if (user.role === 'SHOP_OWNER') {
            const shop = await db.shop.findUnique({ where: { ownerUserId: user.userId } })
            if (!shop || !shop.hasPdiAccess) {
                return NextResponse.json({ error: 'PDI module is not enabled for your workshop' }, { status: 403 })
            }
            // Workshop can only view their own PDI inspection
            if (inspection.shopId && inspection.shopId !== shop.id) {
                return NextResponse.json({ error: 'Access denied to this inspection report' }, { status: 403 })
            }
        } else if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized - Access denied' }, { status: 401 })
        }

        return NextResponse.json(inspection)
    } catch (error) {
        console.error('Failed to fetch PDI inspection:', error)
        return NextResponse.json(
            { error: 'Failed to load inspection details' },
            { status: 500 }
        )
    }
}
