import { NextResponse } from 'next/server'
import * as pdiService from '@/services/pdi-service'

export async function GET() {
    try {
        const inspections = await pdiService.getAllPDIInspections()
        return NextResponse.json(inspections)
    } catch (error) {
        console.error('Failed to fetch PDI inspections:', error)
        return NextResponse.json(
            { error: 'Failed to load inspections' },
            { status: 500 }
        )
    }
}
