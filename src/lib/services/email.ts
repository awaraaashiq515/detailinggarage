import nodemailer from 'nodemailer';
import { db } from '@/lib/db';
import { otpEmailTemplate, approvalEmailTemplate, rejectionEmailTemplate, testEmailTemplate, pdiRequestAdminTemplate, pdiStatusUpdateTemplate } from './email-templates';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

/**
 * Get SMTP transporter configured with database settings
 */
async function getTransporter() {
    const smtpSettings = await db.sMTPSettings.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' }
    });

    if (!smtpSettings) {
        throw new Error('SMTP settings not configured. Please configure SMTP in admin settings.');
    }

    const transportConfig: any = {
        host: smtpSettings.host,
        port: smtpSettings.port,
        auth: {
            user: smtpSettings.username,
            pass: smtpSettings.password,
        },
    };

    // Add encryption settings
    if (smtpSettings.encryption === 'TLS') {
        transportConfig.secure = false;
        transportConfig.requireTLS = true;
    } else if (smtpSettings.encryption === 'SSL') {
        transportConfig.secure = true;
    } else {
        transportConfig.secure = false;
    }

    return nodemailer.createTransport(transportConfig);
}

/**
 * Send email using configured SMTP settings
 */
async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
    try {
        const transporter = await getTransporter();
        const smtpSettings = await db.sMTPSettings.findFirst({
            where: { isActive: true },
            orderBy: { updatedAt: 'desc' }
        });

        if (!smtpSettings) {
            throw new Error('SMTP settings not found');
        }

        await transporter.sendMail({
            from: `"${smtpSettings.fromName}" <${smtpSettings.fromEmail}>`,
            to,
            subject,
            html,
        });

        return true;
    } catch (error: any) {
        console.error('========================================');
        console.error('📧 EMAIL SENDING FAILED - DETAILED ERROR:');
        console.error('========================================');
        console.error('Error Message:', error.message);
        console.error('Error Code:', error.code);
        console.error('Error Response:', error.response);
        console.error('Error Command:', error.command);
        console.error('Timestamp:', new Date().toISOString());
        console.error('========================================');
        throw error;
    }
}


/**
 * Send OTP verification email
 */
export async function sendOTPEmail(email: string, otp: string, name: string): Promise<boolean> {
    try {
        await sendEmail({
            to: email,
            subject: 'Email Verification - OTP Code',
            html: otpEmailTemplate(name, otp),
        });
        return true;
    } catch (error) {
        console.error('Failed to send OTP email:', error);
        return false;
    }
}

/**
 * Send account approval notification email
 */
export async function sendApprovalEmail(email: string, name: string): Promise<boolean> {
    try {
        await sendEmail({
            to: email,
            subject: '🎉 Your Account Has Been Approved!',
            html: approvalEmailTemplate(name),
        });
        return true;
    } catch (error) {
        console.error('Failed to send approval email:', error);
        return false;
    }
}

/**
 * Send account rejection notification email
 */
export async function sendRejectionEmail(email: string, name: string, reason?: string): Promise<boolean> {
    try {
        await sendEmail({
            to: email,
            subject: 'Account Registration Status Update',
            html: rejectionEmailTemplate(name, reason),
        });
        return true;
    } catch (error) {
        console.error('Failed to send rejection email:', error);
        return false;
    }
}

/**
 * Send test email to verify SMTP configuration
 */
export async function sendTestEmail(email: string): Promise<boolean> {
    try {
        await sendEmail({
            to: email,
            subject: 'SMTP Configuration Test - Success!',
            html: testEmailTemplate(),
        });
        return true;
    } catch (error) {
        console.error('Failed to send test email:', error);
        throw error;
    }
}

/**
 * Check if SMTP is configured
 */
export async function isSMTPConfigured(): Promise<boolean> {
    const smtpSettings = await db.sMTPSettings.findFirst({
        where: { isActive: true }
    });
    return !!smtpSettings;
}

/**
 * Send PDI Request Notification to Admin
 */
export async function sendPDIRequestNotification(request: any, user: any): Promise<boolean> {
    try {
        // Fetch all admin emails
        const admins = await db.user.findMany({
            where: { role: 'ADMIN' },
            select: { email: true }
        });

        if (admins.length === 0) return false;

        const html = pdiRequestAdminTemplate(request, user);

        // Send to all admins in parallel
        await Promise.all(admins.map(admin =>
            sendEmail({
                to: admin.email,
                subject: '🔔 New PDI Request Received',
                html
            })
        ));

        return true;
    } catch (error) {
        console.error('Failed to send PDI admin notification:', error);
        return false;
    }
}

/**
 * Send PDI Status Update Notification to Client
 */
export async function sendPDIStatusUpdateEmail(email: string, request: any, status: string, message?: string): Promise<boolean> {
    try {
        await sendEmail({
            to: email,
            subject: 'Updates on your PDI Request',
            html: pdiStatusUpdateTemplate(request, status, message),
        });
        return true;
    } catch (error) {
        console.error('Failed to send PDI status update email:', error);
        return false;
    }
}

/**
 * Send welcome email with login credentials for auto-created users
 */
export async function sendWelcomeCredentialsEmail(email: string, name: string, password: string): Promise<boolean> {
    try {
        const { welcomeCredentialsTemplate } = await import('./email-templates');
        const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;

        await sendEmail({
            to: email,
            subject: '🎉 Your Detailing Garage Account is Ready!',
            html: welcomeCredentialsTemplate(name, email, password, loginUrl),
        });
        return true;
    } catch (error) {
        console.error('Failed to send welcome credentials email:', error);
        return false;
    }
}

/**
 * Send notification when PDI report is generated and ready for viewing
 */
export async function sendPDIReportEmail(email: string, name: string, vehicleInfo: string, reportId: string): Promise<boolean> {
    try {
        const { pdiReportReadyTemplate } = await import('./email-templates');
        const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/client/pdi-reports/${reportId}`;

        await sendEmail({
            to: email,
            subject: `📄 Your PDI Report for ${vehicleInfo} is Ready`,
            html: pdiReportReadyTemplate(name, vehicleInfo, reportUrl),
        });
        return true;
    } catch (error) {
        console.error('Failed to send PDI report email:', error);
        return false;
    }
}

/**
 * Send notification to admin when new insurance claim is submitted
 */
export async function sendInsuranceClaimAdminNotification(claim: any, user: any): Promise<boolean> {
    try {
        const { insuranceClaimAdminTemplate } = await import('./email-templates');

        // Fetch all admin emails
        const admins = await db.user.findMany({
            where: { role: 'ADMIN' },
            select: { email: true }
        });

        if (admins.length === 0) return false;

        const html = insuranceClaimAdminTemplate(claim, user);

        // Send to all admins in parallel
        await Promise.all(admins.map(admin =>
            sendEmail({
                to: admin.email,
                subject: `🛡️ New Insurance Claim: ${claim.claimNumber}`,
                html
            })
        ));

        return true;
    } catch (error) {
        console.error('Failed to send insurance claim admin notification:', error);
        return false;
    }
}

/**
 * Send notification when insurance claim PDF is ready
 */
export async function sendInsuranceClaimPDFEmail(email: string, name: string, claimNumber: string, vehicleInfo: string, claimId: string): Promise<boolean> {
    try {
        const { insuranceClaimPDFReadyTemplate } = await import('./email-templates');
        const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/client/insurance-claims/${claimId}`;

        await sendEmail({
            to: email,
            subject: `📄 Insurance Claim Report Ready - ${claimNumber}`,
            html: insuranceClaimPDFReadyTemplate(name, claimNumber, vehicleInfo, reportUrl),
        });
        return true;
    } catch (error) {
        console.error('Failed to send insurance claim PDF email:', error);
        return false;
    }
}

/**
 * Send notification when insurance claim status is updated
 */
export async function sendInsuranceClaimStatusEmail(email: string, name: string, claimNumber: string, status: string, adminNotes?: string): Promise<boolean> {
    try {
        const { insuranceClaimStatusUpdateTemplate } = await import('./email-templates');

        await sendEmail({
            to: email,
            subject: `Insurance Claim Update - ${claimNumber}`,
            html: insuranceClaimStatusUpdateTemplate(name, claimNumber, status, adminNotes),
        });
        return true;
    } catch (error) {
        console.error('Failed to send insurance claim status email:', error);
        return false;
    }
}

