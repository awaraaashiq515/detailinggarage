import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/jwt'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
// @ts-ignore
import exifReader from 'exif-reader'

/**
 * POST - Upload document files for insurance claims
 * Images get a camera-style timestamp + location watermark stamped on them.
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const files = formData.getAll('files') as File[]
        const documentType = formData.get('documentType') as string || 'OTHER'
        const claimId = formData.get('claimId') as string
        let location = (formData.get('location') as string) || ''

        console.log(`[UploadAPI] START: Processing ${files.length} files for Claim ID: ${claimId}`)
        console.log(`[UploadAPI] INFO: documentType=${documentType}, locationValue="${location}"`)

        // If location is not provided but claimId exists, try to get it from the DB
        if ((!location || location === 'undefined') && claimId) {
            try {
                const { db } = await import('@/lib/db')
                const claim = await (db as any).insuranceClaim.findUnique({
                    where: { id: claimId },
                    select: { incidentLocation: true, claimNumber: true }
                })

                if (claim) {
                    console.log(`[UploadAPI] DB_FALLBACK: Found claim ${claim.claimNumber}. IncidentLocation in DB: "${claim.incidentLocation}"`)
                    if (claim.incidentLocation) {
                        location = claim.incidentLocation
                    }
                } else {
                    console.warn(`[UploadAPI] DB_FALLBACK_FAIL: No claim found for ID: ${claimId}`)
                }
            } catch (err) {
                console.error('[UploadAPI] DB_FALLBACK_ERROR:', err)
            }
        }

        if (!files || files.length === 0) {
            console.error('[UploadAPI] ERROR: No files in formData')
            return NextResponse.json({ error: 'No files provided' }, { status: 400 })
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'insurance-documents')
        await mkdir(uploadDir, { recursive: true })

        const uploadedFiles: Array<{ fileName: string; fileUrl: string; fileType: string }> = []

        for (const file of files) {
            if (!(file instanceof File)) continue

            if (file.size > 10 * 1024 * 1024) { // Increased to 10MB
                return NextResponse.json({ error: `File ${file.name} is too large` }, { status: 400 })
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json({ error: `File type ${file.type} not allowed` }, { status: 400 })
            }

            const ext = path.extname(file.name)
            const uniqueId = crypto.randomUUID()
            const fileName = `${documentType.toLowerCase()}_${uniqueId}${ext}`
            const filePath = path.join(uploadDir, fileName)

            const bytes = await file.arrayBuffer()
            let buffer = Buffer.from(bytes)

            // Stamp timestamp + location watermark on images only (if enabled in settings)
            const isImage = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
            if (isImage) {
                try {
                    const { db } = await import('@/lib/db')
                    const settings = await db.systemSettings.findFirst()
                    const watermarkEnabled = settings?.imageWatermarkEnabled ?? false

                    if (watermarkEnabled) {
                        // Try to extract GPS from EXIF first
                        const sharp = (await import('sharp')).default
                        const meta = await sharp(buffer).metadata()
                        let exifLocation = ''

                        if (meta.exif) {
                            try {
                                const exifData = exifReader(meta.exif) as any
                                if (exifData.gps && exifData.gps.GPSLatitude && exifData.gps.GPSLongitude) {
                                    // Convert GPS to decimal
                                    const lat = (exifData.gps.GPSLatitude[0] + exifData.gps.GPSLatitude[1] / 60 + exifData.gps.GPSLatitude[2] / 3600) * (exifData.gps.GPSLatitudeRef === 'S' ? -1 : 1)
                                    const lon = (exifData.gps.GPSLongitude[0] + exifData.gps.GPSLongitude[1] / 60 + exifData.gps.GPSLongitude[2] / 3600) * (exifData.gps.GPSLongitudeRef === 'W' ? -1 : 1)
                                    exifLocation = `Photo Location: ${lat.toFixed(6)}, ${lon.toFixed(6)}`
                                    console.log(`[UploadAPI] Extracted EXIF GPS: ${exifLocation}`)
                                }
                            } catch (exifErr) {
                                console.warn('[UploadAPI] EXIF Parse failed:', exifErr)
                            }
                        }

                        // Use EXIF location if found, otherwise use provided location
                        const finalLocation = exifLocation || location
                        buffer = await applyTimestampWatermark(buffer, finalLocation) as any
                    } else {
                        console.log('[UploadAPI] INFO: Image watermark is DISABLED in system settings')
                    }
                } catch (err) {
                    console.error('[UploadAPI] Watermark failed, saving original:', err)
                }
            }

            await writeFile(filePath, buffer)
            const fileUrl = `/uploads/insurance-documents/${fileName}`
            uploadedFiles.push({ fileName: file.name, fileUrl, fileType: documentType })
        }

        if (claimId) {
            const { db } = await import('@/lib/db')
            await db.insuranceDocument.createMany({
                data: uploadedFiles.map(f => ({
                    claimId,
                    fileName: f.fileName,
                    fileUrl: f.fileUrl,
                    fileType: f.fileType
                }))
            })
        }

        return NextResponse.json({
            success: true,
            files: uploadedFiles,
            message: `${uploadedFiles.length} file(s) uploaded successfully`
        })
    } catch (error: any) {
        console.error('[UploadAPI] Fatal error:', error)
        return NextResponse.json({ error: error.message || 'Failed to upload files' }, { status: 500 })
    }
}

/**
 * Stamps a camera-style timestamp + location watermark at the bottom-right corner.
 */
async function applyTimestampWatermark(imageBuffer: Buffer, location: string): Promise<Buffer> {
    const sharp = (await import('sharp')).default

    try {
        console.log(`[Watermark] Processing for: "${location}"`);

        const pipeline = sharp(imageBuffer).rotate();
        const meta = await pipeline.metadata();

        let imgW = meta.width ?? 800;
        let imgH = meta.height ?? 600;

        if (meta.orientation && meta.orientation >= 5 && meta.orientation <= 8) {
            [imgW, imgH] = [imgH, imgW];
        }

        const now = new Date()
        const dateStr = now.toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata'
        })
        const timeStr = now.toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Kolkata'
        })

        const sanitize = (s: string) =>
            s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

        const dateLabel = sanitize(`${dateStr}  ${timeStr}`)
        const locLabel = sanitize((location || 'Location: Not Provided').slice(0, 50))

        const fontSize = Math.max(20, Math.min(36, Math.floor(imgW / 22)))
        const smallFont = Math.max(16, Math.floor(fontSize * 0.82))
        const pad = Math.floor(fontSize * 0.8)
        const lineH = Math.floor(fontSize * 1.8)

        const boxW = Math.min(Math.floor(imgW * 0.75), imgW - pad * 2)
        const boxH = pad * 2 + lineH + Math.floor(smallFont * 1.6)

        const margin = Math.max(15, Math.floor(imgW * 0.025))
        const overlayLeft = Math.floor(imgW - boxW - margin)
        const overlayTop = Math.floor(imgH - boxH - margin)

        const tx = pad + 12
        const svg = `
        <svg width="${boxW}" height="${boxH}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="shadow" x="0" y="0" width="200%" height="200%">
                    <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.8"/>
                </filter>
            </defs>
            <rect x="0" y="0" width="${boxW}" height="${boxH}" rx="10" ry="10" fill="rgba(0,0,0,0.8)"/>
            <rect x="0" y="0" width="8" height="${boxH}" rx="4" ry="4" fill="#16acd4"/>
            <text x="${tx}" y="${pad + fontSize}" font-family="monospace, Courier" font-size="${fontSize}" font-weight="bold" fill="#FFFFFF" filter="url(#shadow)">${dateLabel}</text>
            <text x="${tx}" y="${pad + lineH + smallFont}" font-family="sans-serif, Arial" font-size="${smallFont}" font-weight="bold" fill="#16acd4" filter="url(#shadow)">${locLabel}</text>
        </svg>`.trim().replace(/>\s+</g, '><');

        return await pipeline
            .composite([{
                input: Buffer.from(svg),
                top: Math.max(0, overlayTop),
                left: Math.max(0, overlayLeft)
            }])
            .jpeg({ quality: 90 })
            .toBuffer()
    } catch (err) {
        console.error('[Watermark] Error:', err)
        return imageBuffer
    }
}
