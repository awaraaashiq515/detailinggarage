import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/jwt'
import { getInsuranceClaim } from '@/services/insurance-service'
import { generateInsuranceClaimPDF } from '@/services/insurance/pdf/generator/insurance-pdf-generator'
import { sendInsuranceClaimPDFEmail } from '@/lib/services/email'

type RouteParams = Promise<{ id: string }>

/**
 * POST - Generate PDF for an insurance claim (admin only)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: RouteParams }
) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
        }

        const { id } = await params

        // Check if claim exists
        const claim = await getInsuranceClaim(id)
        if (!claim) {
            return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
        }

        // Generate PDF
        const pdfUrl = await generateInsuranceClaimPDF(id)

        // Send email notification to client
        if (claim.user?.email) {
            const vehicleInfo = `${claim.vehicleMake} ${claim.vehicleModel}`
            await sendInsuranceClaimPDFEmail(
                claim.user.email,
                claim.user.name,
                claim.claimNumber,
                vehicleInfo,
                id
            )
        }

        return NextResponse.json({
            success: true,
            message: 'PDF generated successfully and client notified',
            pdfUrl
        })
    } catch (error: any) {
        console.error('Error generating insurance claim PDF:', error)
        return NextResponse.json({ error: error.message || 'Failed to generate PDF' }, { status: 500 })
    }
}
