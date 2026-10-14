import { renderToBuffer } from '@react-pdf/renderer'
import { db as prisma } from '@/lib/db'
import { InsuranceClaimTemplate, InsuranceClaimPDFData } from '../templates/insurance-claim-template'
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Generate PDF for an insurance claim
 * @param claimId - The ID of the insurance claim
 * @returns The URL path to the generated PDF
 */
export async function generateInsuranceClaimPDF(claimId: string): Promise<string> {
    try {
        // 1. Fetch the claim data with all related info
        const claim = await (prisma as any).insuranceClaim.findUnique({
            where: { id: claimId },
            include: {
                documents: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        mobile: true
                    }
                }
            }
        })

        if (!claim) {
            throw new Error('Insurance claim not found')
        }

        // 2. Fetch system settings for watermark
        const settings = await (prisma as any).systemSettings.findFirst()
        const watermarkEnabled = settings?.imageWatermarkEnabled ?? true

        // 3. Map documents with sharp image optimization for React-PDF
        const processedDocuments = await Promise.all((claim.documents || []).map(async (doc: any) => {
            try {
                const decodedUrl = decodeURIComponent(doc.fileUrl)
                const relativePath = decodedUrl.startsWith('/') ? decodedUrl.slice(1) : decodedUrl
                const absolutePath = join(process.cwd(), 'public', relativePath)

                if (!existsSync(absolutePath)) {
                    console.warn(`[PDF Generator] File not found on disk: ${absolutePath}`)
                    return null
                }

                const isPdf = doc.fileName?.toLowerCase().endsWith('.pdf') || doc.fileType === 'application/pdf'
                const uploadedAt = doc.uploadedAt
                    ? (doc.uploadedAt instanceof Date ? doc.uploadedAt.toISOString() : new Date(doc.uploadedAt).toISOString())
                    : (doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString())

                if (isPdf) {
                    return {
                        fileName: doc.fileName,
                        fileType: doc.fileType,
                        fileUrl: '',
                        isPdf: true,
                        uploadedAt
                    }
                }

                const imageBuffer = readFileSync(absolutePath)
                const sharp = (await import('sharp')).default
                const jpegBuffer = await sharp(imageBuffer)
                    .rotate()
                    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 85 })
                    .toBuffer()

                const base64 = jpegBuffer.toString('base64')
                const base64DataUri = `data:image/jpeg;base64,${base64}`

                return {
                    fileName: doc.fileName,
                    fileType: doc.fileType,
                    fileUrl: base64DataUri,
                    isPdf: false,
                    uploadedAt
                }
            } catch (error) {
                console.error(`[PDF Generator] Error processing document [${doc.fileName} / ${doc.fileUrl}]:`, error)
                return null
            }
        }))

        const reportData: InsuranceClaimPDFData = {
            claim: {
                claimNumber: claim.claimNumber,
                createdAt: claim.createdAt.toISOString(),
                status: claim.status,
                source: claim.source,

                // Vehicle Details
                vehicleMake: claim.vehicleMake,
                vehicleModel: claim.vehicleModel,
                vehicleVariant: claim.vehicleVariant,
                vehicleYear: claim.vehicleYear,
                vehicleType: claim.vehicleType,
                fuelType: claim.fuelType,
                transmissionType: claim.transmissionType,
                vehicleColor: claim.vehicleColor,
                registrationNumber: claim.registrationNumber,
                rcNumber: claim.rcNumber,
                registrationDate: claim.registrationDate ? claim.registrationDate.toISOString() : undefined,
                usageType: claim.usageType,
                odometerReading: claim.odometerReading,
                chassisNumber: claim.chassisNumber,
                engineNumber: claim.engineNumber,

                // EV Details
                isEv: Boolean(claim.isEv || claim.fuelType === 'Electric'),
                batteryCapacity: claim.batteryCapacity,
                batterySerialNumber: claim.batterySerialNumber,
                batteryHealthSoH: claim.batteryHealthSoH,
                motorNumber: claim.motorNumber,
                chargerType: claim.chargerType,
                chargerSerialNumber: claim.chargerSerialNumber,
                evSpecificCover: claim.evSpecificCover,

                // Insurance Details
                policyNumber: claim.policyNumber,
                insuranceCompany: claim.insuranceCompany,
                policyType: claim.policyType,
                policyStartDate: claim.policyStartDate ? claim.policyStartDate.toISOString() : undefined,
                policyEndDate: claim.policyEndDate ? claim.policyEndDate.toISOString() : undefined,
                policyExpiryDate: claim.policyExpiryDate ? claim.policyExpiryDate.toISOString() : undefined,
                idvValue: claim.idvValue,
                vehicleConditionBefore: claim.vehicleConditionBefore,
                previousAccidentHistory: claim.previousAccidentHistory,

                // Incident Details
                claimType: claim.claimType,
                incidentDate: claim.incidentDate ? claim.incidentDate.toISOString() : (claim.createdAt ? claim.createdAt.toISOString() : new Date().toISOString()),
                incidentLocation: claim.incidentLocation,
                incidentDescription: claim.incidentDescription,
                damageAreas: claim.damageAreas,
                estimatedDamage: claim.estimatedDamage,

                // Customer Details (for walk-in)
                customerCity: claim.customerCity,

                // Admin
                adminNotes: claim.adminNotes,
                reviewedBy: claim.reviewedBy,
                reviewedAt: claim.reviewedAt ? claim.reviewedAt.toISOString() : undefined,
                showWatermark: watermarkEnabled,

                // Job Details
                invoiceNumber: claim.invoiceNumber
            },
            customer: {
                name: claim.user.name,
                email: claim.user.email,
                mobile: claim.user.mobile
            },
            documents: (processedDocuments.filter(Boolean) as any[])
        }

        // 3. Generate PDF using react-pdf
        const pdfDocument = InsuranceClaimTemplate({ data: reportData })
        const pdfBuffer = await renderToBuffer(pdfDocument)

        // 4. Save PDF to public/uploads/insurance/reports/{date}/ directory
        const dateStr = new Date().toISOString().split('T')[0]
        const reportsDir = join(process.cwd(), 'public', 'uploads', 'insurance', 'reports', dateStr)

        // Create directory if it doesn't exist
        try {
            mkdirSync(reportsDir, { recursive: true })
        } catch (e) {
            // Directory already exists
        }

        // Format filename as {ClaimNumber}-{Make}-{Model}.pdf
        const filename = `${claim.claimNumber}-${claim.vehicleMake}-${claim.vehicleModel}.pdf`
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/[^a-zA-Z0-9\-_.]/g, '') // Remove invalid chars
        const filepath = join(reportsDir, filename)

        writeFileSync(filepath, pdfBuffer)

        // 5. Update claim record with PDF URL
        const pdfUrl = `/uploads/insurance/reports/${dateStr}/${filename}`
        await (prisma as any).insuranceClaim.update({
            where: { id: claimId },
            data: {
                pdfUrl,
                pdfGeneratedAt: new Date()
            }
        })

        // 6. Create notification for client
        await (prisma as any).notification.create({
            data: {
                userId: claim.userId,
                type: "INSURANCE_CLAIM",
                title: "Insurance Claim Report Ready",
                message: `Your insurance claim report for ${claim.claimNumber} is now ready to download.`,
                link: `/client/insurance-claims/${claimId}`,
                claimId
            }
        })

        console.log(`✅ Insurance claim PDF generated: ${pdfUrl}`)
        return pdfUrl
    } catch (error) {
        console.error('Error generating insurance claim PDF:', error)
        throw new Error(`Failed to generate PDF: ${error}`)
    }
}

/**
 * Check if PDF exists for a claim
 */
export async function hasInsuranceClaimPDF(claimId: string): Promise<boolean> {
    const claim = await (prisma as any).insuranceClaim.findUnique({
        where: { id: claimId },
        select: { pdfUrl: true }
    })

    return !!claim?.pdfUrl
}
