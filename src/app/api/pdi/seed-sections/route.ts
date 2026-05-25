import { NextResponse } from 'next/server'

// Since this is a one-time seeding operation, we'll directly run the seed script
// In production, this endpoint should be protected with admin authentication

export async function POST() {
    try {
        // For now, we'll return a message to run the seed script manually
        // In production,you would import and execute the seed logic here

        return NextResponse.json({
            message: 'Please run the seed-pdi-sections.ts script to populate PDI sections',
            command: 'Run: npx tsx prisma/seed-pdi-sections.ts from the project root'
        }, { status: 200 })
    } catch (error: any) {
        console.error('Error in seed-sections endpoint:', error)
        return NextResponse.json(
            { error: 'Failed to seed sections', details: error.message },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Use POST method to trigger section seeding',
        note: 'Or run: npx tsx prisma/seed-pdi-sections.ts'
    })
}
