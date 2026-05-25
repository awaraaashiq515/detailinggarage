import { db as prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { sendWelcomeCredentialsEmail } from "@/lib/services/email"

// Types for Insurance Claim Submission
export interface InsuranceClaimInput {
    // Vehicle Details (expanded)
    vehicleMake: string
    vehicleModel: string
    vehicleVariant?: string
    vehicleYear: string
    vehicleType?: string
    fuelType?: string
    transmissionType?: string
    vehicleColor?: string
    registrationNumber: string
    vin?: string
    rcNumber?: string
    registrationDate?: Date
    usageType?: string
    odometerReading?: number
    chassisNumber?: string
    engineNumber?: string

    // Insurance Policy Details (expanded)
    policyNumber: string
    insuranceCompany: string
    policyType?: string
    policyStartDate?: Date
    policyEndDate?: Date
    policyExpiryDate?: Date
    idvValue?: number
    vehicleConditionBefore?: string
    previousAccidentHistory?: string

    // Claim Details (expanded)
    claimType: string
    incidentDate?: Date
    incidentLocation?: string
    incidentDescription?: string
    damageAreas?: string
    estimatedDamage?: number

    // Status & Admin
    status?: string
    adminNotes?: string

    // Client Info (for online claims, auto-filled from session)
    userId?: string

    // For walk-in claims
    customerName?: string
    customerEmail?: string
    customerMobile?: string
    customerCity?: string
    createdByAdminId?: string
    source?: "ONLINE" | "WALK_IN"
}

export interface InsuranceDocumentInput {
    fileName: string
    fileUrl: string
    fileType: "POLICY" | "LICENSE" | "PHOTOS" | "RC_BOOK" | "PAN_CARD" | "AADHAAR" | "DRIVING_LICENSE" | "BANK_PASSBOOK" | "FIR" | "OTHER"
}

// Status options for claims
export const CLAIM_STATUS = {
    SUBMITTED: "SUBMITTED",
    UNDER_REVIEW: "UNDER_REVIEW",
    PENDING_DOCUMENTS: "PENDING_DOCUMENTS",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    COMPLETED: "COMPLETED"
} as const

// Claim types
export const CLAIM_TYPES = [
    "Accident",
    "Theft",
    "Natural Disaster",
    "Third Party",
    "Fire",
    "Vandalism",
    "Other"
] as const

/**
 * Generate unique claim number: CLM-YYYY-XXXXX
 */
export async function generateClaimNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = `CLM-${year}-`

    // Find the last claim of this year
    const lastClaim = await (prisma as any).insuranceClaim.findFirst({
        where: {
            claimNumber: {
                startsWith: prefix
            }
        },
        orderBy: {
            claimNumber: 'desc'
        }
    })

    let nextNumber = 1
    if (lastClaim) {
        const lastNumber = parseInt(lastClaim.claimNumber.replace(prefix, ''), 10)
        nextNumber = lastNumber + 1
    }

    return `${prefix}${nextNumber.toString().padStart(5, '0')}`
}

/**
 * Create a new insurance claim (online client submission)
 */
export async function createInsuranceClaim(
    data: InsuranceClaimInput,
    documents?: InsuranceDocumentInput[]
) {
    const claimNumber = await generateClaimNumber()

    const claim = await (prisma as any).insuranceClaim.create({
        data: {
            claimNumber,
            userId: data.userId!,
            source: "ONLINE",

            // Vehicle Details
            vehicleMake: data.vehicleMake,
            vehicleModel: data.vehicleModel,
            vehicleVariant: data.vehicleVariant,
            vehicleYear: data.vehicleYear,
            vehicleType: data.vehicleType,
            fuelType: data.fuelType,
            transmissionType: data.transmissionType,
            vehicleColor: data.vehicleColor,
            registrationNumber: data.registrationNumber,
            rcNumber: data.rcNumber,
            registrationDate: data.registrationDate || null,
            usageType: data.usageType,
            odometerReading: data.odometerReading,
            chassisNumber: data.chassisNumber,
            engineNumber: data.engineNumber,

            // Insurance Details
            policyNumber: data.policyNumber,
            insuranceCompany: data.insuranceCompany,
            policyType: data.policyType,
            policyStartDate: data.policyStartDate || null,
            policyEndDate: data.policyEndDate || null,
            policyExpiryDate: data.policyExpiryDate || null,
            idvValue: data.idvValue,
            vehicleConditionBefore: data.vehicleConditionBefore,
            previousAccidentHistory: data.previousAccidentHistory,

            // Claim Details
            claimType: data.claimType,
            incidentDate: data.incidentDate || null,
            incidentLocation: data.incidentLocation,
            incidentDescription: data.incidentDescription,
            damageAreas: data.damageAreas,
            estimatedDamage: data.estimatedDamage,

            status: CLAIM_STATUS.SUBMITTED,
            documents: documents && documents.length > 0 ? {
                create: documents.map(doc => ({
                    fileName: doc.fileName,
                    fileUrl: doc.fileUrl,
                    fileType: doc.fileType
                }))
            } : undefined
        },
        include: {
            documents: true,
            user: {
                select: { id: true, name: true, email: true }
            }
        }
    })

    return claim
}

/**
 * Create walk-in claim with optional user auto-creation
 */
export async function createWalkInClaim(
    data: InsuranceClaimInput,
    documents?: InsuranceDocumentInput[]
): Promise<{ claim: any; newUserCreated: boolean; welcomeEmailSent?: boolean }> {
    let finalUserId = data.userId
    let newUserCreated = false
    let welcomeEmailData: { email: string; name: string; password: string } | null = null

    // Transaction for creating user (if needed) and claim
    const result = await prisma.$transaction(async (tx: any) => {
        // If no userId, try to find or create user
        if (!finalUserId && data.customerEmail) {
            // Try to find existing user
            const existingUser = await tx.user.findFirst({
                where: {
                    OR: [
                        { email: data.customerEmail },
                        ...(data.customerMobile ? [{ mobile: data.customerMobile }] : [])
                    ]
                }
            })

            if (existingUser) {
                finalUserId = existingUser.id
            } else {
                // Create new user with auto-generated password
                const password = Math.random().toString(36).slice(-8) + "A1!"
                const hashedPassword = await bcrypt.hash(password, 12)

                const newUser = await tx.user.create({
                    data: {
                        email: data.customerEmail,
                        name: data.customerName || "Walk-in Customer",
                        mobile: data.customerMobile || null,
                        password: hashedPassword,
                        role: "CLIENT",
                        status: "APPROVED",
                        emailVerified: true
                    }
                })

                finalUserId = newUser.id
                newUserCreated = true
                welcomeEmailData = {
                    email: data.customerEmail,
                    name: data.customerName || "Walk-in Customer",
                    password
                }
            }
        }

        if (!finalUserId) {
            throw new Error("User ID or customer email is required")
        }

        // Generate claim number
        const year = new Date().getFullYear()
        const prefix = `CLM-${year}-`
        const lastClaim = await tx.insuranceClaim.findFirst({
            where: { claimNumber: { startsWith: prefix } },
            orderBy: { claimNumber: 'desc' }
        })
        const nextNumber = lastClaim
            ? parseInt(lastClaim.claimNumber.replace(prefix, ''), 10) + 1
            : 1
        const claimNumber = `${prefix}${nextNumber.toString().padStart(5, '0')}`

        // Create the claim with all new fields
        const claim = await tx.insuranceClaim.create({
            data: {
                claimNumber,
                userId: finalUserId,
                source: "WALK_IN",
                createdByAdminId: data.createdByAdminId,
                customerCity: data.customerCity,

                // Vehicle Details (expanded)
                vehicleMake: data.vehicleMake,
                vehicleModel: data.vehicleModel,
                vehicleVariant: data.vehicleVariant,
                vehicleYear: data.vehicleYear,
                vehicleType: data.vehicleType,
                fuelType: data.fuelType,
                transmissionType: data.transmissionType,
                vehicleColor: data.vehicleColor,
                registrationNumber: data.registrationNumber,
                rcNumber: data.rcNumber,
                registrationDate: data.registrationDate || null,
                usageType: data.usageType,
                odometerReading: data.odometerReading,
                chassisNumber: data.chassisNumber,
                engineNumber: data.engineNumber,

                // Insurance Details (expanded)
                policyNumber: data.policyNumber,
                insuranceCompany: data.insuranceCompany,
                policyType: data.policyType,
                policyStartDate: data.policyStartDate || null,
                policyEndDate: data.policyEndDate || null,
                policyExpiryDate: data.policyExpiryDate || null,
                idvValue: data.idvValue,
                vehicleConditionBefore: data.vehicleConditionBefore,
                previousAccidentHistory: data.previousAccidentHistory,

                // Claim Details (expanded)
                claimType: data.claimType,
                incidentDate: data.incidentDate || null,
                incidentLocation: data.incidentLocation,
                incidentDescription: data.incidentDescription,
                damageAreas: data.damageAreas,
                estimatedDamage: data.estimatedDamage,

                // Status & Admin
                status: data.status || CLAIM_STATUS.SUBMITTED,
                adminNotes: data.adminNotes,

                documents: documents && documents.length > 0 ? {
                    create: documents.map(doc => ({
                        fileName: doc.fileName,
                        fileUrl: doc.fileUrl,
                        fileType: doc.fileType
                    }))
                } : undefined
            },
            include: {
                documents: true,
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        })

        return { claim, welcomeEmailData }
    }, { timeout: 15000 })

    // Send welcome email after transaction completes
    let welcomeEmailSent = false
    if (result.welcomeEmailData) {
        try {
            await sendWelcomeCredentialsEmail(
                result.welcomeEmailData.email,
                result.welcomeEmailData.name,
                result.welcomeEmailData.password
            )
            welcomeEmailSent = true
            console.log(`✅ Welcome email sent to ${result.welcomeEmailData.email}`)
        } catch (err) {
            console.error(`❌ Failed to send welcome email:`, err)
        }
    }

    return {
        claim: result.claim,
        newUserCreated,
        welcomeEmailSent
    }
}

/**
 * Get a single insurance claim by ID
 */
export async function getInsuranceClaim(id: string) {
    return await (prisma as any).insuranceClaim.findUnique({
        where: { id },
        include: {
            documents: true,
            user: {
                select: { id: true, name: true, email: true, mobile: true }
            },
            notifications: true
        }
    })
}

/**
 * Get all insurance claims (admin view)
 */
export async function getAllInsuranceClaims(options?: {
    status?: string
    search?: string
    page?: number
    limit?: number
    source?: 'ONLINE' | 'WALK_IN'
}) {
    const where: any = {}

    if (options?.status && options.status !== 'all') {
        where.status = options.status
    }

    if (options?.source) {
        where.source = options.source
    }

    if (options?.search) {
        where.OR = [
            { claimNumber: { contains: options.search } },
            { policyNumber: { contains: options.search } },
            { user: { name: { contains: options.search } } },
            { user: { email: { contains: options.search } } }
        ]
    }

    const claims = await (prisma as any).insuranceClaim.findMany({
        where,
        include: {
            user: {
                select: { id: true, name: true, email: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        skip: options?.page && options?.limit ? (options.page - 1) * options.limit : undefined,
        take: options?.limit
    })

    const total = await (prisma as any).insuranceClaim.count({ where })

    return { claims, total, pagination: { totalPages: Math.ceil(total / (options?.limit || 20)), page: options?.page || 1 } }
}

/**
 * Get claims for a specific user (client view)
 */
export async function getUserInsuranceClaims(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
    source?: 'ONLINE' | 'WALK_IN'
) {
    const skip = (page - 1) * pageSize

    // Build where clause with optional source filter
    const whereClause: any = { userId }
    if (source) {
        whereClause.source = source
    }

    const [claims, total] = await Promise.all([
        (prisma as any).insuranceClaim.findMany({
            where: whereClause,
            include: {
                documents: true
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: pageSize
        }),
        (prisma as any).insuranceClaim.count({
            where: whereClause
        })
    ])

    return {
        claims,
        pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
        }
    }
}

/**
 * Update claim status (admin)
 */
export async function updateClaimStatus(
    claimId: string,
    status: string,
    adminNotes?: string,
    reviewedBy?: string
) {
    const claim = await (prisma as any).insuranceClaim.update({
        where: { id: claimId },
        data: {
            status,
            adminNotes: adminNotes || undefined,
            reviewedBy: reviewedBy || undefined,
            reviewedAt: new Date()
        },
        include: {
            user: {
                select: { id: true, name: true, email: true }
            }
        }
    })

    // Create notification for client
    await (prisma as any).notification.create({
        data: {
            userId: claim.userId,
            type: "INSURANCE_CLAIM",
            title: "Insurance Claim Update",
            message: `Your insurance claim ${claim.claimNumber} status has been updated to: ${status}`,
            link: `/client/insurance-claims/${claimId}`,
            claimId
        }
    })

    return claim
}

/**
 * Update claim with PDF URL after generation
 */
export async function updateClaimPDF(claimId: string, pdfUrl: string) {
    const claim = await (prisma as any).insuranceClaim.update({
        where: { id: claimId },
        data: {
            pdfUrl,
            pdfGeneratedAt: new Date()
        },
        include: {
            user: {
                select: { id: true, name: true, email: true }
            }
        }
    })

    // Create notification for client
    await (prisma as any).notification.create({
        data: {
            userId: claim.userId,
            type: "INSURANCE_CLAIM",
            title: "Insurance Claim Report Ready",
            message: `Your insurance claim report for ${claim.claimNumber} is now ready to view.`,
            link: `/client/insurance-claims/${claimId}`,
            claimId
        }
    })

    return claim
}

/**
 * Get dashboard stats for admin
 */
export async function getInsuranceClaimStats() {
    const [total, submitted, underReview, approved, rejected] = await Promise.all([
        (prisma as any).insuranceClaim.count(),
        (prisma as any).insuranceClaim.count({ where: { status: "SUBMITTED" } }),
        (prisma as any).insuranceClaim.count({ where: { status: "UNDER_REVIEW" } }),
        (prisma as any).insuranceClaim.count({ where: { status: "APPROVED" } }),
        (prisma as any).insuranceClaim.count({ where: { status: "REJECTED" } })
    ])

    // Get total estimated damage
    const damageResult = await (prisma as any).insuranceClaim.aggregate({
        _sum: { estimatedDamage: true }
    })

    return {
        total,
        submitted,
        underReview,
        approved,
        rejected,
        pending: submitted + underReview,
        totalDamage: damageResult._sum.estimatedDamage || 0
    }
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId: string, unreadOnly = false, limit = 50) {
    const where: any = { userId }
    if (unreadOnly) {
        where.isRead = false
    }

    return await (prisma as any).notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit
    })
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
    return await (prisma as any).notification.update({
        where: { id: notificationId },
        data: { isRead: true }
    })
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
    return await (prisma as any).notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
    })
}

/**
 * Add documents to existing claim
 */
export async function addClaimDocuments(claimId: string, documents: InsuranceDocumentInput[]) {
    const createdDocs = await (prisma as any).insuranceDocument.createMany({
        data: documents.map(doc => ({
            claimId,
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            fileType: doc.fileType
        }))
    })

    return createdDocs
}
