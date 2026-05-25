import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/jwt'
import { createInsuranceClaim, getUserInsuranceClaims, InsuranceClaimInput, InsuranceDocumentInput } from '@/services/insurance-service'
import { sendInsuranceClaimAdminNotification } from '@/lib/services/email'

/**
 * POST - Submit a new insurance claim (client)
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // Prepare claim input
        const claimInput: InsuranceClaimInput = {
            userId: user.userId,
            vehicleMake: body.vehicleMake,
            vehicleModel: body.vehicleModel,
            vehicleYear: body.vehicleYear,
            vehicleColor: body.vehicleColor,
            registrationNumber: body.registrationNumber,
            vin: body.vin,
            engineNumber: body.engineNumber,
            policyNumber: body.policyNumber,
            insuranceCompany: body.insuranceCompany,
            policyType: body.policyType,
            policyStartDate: body.policyStartDate ? new Date(body.policyStartDate) : undefined,
            policyEndDate: body.policyEndDate ? new Date(body.policyEndDate) : undefined,
            claimType: body.claimType,
            incidentDate: new Date(body.incidentDate),
            incidentLocation: body.incidentLocation,
            incidentDescription: body.incidentDescription,
            estimatedDamage: body.estimatedDamage ? parseFloat(body.estimatedDamage) : undefined
        }

        // Prepare documents if provided
        const documents: InsuranceDocumentInput[] = body.documents?.map((doc: any) => ({
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            fileType: doc.fileType
        })) || []

        const claim = await createInsuranceClaim(claimInput, documents)

        // Send notification to admins
        await sendInsuranceClaimAdminNotification(claim, {
            name: user.name,
            email: user.email
        })

        return NextResponse.json({
            success: true,
            message: 'Insurance claim submitted successfully',
            claim
        }, { status: 201 })
    } catch (error: any) {
        console.error('Error creating insurance claim:', error)
        return NextResponse.json({ error: error.message || 'Failed to create claim' }, { status: 500 })
    }
}

/**
 * GET - Get user's insurance claims (client)
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '10')
        const source = searchParams.get('source') as 'ONLINE' | 'WALK_IN' | null

        const result = await getUserInsuranceClaims(user.userId, page, pageSize, source || undefined)

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Error fetching insurance claims:', error)
        return NextResponse.json({ error: error.message || 'Failed to fetch claims' }, { status: 500 })
    }
}
