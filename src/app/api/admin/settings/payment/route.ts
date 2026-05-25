import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { generateUPIQRCode, generateUPIQRDataURL, deleteQRCode } from '@/lib/qr-generator';

/**
 * GET /api/admin/settings/payment
 * Fetch current UPI payment settings (accessible to all authenticated users)
 */
export async function GET(request: NextRequest) {
    try {
        // Allow any authenticated user to view payment settings
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check for amount parameter to generate dynamic QR
        const { searchParams } = new URL(request.url);
        const amount = searchParams.get('amount') ? parseFloat(searchParams.get('amount')!) : null;

        // Get or create payment settings
        let settings = await db.paymentSettings.findFirst();

        if (!settings) {
            settings = await db.paymentSettings.create({
                data: {
                    upiId: null,
                    upiName: 'Dealer Package Payment',
                    qrCodePath: null,
                    isActive: true,
                },
            });
        }

        // If amount is provided, generate a dynamic QR code
        if (amount && settings.upiId && settings.upiName) {
            const dynamicQrCode = await generateUPIQRDataURL(settings.upiId, settings.upiName, amount);
            return NextResponse.json({
                settings: {
                    ...settings,
                    qrCodePath: dynamicQrCode // Overwrite with dynamic QR
                }
            });
        }

        return NextResponse.json({ settings });
    } catch (error) {
        console.error('Error fetching payment settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payment settings' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/admin/settings/payment
 * Update UPI payment settings and regenerate QR code
 */
export async function PUT(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user || (user.role !== 'ADMIN' && user.role !== 'COMPANY' && user.role !== 'ENTERPRISE')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { upiId, upiName, isActive } = data;

        if (!upiId || !upiName) {
            return NextResponse.json({ error: 'UPI ID and Name are required' }, { status: 400 });
        }

        // Get existing settings
        let settings = await db.paymentSettings.findFirst();

        // If upiId or upiName changed, regenerate QR code
        let qrCodePath = settings?.qrCodePath;
        if (!settings || settings.upiId !== upiId || settings.upiName !== upiName) {
            // Delete old QR code if it exists
            if (qrCodePath) {
                deleteQRCode(qrCodePath);
            }
            // Generate new QR code
            qrCodePath = await generateUPIQRCode(upiId, upiName);
        }

        if (settings) {
            settings = await db.paymentSettings.update({
                where: { id: settings.id },
                data: {
                    upiId,
                    upiName,
                    qrCodePath,
                    isActive: isActive ?? true,
                },
            });
        } else {
            settings = await db.paymentSettings.create({
                data: {
                    upiId,
                    upiName,
                    qrCodePath,
                    isActive: isActive ?? true,
                },
            });
        }

        return NextResponse.json({ settings, message: 'Payment settings updated successfully' });
    } catch (error) {
        console.error('Error updating payment settings:', error);
        return NextResponse.json(
            { error: 'Failed to update payment settings' },
            { status: 500 }
        );
    }
}
