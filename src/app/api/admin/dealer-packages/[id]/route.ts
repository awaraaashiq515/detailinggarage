import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { updateDealerPackageSchema } from '@/lib/schemas/dealer-package';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const pkg = await db.dealerPackage.findUnique({
            where: { id },
        });

        if (!pkg) {
            return NextResponse.json({ error: 'Package not found' }, { status: 404 });
        }

        return NextResponse.json({ package: pkg });
    } catch (error) {
        console.error('Error fetching dealer package:', error);
        return NextResponse.json({ error: 'Failed to fetch package' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const validation = updateDealerPackageSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten() }, { status: 400 });
        }

        const data = validation.data;
        const updatedPackage = await db.dealerPackage.update({
            where: { id },
            data: {
                ...data,
                features: data.features ? JSON.stringify(data.features) : undefined,
            },
        });

        return NextResponse.json({ package: updatedPackage, message: 'Package updated successfully' });
    } catch (error) {
        console.error('Error updating dealer package:', error);
        return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Check if there are active subscriptions
        const subscriptionCount = await db.dealerSubscription.count({
            where: { packageId: id },
        });

        if (subscriptionCount > 0) {
            return NextResponse.json({
                error: 'Cannot delete package with existing subscriptions. Deactivate it instead.'
            }, { status: 400 });
        }

        await db.dealerPackage.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Package deleted successfully' });
    } catch (error) {
        console.error('Error deleting dealer package:', error);
        return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 });
    }
}
