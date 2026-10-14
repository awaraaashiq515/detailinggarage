import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/jwt'
import { db } from '@/lib/db'
import {
    createWalkInClaim,
    getAllInsuranceClaims,
    getInsuranceClaimStats,
    InsuranceClaimInput,
    InsuranceDocumentInput
} from '@/services/insurance-service'

/**
 * POST - Create a walk-in insurance claim (admin or permitted shop owner)
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        let shopId: string | null = null
        if (user.role === 'SHOP_OWNER') {
            const shop = await db.shop.findUnique({ where: { ownerUserId: user.userId } })
            if (!shop || !shop.hasInsuranceAccess) {
                return NextResponse.json({ error: 'Insurance module is not enabled for your workshop' }, { status: 403 })
            }
            shopId = shop.id
        } else if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized - Access denied' }, { status: 401 })
        }

        const body = await request.json()

        if (!shopId && body.shopId) {
            shopId = body.shopId
        }

        // Prepare claim input with all new fields
        const claimInput: InsuranceClaimInput = {
            // For walk-in, we get customer details from body
            customerName: body.customerName,
            customerEmail: body.customerEmail,
            customerMobile: body.customerMobile,
            customerCity: body.customerCity,
            userId: body.userId, // If linking to existing user
            createdByAdminId: user.userId,
            shopId,

            // Vehicle Details (expanded)
            vehicleMake: body.vehicleMake,
            vehicleModel: body.vehicleModel,
            vehicleVariant: body.vehicleVariant,
            vehicleYear: body.vehicleYear,
            vehicleType: body.vehicleType,
            fuelType: body.fuelType,
            transmissionType: body.transmissionType,
            vehicleColor: body.vehicleColor,
            registrationNumber: body.registrationNumber,
            vin: body.vin,
            rcNumber: body.rcNumber,
            registrationDate: body.registrationDate ? new Date(body.registrationDate) : undefined,
            usageType: body.usageType,
            odometerReading: body.odometerReading ? parseInt(body.odometerReading) : undefined,
            chassisNumber: body.chassisNumber,
            engineNumber: body.engineNumber,

            // EV Details
            isEv: body.isEv === true || body.isEv === 'true' || body.fuelType === 'Electric',
            batteryCapacity: body.batteryCapacity,
            batterySerialNumber: body.batterySerialNumber,
            batteryHealthSoH: body.batteryHealthSoH,
            motorNumber: body.motorNumber,
            chargerType: body.chargerType,
            chargerSerialNumber: body.chargerSerialNumber,
            evSpecificCover: body.evSpecificCover ? (typeof body.evSpecificCover === 'string' ? body.evSpecificCover : JSON.stringify(body.evSpecificCover)) : undefined,

            // Insurance Details (expanded)
            policyNumber: body.policyNumber,
            insuranceCompany: body.insuranceCompany,
            policyType: body.policyType,
            policyStartDate: body.policyStartDate ? new Date(body.policyStartDate) : undefined,
            policyEndDate: body.policyEndDate ? new Date(body.policyEndDate) : undefined,
            policyExpiryDate: body.policyExpiryDate ? new Date(body.policyExpiryDate) : undefined,
            idvValue: body.idvValue ? parseFloat(body.idvValue) : undefined,
            vehicleConditionBefore: body.vehicleConditionBefore,
            previousAccidentHistory: body.previousAccidentHistory,

            // Claim/Incident Details
            claimType: body.claimType,
            incidentDate: body.incidentDate ? new Date(body.incidentDate) : undefined,
            incidentLocation: body.incidentLocation,
            incidentDescription: body.damageDescription || body.incidentDescription,
            damageAreas: body.damageAreas ? JSON.stringify(body.damageAreas) : undefined,
            estimatedDamage: body.estimatedDamage || body.estimatedClaimAmount ? parseFloat(body.estimatedDamage || body.estimatedClaimAmount) : undefined,

            // Status
            status: body.status || 'SUBMITTED',
            adminNotes: body.adminNotes
        }

        // Prepare documents if provided
        const documents: InsuranceDocumentInput[] = body.documents?.map((doc: any) => ({
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            fileType: doc.fileType
        })) || []

        const result = await createWalkInClaim(claimInput, documents)

        return NextResponse.json({
            success: true,
            message: result.newUserCreated
                ? 'Claim created. New customer account created and welcome email sent.'
                : 'Claim created for existing customer.',
            claim: result.claim,
            newUserCreated: result.newUserCreated,
            welcomeEmailSent: result.welcomeEmailSent
        }, { status: 201 })
    } catch (error: any) {
        console.error('Error creating walk-in insurance claim:', error)
        return NextResponse.json({ error: error.message || 'Failed to create claim' }, { status: 500 })
    }
}

/**
 * GET - Get all insurance claims with filters (admin or permitted shop owner)
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { searchParams } = new URL(request.url)
        let targetShopId: string | undefined = undefined
        if (user.role === 'SHOP_OWNER') {
            const shop = await db.shop.findUnique({ where: { ownerUserId: user.userId } })
            if (!shop || !shop.hasInsuranceAccess) {
                return NextResponse.json({ error: 'Insurance module is not enabled for your workshop' }, { status: 403 })
            }
            targetShopId = shop.id
        } else if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            const requestedShopId = searchParams.get('shopId')
            if (requestedShopId && requestedShopId !== 'all') {
                targetShopId = requestedShopId
            } else if (searchParams.get('shopPortal') === 'true' || request.headers.get('referer')?.includes('/shop/billing')) {
                const defaultShop = await db.shop.findFirst({ where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } })
                targetShopId = defaultShop ? defaultShop.id : 'unassigned'
            }
        } else {
            return NextResponse.json({ error: 'Unauthorized - Access denied' }, { status: 401 })
        }

        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '20')
        const status = searchParams.get('status') || undefined
        const search = searchParams.get('search') || undefined
        const source = searchParams.get('source') as 'ONLINE' | 'WALK_IN' | undefined
        const statsOnly = searchParams.get('statsOnly') === 'true'
        const isEvParam = searchParams.get('isEv')
        const isEv = isEvParam === 'true' ? true : isEvParam === 'false' ? false : undefined

        // If only stats requested
        if (statsOnly) {
            const stats = await getInsuranceClaimStats({ shopId: targetShopId })
            return NextResponse.json(stats)
        }

        const result = await getAllInsuranceClaims({
            page,
            limit: pageSize,
            status,
            search,
            source,
            shopId: targetShopId,
            isEv
        })

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Error fetching insurance claims:', error)
        return NextResponse.json({ error: error.message || 'Failed to fetch claims' }, { status: 500 })
    }
}
