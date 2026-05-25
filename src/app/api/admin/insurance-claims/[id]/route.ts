import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/jwt'
import { getInsuranceClaim, updateClaimStatus, addClaimDocuments } from '@/services/insurance-service'
import { sendInsuranceClaimStatusEmail } from '@/lib/services/email'

type RouteParams = Promise<{ id: string }>

/**
 * GET - Get a specific insurance claim detail (admin)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: RouteParams }
) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const claim = await getInsuranceClaim(id)

        if (!claim) {
            return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
        }

        return NextResponse.json(claim)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to fetch claim' }, { status: 500 })
    }
}

/**
 * PATCH - Update insurance claim status (admin only)
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: RouteParams }
) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()

        const { status, adminNotes, documents } = body

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 })
        }

        // Update claim status
        const claim = await updateClaimStatus(id, status, adminNotes, user.userId)

        // Add documents if provided
        if (documents && documents.length > 0) {
            await addClaimDocuments(id, documents)
        }

        // Send email notification to client
        if (claim.user?.email) {
            await sendInsuranceClaimStatusEmail(
                claim.user.email,
                claim.user.name,
                claim.claimNumber,
                status,
                adminNotes
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Claim status updated successfully',
            claim
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to update claim' }, { status: 500 })
    }
}

/**
 * PUT - Full update of insurance claim (admin only)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: RouteParams }
) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()


        // Import prisma directly for full updates
        const { db } = await import('@/lib/db')

        // Get the current claim to check for changes
        const currentClaim = await db.insuranceClaim.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, name: true, email: true, mobile: true }
                }
            }
        })

        if (!currentClaim) {
            return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
        }

        // Build update data
        const updateData: any = {}

        // Vehicle fields
        if (body.vehicleMake) updateData.vehicleMake = body.vehicleMake
        if (body.vehicleModel) updateData.vehicleModel = body.vehicleModel
        if (body.vehicleVariant !== undefined) updateData.vehicleVariant = body.vehicleVariant || null
        if (body.vehicleYear) updateData.vehicleYear = body.vehicleYear
        if (body.vehicleType !== undefined) updateData.vehicleType = body.vehicleType || null
        if (body.fuelType !== undefined) updateData.fuelType = body.fuelType || null
        if (body.transmissionType !== undefined) updateData.transmissionType = body.transmissionType || null
        if (body.vehicleColor !== undefined) updateData.vehicleColor = body.vehicleColor || null
        if (body.registrationNumber) updateData.registrationNumber = body.registrationNumber
        if (body.rcNumber !== undefined) updateData.rcNumber = body.rcNumber || null
        if (body.registrationDate !== undefined) updateData.registrationDate = body.registrationDate ? new Date(body.registrationDate) : null
        if (body.usageType !== undefined) updateData.usageType = body.usageType || null
        if (body.odometerReading !== undefined) updateData.odometerReading = body.odometerReading || null
        if (body.chassisNumber !== undefined) updateData.chassisNumber = body.chassisNumber || null
        if (body.engineNumber !== undefined) updateData.engineNumber = body.engineNumber || null

        // Insurance fields
        if (body.insuranceCompany) updateData.insuranceCompany = body.insuranceCompany
        if (body.policyNumber) updateData.policyNumber = body.policyNumber
        if (body.policyExpiryDate !== undefined) updateData.policyExpiryDate = body.policyExpiryDate ? new Date(body.policyExpiryDate) : null

        // Job / Part fields
        if (body.invoiceNumber !== undefined) updateData.invoiceNumber = body.invoiceNumber || null

        if (body.claimType) updateData.claimType = body.claimType
        if (body.estimatedDamage !== undefined) updateData.estimatedDamage = body.estimatedDamage || null
        if (body.idvValue !== undefined) updateData.idvValue = body.idvValue || null
        if (body.status) updateData.status = body.status
        if (body.vehicleConditionBefore !== undefined) updateData.vehicleConditionBefore = body.vehicleConditionBefore || null
        if (body.previousAccidentHistory !== undefined) updateData.previousAccidentHistory = body.previousAccidentHistory || null

        // Incident fields
        if (body.damageAreas !== undefined) updateData.damageAreas = body.damageAreas || null
        if (body.incidentDescription !== undefined) updateData.incidentDescription = body.incidentDescription || null

        const locationChanged = body.incidentLocation !== undefined && body.incidentLocation !== currentClaim.incidentLocation
        const dateChanged = body.incidentDate !== undefined &&
            (body.incidentDate ? new Date(body.incidentDate).getTime() : 0) !== (currentClaim.incidentDate ? currentClaim.incidentDate.getTime() : 0)

        // Assign fields
        if (body.incidentDate !== undefined) updateData.incidentDate = body.incidentDate ? new Date(body.incidentDate) : null
        if (body.incidentLocation !== undefined) {
            updateData.incidentLocation = body.incidentLocation || null

        }

        // If location or date changes, invalidate the old PDF so it must be regenerated
        if (locationChanged || dateChanged) {

            updateData.pdfUrl = null
            updateData.pdfGeneratedAt = null
        }

        updateData.updatedAt = new Date()

        const updatedClaim = await db.insuranceClaim.update({
            where: { id },
            data: updateData,
            include: {
                user: {
                    select: { id: true, name: true, email: true, mobile: true }
                },
                documents: true
            }
        })

        // Send notification if status changed or admin message added
        const statusChanged = body.status && body.status !== currentClaim.status
        const messageAdded = body.adminMessage && body.adminMessage !== (currentClaim as any).adminMessage

        if ((statusChanged || messageAdded) && currentClaim.user?.email) {
            // Create notification in database
            await db.notification.create({
                data: {
                    userId: currentClaim.user.id,
                    type: "INSURANCE_CLAIM",
                    title: statusChanged ? "Insurance Claim Status Update" : "New Message from Admin",
                    message: body.adminMessage || `Your insurance claim ${currentClaim.claimNumber} status has been updated to: ${body.status}`,
                    link: `/client/insurance-claims/${id}`,
                    claimId: id
                }
            })

            // Send email notification
            try {
                await sendInsuranceClaimStatusEmail(
                    currentClaim.user.email,
                    currentClaim.user.name,
                    currentClaim.claimNumber,
                    body.status || currentClaim.status,
                    body.adminMessage || body.adminNotes
                )
            } catch (emailError) {
                console.error('Failed to send email notification:', emailError)
                // Don't fail the request if email fails
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Claim updated successfully',
            claim: updatedClaim
        })
    } catch (error: any) {
        console.error('Error updating insurance claim:', error)
        return NextResponse.json({ error: error.message || 'Failed to update claim' }, { status: 500 })
    }
}

