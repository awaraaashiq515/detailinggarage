import { renderToBuffer } from '@react-pdf/renderer'
import { db as prisma } from '@/lib/db'
import { InsuranceClaimTemplate, InsuranceClaimPDFData } from '../templates/insurance-claim-template'
import { writeFileSync, mkdirSync, readFileSync } from 'fs'
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

        // 3. Prepare PDF data
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
                registrationDate: claim.registrationDate?.toISOString(),
                usageType: claim.usageType,
                odometerReading: claim.odometerReading,
                chassisNumber: claim.chassisNumber,
                engineNumber: claim.engineNumber,

                // Insurance Details
                policyNumber: claim.policyNumber,
                insuranceCompany: claim.insuranceCompany,
                policyType: claim.policyType,
                policyStartDate: claim.policyStartDate?.toISOString(),
                policyEndDate: claim.policyEndDate?.toISOString(),
                policyExpiryDate: claim.policyExpiryDate?.toISOString(),
                idvValue: claim.idvValue,
                vehicleConditionBefore: claim.vehicleConditionBefore,
                previousAccidentHistory: claim.previousAccidentHistory,

                // Claim Details
                claimType: claim.claimType,
                incidentDate: claim.incidentDate?.toISOString() || '',
                incidentLocation: claim.incidentLocation,
                incidentDescription: claim.incidentDescription,
                damageAreas: claim.damageAreas,
                estimatedDamage: claim.estimatedDamage,

                // Customer Details
                customerCity: claim.customerCity,

                // Admin
                adminNotes: claim.adminNotes,
                reviewedBy: claim.reviewedBy,
                reviewedAt: claim.reviewedAt?.toISOString(),
                showWatermark: watermarkEnabled,

                // Job Details
                invoiceNumber: claim.invoiceNumber
            },
            customer: {
                name: claim.user.name,
                email: claim.user.email,
                mobile: claim.user.mobile
            },
            documents: claim.documents.map((doc: any) => {
                // Convert image to base64 data URI for PDF embedding
                try {
                    // Important: decode the URL in case it has %20 (spaces) or other encoded characters
                    const decodedUrl = decodeURIComponent(doc.fileUrl)
                    const absolutePath = join(process.cwd(), 'public', decodedUrl)

                    const imageBuffer = readFileSync(absolutePath)
                    const base64 = imageBuffer.toString('base64')

                    const ext = doc.fileName.split('.').pop()?.toLowerCase()
                    let mimeType = 'image/jpeg'
                    if (ext === 'png') mimeType = 'image/png'
                    if (ext === 'webp') mimeType = 'image/webp' // React-PDF might not support webp fully, but added for safety

                    const base64DataUri = `data:${mimeType};base64,${base64}`

                    return {
                        fileName: doc.fileName,
                        fileType: doc.fileType,
                        fileUrl: base64DataUri,
                        uploadedAt: doc.createdAt?.toISOString()  // pass upload timestamp for caption
                    }
                } catch (error) {
                    console.error(`Failed to load document image [${doc.fileName} / ${doc.fileUrl}]:`, error)
                    return {
                        fileName: doc.fileName,
                        fileType: doc.fileType,
                        // Provide an empty/transparent 1x1 base64 GIF as a fallback so layout doesn't break, or leave empty
                        fileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
                        uploadedAt: doc.createdAt?.toISOString()
                    }
                }
            })
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
