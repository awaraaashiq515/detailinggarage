import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/jwt'
import { getInsuranceClaim } from '@/services/insurance-service'

type RouteParams = Promise<{ id: string }>

/**
 * GET - Get a specific insurance claim detail
 */
export async function GET(
    request: NextRequest,
    { params }: { params: RouteParams }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const claim = await getInsuranceClaim(id)

        if (!claim) {
            return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
        }

        // Ensure the user can only access their own claims (unless admin)
        const isAdmin = user.role === 'ADMIN'
        if (!isAdmin && claim.userId !== user.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        return NextResponse.json(claim)
    } catch (error: any) {
        console.error('Error fetching insurance claim:', error)
        return NextResponse.json({ error: error.message || 'Failed to fetch claim' }, { status: 500 })
    }
}
