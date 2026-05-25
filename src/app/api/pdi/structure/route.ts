import { NextResponse } from 'next/server'
import { getPDIStructure } from '@/services/pdi-service'

export async function GET() {
    try {
        const structure = await getPDIStructure()
        return NextResponse.json(structure)
    } catch (error) {
        console.error('Failed to fetch PDI structure:', error)
        return NextResponse.json(
            { error: 'Failed to load PDI form structure' },
            { status: 500 }
        )
    }
}
