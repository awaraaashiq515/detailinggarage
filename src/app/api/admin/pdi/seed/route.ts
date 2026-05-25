import { NextResponse } from 'next/server'
import { seedPDIStructure } from '@/services/pdi-service'

export async function POST() {
    try {
        const result = await seedPDIStructure()
        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Error seeding PDI structure:', error)
        return NextResponse.json(
            { error: 'Failed to seed PDI structure', details: error.message },
            { status: 500 }
        )
    }
}
