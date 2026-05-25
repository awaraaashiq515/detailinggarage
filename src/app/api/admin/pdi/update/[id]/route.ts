import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/jwt'

/**
 * PUT /api/admin/pdi/update/[id]
 * Updates an existing PDI inspection
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // Check if inspection exists
        const existingInspection = await db.pDIInspection.findUnique({
            where: { id },
            include: { responses: true, leakageResponses: true }
        })

        if (!existingInspection) {
            return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
        }

        const body = await request.json()
        const {
            customerName,
            customerPhone,
            customerEmail,
            vehicleMake,
            vehicleModel,
            vehicleColor,
            vehicleYear,
            engineNumber,
            vin,
            odometer,
            inspectedBy,
            adminComments,
            inspectionDate,
            responses,
            leakageResponses,
            vehicleDamageData
        } = body

        // Update the inspection
        const updatedInspection = await db.pDIInspection.update({
            where: { id },
            data: {
                customerName,
                customerPhone,
                customerEmail: customerEmail || null,
                vehicleMake,
                vehicleModel,
                vehicleColor,
                vehicleYear,
                engineNumber,
                vin,
                odometer,
                inspectedBy,
                adminComments: adminComments || null,
                inspectionDate: inspectionDate ? new Date(inspectionDate) : undefined,
                vehicleDamageData: vehicleDamageData || null,
            }
        })

        // Update responses - delete existing and recreate
        if (responses && Array.isArray(responses)) {
            // Delete existing responses
            await db.pDIResponse.deleteMany({
                where: { inspectionId: id }
            })

            // Create new responses
            for (const resp of responses) {
                await db.pDIResponse.create({
                    data: {
                        inspectionId: id,
                        itemId: resp.itemId,
                        status: resp.status,
                        notes: resp.notes || null
                    }
                })
            }
        }

        // Update leakage responses
        if (leakageResponses && Array.isArray(leakageResponses)) {
            // Delete existing
            await db.pDILeakageResponse.deleteMany({
                where: { inspectionId: id }
            })

            // Create new
            for (const resp of leakageResponses) {
                await db.pDILeakageResponse.create({
                    data: {
                        inspectionId: id,
                        leakageItemId: resp.leakageItemId,
                        found: resp.found,
                        notes: resp.notes || null
                    }
                })
            }
        }

        return NextResponse.json({
            success: true,
            id: updatedInspection.id,
            message: 'Inspection updated successfully'
        })

    } catch (error: any) {
        console.error('Error updating PDI inspection:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update inspection' },
            { status: 500 }
        )
    }
}
