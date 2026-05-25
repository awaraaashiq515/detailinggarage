import { renderToBuffer } from '@react-pdf/renderer'
import { db as prisma } from '@/lib/db'
import { PDIReportTemplate } from '../templates/pdi-report-template'
import { PDIReportData, VehicleDamageData } from '@/components/pdi/pdi-types'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

/**
 * Generate PDF for a PDI inspection
 * @param inspectionId - The ID of the PDI inspection
 * @returns The URL path to the generated PDF
 */
export async function generatePDIPDF(inspectionId: string): Promise<string> {
    try {
        // 1. Fetch the inspection data with all related responses
        const inspection = await (prisma as any).pDIInspection.findUnique({
            where: { id: inspectionId },
            include: {
                responses: {
                    include: {
                        item: {
                            include: {
                                section: true
                            }
                        }
                    }
                },
                leakageResponses: {
                    include: {
                        leakageItem: true
                    }
                },
                images: {
                    orderBy: {
                        uploadedAt: 'asc'
                    }
                }
            }
        })

        if (!inspection) {
            throw new Error('Inspection not found')
        }

        // 2. Fetch ALL checklist sections and items (the complete template)
        const allSections = await (prisma as any).pDISection.findMany({
            include: {
                items: {
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { order: 'asc' }
        })

        // 3. Create a response map for quick lookup
        const responseMap = new Map<string, any>()
        inspection.responses.forEach((response: any) => {
            responseMap.set(response.itemId, response)
        })

        // 4. Build sections array with ALL items, merging in responses where they exist
        const sections = allSections.map((section: any) => ({
            name: section.name,
            sectionType: section.sectionType,
            items: section.items.map((item: any) => {
                const response = responseMap.get(item.id)
                return {
                    label: item.label,
                    status: response?.status || null, // null if not marked
                    notes: response?.notes || null
                }
            })
        }))

        // Parse damage data if present
        let damageData: VehicleDamageData | undefined
        if (inspection.vehicleDamageData) {
            try {
                damageData = JSON.parse(inspection.vehicleDamageData)
                console.log('✅ Parsed damage data:', damageData)
            } catch (e) {
                console.warn('❌ Failed to parse vehicle damage data:', e)
            }
        }

        // Transform leakage responses
        const leakageItems = (inspection.leakageResponses || []).map((lr: any) => ({
            label: lr.leakageItem.label,
            found: lr.found,
            notes: lr.notes
        }))

        console.log('📊 PDF Data Summary:')
        console.log('  - Sections:', sections.length)
        console.log('  - Total items:', sections.reduce((sum: number, s: any) => sum + s.items.length, 0))
        console.log('  - Leakage items:', leakageItems.length)
        console.log('  - Damage markers:', damageData?.markers?.length || 0)
        console.log('  - Vehicle images:', inspection.images?.length || 0)

        const reportData: PDIReportData = {
            inspection: {
                id: inspection.id,
                vehicleMake: inspection.vehicleMake,
                vehicleModel: inspection.vehicleModel,
                vehicleColor: inspection.vehicleColor,
                vehicleYear: inspection.vehicleYear,
                vin: inspection.vin,
                engineNumber: inspection.engineNumber,
                odometer: inspection.odometer,
                customerName: inspection.customerName,
                customerEmail: inspection.customerEmail,
                customerPhone: inspection.customerPhone,
                inspectionDate: inspection.inspectionDate.toISOString(),
                inspectedBy: inspection.inspectedBy,
                adminComments: inspection.adminComments,
                digitalSignature: inspection.digitalSignature,
                customerSignature: inspection.customerSignature,
                status: inspection.status
            },
            sections,
            leakageItems,
            images: (inspection.images || []).map((img: any) => ({
                id: img.id,
                category: img.category,
                imagePath: img.imagePath,
                fileName: img.fileName
            })),
            damageData
        }

        // 3. Generate PDF using react-pdf
        const pdfDocument = PDIReportTemplate({ data: reportData })
        const pdfBuffer = await renderToBuffer(pdfDocument)

        // 4. Save PDF to public/pdi/reports/{date}/ directory
        const dateStr = new Date(inspection.inspectionDate).toISOString().split('T')[0]
        const reportsDir = join(process.cwd(), 'public', 'pdi', 'reports', dateStr)

        // Create directory if it doesn't exist
        try {
            mkdirSync(reportsDir, { recursive: true })
        } catch (e) {
            // Directory already exists
        }

        // Format filename as PDI-{Make}-{Model}-{Date}.pdf
        const filename = `PDI-${inspection.vehicleMake}-${inspection.vehicleModel}-${dateStr}.pdf`
            .replace(/\s+/g, '-') // Replace spaces with hyphens
        const filepath = join(reportsDir, filename)

        writeFileSync(filepath, pdfBuffer)

        // 5. Update inspection record with PDF URL
        const pdfUrl = `/pdi/reports/${dateStr}/${filename}`
        await (prisma as any).pDIInspection.update({
            where: { id: inspectionId },
            data: { pdfUrl }
        })

        return pdfUrl
    } catch (error) {
        console.error('Error generating PDF:', error)
        throw new Error(`Failed to generate PDF: ${error}`)
    }
}

/**
 * Check if PDF exists for an inspection
 */
export async function hasPDF(inspectionId: string): Promise<boolean> {
    const inspection = await (prisma as any).pDIInspection.findUnique({
        where: { id: inspectionId },
        select: { pdfUrl: true }
    })

    return !!inspection?.pdfUrl
}
