import { NextRequest, NextResponse } from 'next/server'
import { generatePDIPDF, hasPDF } from '@/services/pdi/pdf/generator/pdi-pdf-generator'

/**
 * Generate PDF for a specific PDI inspection
 * Route: /api/pdi/generate-pdf/[id]
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: inspectionId } = await params

        if (!inspectionId) {
            return NextResponse.json(
                { error: 'Inspection ID is required' },
                { status: 400 }
            )
        }

        // Generate the PDF
        const pdfUrl = await generatePDIPDF(inspectionId)

        return NextResponse.json({
            success: true,
            pdfUrl,
            message: 'PDF generated successfully'
        }, { status: 200 })
    } catch (error: any) {
        console.error('Failed to generate PDF:', error)
        return NextResponse.json(
            { error: 'Failed to generate PDF', details: error.message },
            { status: 500 }
        )
    }
}

/**
 * Check if PDF exists for an inspection
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const exists = await hasPDF(id)

        return NextResponse.json({
            exists,
            inspectionId: id
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to check PDF status', details: error.message },
            { status: 500 }
        )
    }
}
