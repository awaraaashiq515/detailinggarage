import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { db } from '@/lib/db';

/**
 * GET /api/admin/payments
 * Fetch all payment records with package and dealer details
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payments = await db.payment.findMany({
            include: {
                package: true,
                subscription: {
                    include: {
                        dealer: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                dealerBusinessName: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ payments });
    } catch (error) {
        console.error('Error fetching payments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payments' },
            { status: 500 }
        );
    }
}
