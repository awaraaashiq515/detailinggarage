import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/jwt'
import { db } from '@/lib/db'
import { getInsuranceClaim } from '@/services/insurance-service'
import { generateInsuranceClaimPDF } from '@/services/insurance/pdf/generator/insurance-pdf-generator'
import { sendInsuranceClaimPDFEmail } from '@/lib/services/email'

type RouteParams = Promise<{ id: string }>

/**
 * POST - Generate PDF for an insurance claim (admin or permitted workshop owner)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: RouteParams }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (user.role === 'SHOP_OWNER') {
            const shop = await db.shop.findUnique({ where: { ownerUserId: user.userId } })
            if (!shop || !shop.hasInsuranceAccess) {
                return NextResponse.json({ error: 'Insurance module is not enabled for your workshop' }, { status: 403 })
            }
        } else if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
        }

        const { id } = await params

        // Check if claim exists
        const claim = await getInsuranceClaim(id)
        if (!claim) {
            return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
        }

        // Workshop scoping check
        if (user.role === 'SHOP_OWNER' && claim.shopId) {
            const shop = await db.shop.findUnique({ where: { ownerUserId: user.userId } })
            if (claim.shopId !== shop?.id) {
                return NextResponse.json({ error: 'Access denied to this claim' }, { status: 403 })
            }
        }

        // Generate PDF
        const pdfUrl = await generateInsuranceClaimPDF(id)

        // Send email notification to client (non-blocking)
        if (claim.user?.email) {
            try {
                const vehicleInfo = `${claim.vehicleMake} ${claim.vehicleModel}`
                await sendInsuranceClaimPDFEmail(
                    claim.user.email,
                    claim.user.name,
                    claim.claimNumber,
                    vehicleInfo,
                    id
                )
            } catch (emailErr) {
                console.warn('Could not send insurance PDF email notification:', emailErr)
            }
        }

        return NextResponse.json({
            success: true,
            message: 'PDF generated successfully',
            pdfUrl
        })
    } catch (error: any) {
        console.error('Error generating insurance claim PDF:', error)
        return NextResponse.json({ error: error.message || 'Failed to generate PDF' }, { status: 500 })
    }
}
