import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { db } from '@/lib/db';

/**
 * POST /api/admin/payments/[id]/approve
 * Approve a pending payment and activate subscription
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
        const updatedPayment = await db.payment.update({
            where: { id },
            data: {
                status: 'PAID',
                adminNotes: adminNotes || 'Approved by admin',
                paymentDate: new Date(),
            },
            include: { package: true, subscription: true }
        });

        // Update Subscription status to ACTIVE if it exists
        if (updatedPayment.subscription) {
            const now = new Date();
            const endDate = new Date(now);
            endDate.setDate(now.getDate() + (updatedPayment.package.durationDays || 30));

            await db.dealerSubscription.update({
                where: { id: updatedPayment.subscription.id },
                data: {
                    status: 'ACTIVE',
                    startDate: now,
                    endDate: endDate,
                },
            });
        }

        return NextResponse.json({ message: 'Payment approved and subscription activated. Dates have been reset to start from today.' });
    } catch (error) {
        console.error('Error approving payment:', error);
        return NextResponse.json(
            { error: 'Failed to approve payment' },
            { status: 500 }
        );
    }
}
