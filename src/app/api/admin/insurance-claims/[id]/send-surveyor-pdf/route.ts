import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/jwt'
import { db } from '@/lib/db'
import { getInsuranceClaim } from '@/services/insurance-service'
import { generateInsuranceClaimPDF } from '@/services/insurance/pdf/generator/insurance-pdf-generator'
import { sendSurveyorInsurancePDFEmail } from '@/lib/services/email'
import { join } from 'path'
import { existsSync } from 'fs'

type RouteParams = Promise<{ id: string }>

async function checkInsuranceAuth(user: any) {
    if (!user) return false
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return true
    if (user.role === 'SHOP_OWNER') {
        const shop = await db.shop.findUnique({ where: { ownerUserId: user.userId } })
        return Boolean(shop?.hasInsuranceAccess)
    }
    return false
}

/**
 * POST - Email Claim Assessment PDF directly to Insurance Surveyor
 */
export async function POST(
    request: NextRequest,
    { params }: { params: RouteParams }
) {
    try {
        const user = await getCurrentUser()
        if (!user || !await checkInsuranceAuth(user)) {
            return NextResponse.json({ error: 'Unauthorized - Access denied' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json().catch(() => ({}))

        const {
            surveyorEmail,
            surveyorName,
            surveyorPhone,
            surveyorCompany,
            surveyorNotes,
            customMessage,
            includeDocuments = true
        } = body

        if (!surveyorEmail || typeof surveyorEmail !== 'string' || !surveyorEmail.includes('@')) {
            return NextResponse.json({ error: 'Valid surveyor email address is required' }, { status: 400 })
        }

        // Fetch claim
        const claim = await getInsuranceClaim(id)
        if (!claim) {
            return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
        }

        // Shop owner isolation check
        if (user.role === 'SHOP_OWNER' && claim.shopId) {
            const shop = await db.shop.findUnique({ where: { ownerUserId: user.userId } })
            if (claim.shopId !== shop?.id) {
                return NextResponse.json({ error: 'Access denied to this claim' }, { status: 403 })
            }
        }

        // 1. Ensure PDF is generated and exists on disk
        let currentPdfUrl = claim.pdfUrl
        let pdfDiskPath = currentPdfUrl ? join(process.cwd(), 'public', currentPdfUrl.startsWith('/') ? currentPdfUrl.slice(1) : currentPdfUrl) : ''

        if (!currentPdfUrl || !existsSync(pdfDiskPath)) {
            console.log(`[Surveyor PDF] Generating new PDF for claim ${claim.claimNumber}...`)
            currentPdfUrl = await generateInsuranceClaimPDF(id)
            pdfDiskPath = join(process.cwd(), 'public', currentPdfUrl.startsWith('/') ? currentPdfUrl.slice(1) : currentPdfUrl)
        }

        if (!existsSync(pdfDiskPath)) {
            return NextResponse.json({ error: 'Failed to generate or locate PDF report on disk' }, { status: 500 })
        }

        // 2. Prepare attachments list
        const cleanClaimNum = claim.claimNumber.replace(/[^a-zA-Z0-9_-]/g, '_')
        const attachments: Array<{ filename: string; path?: string; contentType?: string }> = [
            {
                filename: `Claim_${cleanClaimNum}_Assessment_Report.pdf`,
                path: pdfDiskPath,
                contentType: 'application/pdf'
            }
        ]

        // 3. Attach additional uploaded PDF documents if requested
        if (includeDocuments && Array.isArray(claim.documents)) {
            for (const doc of claim.documents) {
                try {
                    const isPdf = doc.fileName?.toLowerCase().endsWith('.pdf') || doc.fileType === 'application/pdf'
                    if (isPdf && doc.fileUrl) {
                        const decodedUrl = decodeURIComponent(doc.fileUrl)
                        const relPath = decodedUrl.startsWith('/') ? decodedUrl.slice(1) : decodedUrl
                        const absDocPath = join(process.cwd(), 'public', relPath)

                        if (existsSync(absDocPath)) {
                            attachments.push({
                                filename: doc.fileName || `Document_${doc.id}.pdf`,
                                path: absDocPath,
                                contentType: 'application/pdf'
                            })
                        }
                    }
                } catch (docErr) {
                    console.warn(`[Surveyor PDF] Could not attach doc ${doc.fileName}:`, docErr)
                }
            }
        }

        // 4. Save surveyor details to database first
        try {
            await db.insuranceClaim.update({
                where: { id },
                data: {
                    surveyorEmail: surveyorEmail.trim(),
                    surveyorName: surveyorName !== undefined ? (surveyorName?.trim() || null) : claim.surveyorName,
                    surveyorPhone: surveyorPhone !== undefined ? (surveyorPhone?.trim() || null) : claim.surveyorPhone,
                    surveyorCompany: surveyorCompany !== undefined ? (surveyorCompany?.trim() || null) : claim.surveyorCompany,
                    surveyorNotes: surveyorNotes !== undefined ? (surveyorNotes?.trim() || null) : claim.surveyorNotes,
                }
            })
        } catch (updateErr: any) {
            console.warn('[Surveyor PDF] Prisma typed update fallback to raw SQL:', updateErr.message)
            await db.$executeRawUnsafe(
                `UPDATE InsuranceClaim SET surveyorEmail = ?, surveyorName = ?, surveyorPhone = ?, surveyorCompany = ?, surveyorNotes = ? WHERE id = ?`,
                surveyorEmail.trim(),
                surveyorName !== undefined ? (surveyorName?.trim() || null) : claim.surveyorName,
                surveyorPhone !== undefined ? (surveyorPhone?.trim() || null) : claim.surveyorPhone,
                surveyorCompany !== undefined ? (surveyorCompany?.trim() || null) : claim.surveyorCompany,
                surveyorNotes !== undefined ? (surveyorNotes?.trim() || null) : claim.surveyorNotes,
                id
            )
        }

        // 5. Send email to surveyor
        const workshopName = claim.shop?.name || 'Detailing Garage Studio'

        await sendSurveyorInsurancePDFEmail({
            to: surveyorEmail.trim(),
            surveyorName: surveyorName?.trim() || claim.surveyorName || undefined,
            claim: {
                ...claim,
                pdfUrl: currentPdfUrl
            },
            attachments,
            customMessage: customMessage?.trim(),
            workshopName
        })

        // 6. Update claim record in database with dispatch timestamp & audit log
        const now = new Date()
        const logEntry = `[${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] Claim PDF & ${attachments.length} attachment(s) emailed to surveyor: ${surveyorEmail.trim()}`
        const updatedNotes = claim.adminNotes ? `${claim.adminNotes}\n${logEntry}` : logEntry

        let updatedClaim: any
        try {
            updatedClaim = await db.insuranceClaim.update({
                where: { id },
                data: {
                    pdfSentToSurveyorAt: now,
                    surveyorLastEmailedTo: surveyorEmail.trim(),
                    adminNotes: updatedNotes
                },
                include: {
                    user: { select: { id: true, name: true, email: true, mobile: true } },
                    documents: true,
                    shop: true
                }
            })
        } catch (updateErr: any) {
            console.warn('[Surveyor PDF] Prisma typed log fallback to raw SQL:', updateErr.message)
            await db.$executeRawUnsafe(
                `UPDATE InsuranceClaim SET pdfSentToSurveyorAt = ?, surveyorLastEmailedTo = ?, adminNotes = ? WHERE id = ?`,
                now.toISOString(),
                surveyorEmail.trim(),
                updatedNotes,
                id
            )
            updatedClaim = await db.insuranceClaim.findUnique({
                where: { id },
                include: {
                    user: { select: { id: true, name: true, email: true, mobile: true } },
                    documents: true,
                    shop: true
                }
            })
        }

        return NextResponse.json({
            success: true,
            message: `Claim PDF successfully emailed to surveyor (${surveyorEmail.trim()})`,
            sentTo: surveyorEmail.trim(),
            sentAt: now.toISOString(),
            attachmentsCount: attachments.length,
            claim: updatedClaim
        })

    } catch (error: any) {
        console.error('Error sending PDF to surveyor:', error)
        let errorMsg = error.message || 'Failed to send PDF to surveyor.'
        if (errorMsg.includes('SMTP settings not configured')) {
            errorMsg = 'SMTP settings not configured. Please configure your email server in Admin Settings (Settings > SMTP Settings) to deliver PDF emails.'
        }
        return NextResponse.json({
            error: errorMsg
        }, { status: 500 })
    }
}
