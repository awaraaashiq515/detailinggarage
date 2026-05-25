import { NextResponse } from 'next/server'
import * as pdiService from '@/services/pdi-service'

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const inspection = await pdiService.getPDIInspection(id)

        if (!inspection) {
            return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
        }

        return NextResponse.json(inspection)
    } catch (error) {
        console.error('Failed to fetch PDI inspection:', error)
        return NextResponse.json(
            { error: 'Failed to load inspection details' },
            { status: 500 }
        )
    }
}
