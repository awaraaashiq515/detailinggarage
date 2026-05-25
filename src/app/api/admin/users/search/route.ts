import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/jwt'
import { db as prisma } from '@/lib/db'

/**
 * GET - Search users for admin (to select existing customer)
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q') || ''

        if (!query.trim()) {
            return NextResponse.json({ users: [] })
        }

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { email: { contains: query } },
                    { mobile: { contains: query } }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true,
                mobile: true
            },
            take: 10,
            orderBy: { name: 'asc' }
        })

        return NextResponse.json({ users })
    } catch (error: any) {
        console.error('Error searching users:', error)
        return NextResponse.json({ error: error.message || 'Failed to search users' }, { status: 500 })
    }
}
