import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { createDealerPackageSchema } from '@/lib/schemas/dealer-package';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const packages = await db.dealerPackage.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ packages });
    } catch (error) {
        console.error('Error fetching dealer packages:', error);
        return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validation = createDealerPackageSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten() }, { status: 400 });
        }

        const data = validation.data;
        const newPackage = await db.dealerPackage.create({
            data: {
                ...data,
                features: data.features ? JSON.stringify(data.features) : '[]',
            },
        });

        return NextResponse.json({ package: newPackage, message: 'Package created successfully' }, { status: 201 });
    } catch (error) {
        console.error('Error creating dealer package:', error);
        return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
    }
}
