import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/jwt'
import { db as prisma } from '@/lib/db'

// GET - Fetch Surepass settings (masked token + mode)
export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let settings = await prisma.surepassSettings.findFirst()

        if (!settings) {
            settings = await prisma.surepassSettings.create({
                data: { mode: 'sandbox' }
            })
        }

        const token = settings.apiToken
        const maskedToken = token
            ? '•'.repeat(Math.max(0, token.length - 4)) + token.slice(-4)
            : null

        return NextResponse.json({
            settings: {
                id: settings.id,
                apiToken: maskedToken,
                hasToken: !!token,
                mode: settings.mode ?? 'sandbox',
                updatedAt: settings.updatedAt,
            }
        })
    } catch (error) {
        console.error('Error fetching Surepass settings:', error)
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }
}

// POST - Update Surepass API token and/or mode
export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { apiToken, mode } = body

        if (mode !== undefined && mode !== 'sandbox' && mode !== 'live') {
            return NextResponse.json({ error: 'Invalid mode. Must be sandbox or live.' }, { status: 400 })
        }

        const existing = await prisma.surepassSettings.findFirst()

        // Strip any "Bearer " prefix the user may have accidentally included
        const cleanToken = apiToken?.trim()
            ? apiToken.trim().replace(/^Bearer\s+/i, '').trim()
            : undefined

        if (existing) {
            await prisma.surepassSettings.update({
                where: { id: existing.id },
                data: {
                    ...(cleanToken ? { apiToken: cleanToken } : {}),
                    ...(mode !== undefined ? { mode } : {}),
                    updatedBy: user.userId,
                }
            })
        } else {
            if (!cleanToken) {
                return NextResponse.json({ error: 'API token is required for first-time setup' }, { status: 400 })
            }
            await prisma.surepassSettings.create({
                data: {
                    apiToken: cleanToken,
                    mode: mode ?? 'sandbox',
                    updatedBy: user.userId,
                }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating Surepass settings:', error)
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }
}
