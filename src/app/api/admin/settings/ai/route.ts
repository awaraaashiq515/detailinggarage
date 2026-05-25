import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/jwt'
import { db as prisma } from '@/lib/db'

// GET - Fetch AI settings
export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let settings = await prisma.aISettings.findFirst()

        // Create default settings if they don't exist
        if (!settings) {
            settings = await prisma.aISettings.create({
                data: {
                    geminiApiKey: null,
                    translationEnabled: true
                }
            })
        }

        return NextResponse.json({ settings })
    } catch (error) {
        console.error('Error fetching AI settings:', error)
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }
}

// POST - Update AI settings
export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { geminiApiKey, translationEnabled } = await req.json()

        // Get existing settings or create new one
        let settings = await prisma.aISettings.findFirst()

        if (settings) {
            // Update existing settings
            settings = await prisma.aISettings.update({
                where: { id: settings.id },
                data: {
                    geminiApiKey: geminiApiKey || null,
                    translationEnabled: translationEnabled ?? true
                }
            })
        } else {
            // Create new settings
            settings = await prisma.aISettings.create({
                data: {
                    geminiApiKey: geminiApiKey || null,
                    translationEnabled: translationEnabled ?? true
                }
            })
        }

        return NextResponse.json({ success: true, settings })
    } catch (error) {
        console.error('Error updating AI settings:', error)
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }
}
