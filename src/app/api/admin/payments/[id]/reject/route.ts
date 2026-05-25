import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { db } from '@/lib/db';

/**
 * POST /api/admin/payments/[id]/reject
 * Reject a pending payment
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const data = await request.json();
        const { adminNotes } = data;

        // Find payment and associated subscription
        const payment = await db.payment.findUnique({
            where: { id },
            include: { subscription: true }
        });

        if (!payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        // Update Payment status
        await db.payment.update({
            where: { id },
            data: {
                status: 'FAILED',
                adminNotes: adminNotes || 'Rejected by admin',
            },
        });

        // Update Subscription status to CANCELLED if it exists
        if (payment.subscription) {
            await db.dealerSubscription.update({
                where: { id: payment.subscription.id },
                data: {
                    status: 'CANCELLED',
                },
            });
        }

        return NextResponse.json({ message: 'Payment rejected' });
    } catch (error) {
        console.error('Error rejecting payment:', error);
        return NextResponse.json(
            { error: 'Failed to reject payment' },
            { status: 500 }
        );
    }
}
