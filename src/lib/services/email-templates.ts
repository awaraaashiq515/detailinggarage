export const otpEmailTemplate = (name: string, otp: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Email Verification</h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Hello <strong>${name}</strong>,
                            </p>
                            <p style="margin: 0 0 30px; color: #666666; font-size: 15px; line-height: 1.6;">
                                Thank you for registering! Please use the following One-Time Password (OTP) to verify your email address:
                            </p>
                            
                            <!-- OTP Box -->
                            <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                                <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                    ${otp}
                                </div>
                            </div>
                            
                            <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                This OTP will expire in <strong>10 minutes</strong>. Please do not share this code with anyone.
                            </p>
                            
                            <p style="margin: 30px 0 0; color: #999999; font-size: 13px; line-height: 1.6;">
                                If you didn't request this verification, please ignore this email.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                © ${new Date().getFullYear()} Your Company. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export const approvalEmailTemplate = (name: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Approved</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); border-radius: 8px 8px 0 0;">
                            <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Account Approved!</h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Hello <strong>${name}</strong>,
                            </p>
                            <p style="margin: 0 0 30px; color: #666666; font-size: 15px; line-height: 1.6;">
                                Great news! Your account has been approved by our admin team. You can now log in and access all features.
                            </p>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 40px 0;">
                                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" 
                                   style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                    Log In Now
                                </a>
                            </div>
                            
                            <p style="margin: 30px 0 0; color: #999999; font-size: 13px; line-height: 1.6;">
                                If you have any questions, please don't hesitate to contact our support team.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                © ${new Date().getFullYear()} Your Company. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export const rejectionEmailTemplate = (name: string, reason?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Status Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Account Status Update</h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Hello <strong>${name}</strong>,
                            </p>
                            <p style="margin: 0 0 30px; color: #666666; font-size: 15px; line-height: 1.6;">
                                We regret to inform you that your account registration could not be approved at this time.
                            </p>
                            
                            ${reason ? `
                            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                                    <strong>Reason:</strong> ${reason}
                                </p>
                            </div>
                            ` : ''}
                            
                            <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                If you believe this is an error or would like to discuss this further, please contact our support team.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                © ${new Date().getFullYear()} Your Company. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export const testEmailTemplate = () => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                            <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">SMTP Test Successful</h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Congratulations!
                            </p>
                            <p style="margin: 0 0 30px; color: #666666; font-size: 15px; line-height: 1.6;">
                                Your SMTP configuration is working correctly. This is a test email to verify that your email service is properly configured and can send emails.
                            </p>
                            
                            <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #155724; font-size: 14px; line-height: 1.6;">
                                    <strong>✓ Email service is configured correctly</strong><br>
                                    <strong>✓ SMTP connection successful</strong><br>
                                    <strong>✓ Ready to send notifications</strong>
                                </p>
                            </div>
                            
                            <p style="margin: 30px 0 0; color: #999999; font-size: 13px; line-height: 1.6;">
                                Test sent at: ${new Date().toLocaleString()}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                © ${new Date().getFullYear()} Your Company. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export const pdiRequestAdminTemplate = (request: any, user: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New PDI Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #16acd4 0%, #ff6b35 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🔔 New PDI Request</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                A new PDI request has been submitted by <strong>${user.name}</strong>.
                            </p>
                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <table style="width: 100%;">
                                    <tr><td style="padding: 5px 0; color: #666;"><strong>Vehicle:</strong></td><td style="padding: 5px 0; color: #333;">${request.vehicleName} (${request.vehicleModel})</td></tr>
                                    <tr><td style="padding: 5px 0; color: #666;"><strong>Location:</strong></td><td style="padding: 5px 0; color: #333;">${request.location}</td></tr>
                                    <tr><td style="padding: 5px 0; color: #666;"><strong>Client Mobile:</strong></td><td style="padding: 5px 0; color: #333;">${user.mobile || 'N/A'}</td></tr>
                                </table>
                            </div>
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/requests" style="background-color: #16acd4; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Request</a>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export const pdiStatusUpdateTemplate = (request: any, status: string, message?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDI Request Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">PDI Status Update</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                The status of your PDI request for <strong>${request.vehicleName}</strong> has been updated.
                            </p>
                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                                <span style="font-size: 14px; color: #666; display: block; margin-bottom: 5px;">New Status</span>
                                <span style="font-size: 24px; font-weight: bold; color: #333;">${status.replace(/_/g, ' ')}</span>
                            </div>
                            ${message ? `
                            <div style="background-color: #fff3cd; border-left: 4px solid #16acd4; padding: 15px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #856404; font-size: 14px;"><strong>Admin Message:</strong><br>${message}</p>
                            </div>
                            ` : ''}
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="${process.env.NEXT_PUBLIC_APP_URL}/client/requests" style="background-color: #111318; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Details</a>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export const pdiReportReadyTemplate = (name: string, vehicleInfo: string, reportUrl: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your PDI Report is Ready</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #08090c; color: #ffffff;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #111318; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);">
                            <h1 style="margin: 0; color: #000; font-size: 28px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
                                Inspection Report Ready
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 20px; font-weight: 600;">🚗 Your vehicle's PDI is complete.</h2>
                            <p style="margin: 0 0 20px; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                                Hello <strong>${name}</strong>,
                            </p>
                            <p style="margin: 0 0 30px; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                                We've finished the Pre-Delivery Inspection (PDI) for your vehicle: <strong>${vehicleInfo}</strong>.
                            </p>
                            
                            <p style="margin: 0 0 30px; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                                You can now view the detailed inspection report, including vehicle health, checklist items, and damage marking (if any) on your dashboard.
                            </p>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 40px 0;">
                                <a href="${reportUrl}" 
                                   style="display: inline-block; padding: 16px 45px; background-color: #4ade80; color: #000; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(74, 222, 128, 0.3);">
                                    View Full Report
                                </a>
                            </div>
                            
                            <p style="margin: 30px 0 0; color: #71717a; font-size: 13px; line-height: 1.6; text-align: center;">
                                If the button above doesn't work, copy and paste this link into your browser:<br>
                                <span style="color: #4ade80; word-break: break-all;">${reportUrl}</span>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #0d0f14; border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
                            <p style="margin: 0; color: #52525b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                                © ${new Date().getFullYear()} Detailing Garage. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export const welcomeCredentialsTemplate = (name: string, email: string, password: string, loginUrl: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Detailing Garage</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #08090c; color: #ffffff;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #111318; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #16acd4 0%, #ff6b35 100%);">
                            <h1 style="margin: 0; color: #000; font-size: 28px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
                                Welcome to Detailing Garage
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 20px; font-weight: 600;">🎉 Your account has been created successfully.</h2>
                            <p style="margin: 0 0 20px; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                                Hello <strong>${name}</strong>,
                            </p>
                            <p style="margin: 0 0 30px; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                                An account has been automatically created for you so you can access your PDI (Pre-Delivery Inspection) reports and manage your vehicle services.
                            </p>
                            
                            <!-- Credentials Box -->
                            <div style="background-color: rgba(22, 172, 212, 0.05); border: 1px solid rgba(22, 172, 212, 0.2); border-radius: 8px; padding: 25px; margin: 30px 0;">
                                <h3 style="margin: 0 0 15px; color: #16acd4; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Login Credentials</h3>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px; width: 80px;">Email:</td>
                                        <td style="padding: 8px 0; color: #ffffff; font-size: 15px; font-weight: 600;">${email}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;">Password:</td>
                                        <td style="padding: 8px 0; color: #ffffff; font-size: 15px; font-weight: 600;">${password}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="margin: 0 0 30px; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                                Your first PDI report is now ready for viewing on your dashboard.
                            </p>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 40px 0;">
                                <a href="${loginUrl}" 
                                   style="display: inline-block; padding: 16px 45px; background-color: #16acd4; color: #000; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(22, 172, 212, 0.3);">
                                    Access My Report
                                </a>
                            </div>
                            
                            <p style="margin: 30px 0 0; color: #71717a; font-size: 13px; line-height: 1.6; text-align: center;">
                                For security reasons, we recommend changing your password after your first login.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #0d0f14; border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
                            <p style="margin: 0; color: #52525b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                                © ${new Date().getFullYear()} Detailing Garage. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// Insurance Claim Templates
export const insuranceClaimAdminTemplate = (claim: any, user: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Insurance Claim Submitted</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #08090c; color: #ffffff;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #111318; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
                    <tr>
                        <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);">
                            <h1 style="margin: 0; color: #fff; font-size: 24px; font-weight: 800;">🛡️ New Insurance Claim</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #a1a1aa; font-size: 16px;">A new insurance claim has been submitted and requires your review.</p>
                            
                            <div style="background-color: rgba(96, 165, 250, 0.1); border: 1px solid rgba(96, 165, 250, 0.2); border-radius: 8px; padding: 20px; margin: 20px 0;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr><td style="padding: 8px 0; color: #a1a1aa;">Claim Number:</td><td style="padding: 8px 0; color: #fff; font-weight: 600;">${claim.claimNumber}</td></tr>
                                    <tr><td style="padding: 8px 0; color: #a1a1aa;">Customer:</td><td style="padding: 8px 0; color: #fff; font-weight: 600;">${user.name}</td></tr>
                                    <tr><td style="padding: 8px 0; color: #a1a1aa;">Vehicle:</td><td style="padding: 8px 0; color: #fff;">${claim.vehicleMake} ${claim.vehicleModel} (${claim.vehicleYear})</td></tr>
                                    <tr><td style="padding: 8px 0; color: #a1a1aa;">Claim Type:</td><td style="padding: 8px 0; color: #fff;">${claim.claimType}</td></tr>
                                    <tr><td style="padding: 8px 0; color: #a1a1aa;">Source:</td><td style="padding: 8px 0; color: #fff;">${claim.source}</td></tr>
                                </table>
                            </div>
                            
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/insurance/${claim.id}" style="background-color: #60a5fa; color: #000; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Review Claim</a>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export const insuranceClaimPDFReadyTemplate = (name: string, claimNumber: string, vehicleInfo: string, reportUrl: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Insurance Claim Report Ready</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #08090c; color: #ffffff;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #111318; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
                    <tr>
                        <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);">
                            <h1 style="margin: 0; color: #000; font-size: 24px; font-weight: 800;">📄 Your Claim Report is Ready</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #a1a1aa; font-size: 16px;">Hello <strong>${name}</strong>,</p>
                            <p style="margin: 0 0 30px; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                                Great news! Your insurance claim report for <strong>${vehicleInfo}</strong> (${claimNumber}) is now ready for download.
                            </p>
                            
                            <div style="text-align: center; margin: 40px 0;">
                                <a href="${reportUrl}" style="display: inline-block; padding: 16px 45px; background-color: #4ade80; color: #000; text-decoration: none; border-radius: 8px; font-weight: 800; font-size: 16px;">
                                    View Report
                                </a>
                            </div>
                            
                            <p style="margin: 30px 0 0; color: #71717a; font-size: 13px; text-align: center;">
                                You can also access this report anytime from your dashboard under "My Insurance Claims".
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 40px; background-color: #0d0f14; border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
                            <p style="margin: 0; color: #52525b; font-size: 12px;">© ${new Date().getFullYear()} Detailing Garage</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export const insuranceClaimStatusUpdateTemplate = (name: string, claimNumber: string, status: string, adminNotes?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Insurance Claim Status Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #08090c; color: #ffffff;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #111318; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
                    <tr>
                        <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #16acd4 0%, #ff6b35 100%);">
                            <h1 style="margin: 0; color: #000; font-size: 24px; font-weight: 800;">Insurance Claim Update</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #a1a1aa; font-size: 16px;">Hello <strong>${name}</strong>,</p>
                            <p style="margin: 0 0 30px; color: #a1a1aa; font-size: 16px;">
                                Your insurance claim <strong>${claimNumber}</strong> has been updated.
                            </p>
                            
                            <div style="background-color: rgba(22, 172, 212, 0.1); border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                                <span style="font-size: 12px; color: #a1a1aa; display: block; margin-bottom: 5px;">New Status</span>
                                <span style="font-size: 24px; font-weight: bold; color: #16acd4;">${status.replace(/_/g, ' ')}</span>
                            </div>
                            
                            ${adminNotes ? `
                            <div style="background-color: rgba(255,255,255,0.05); border-left: 3px solid #16acd4; padding: 15px; margin: 20px 0;">
                                <p style="margin: 0; color: #a1a1aa; font-size: 14px;"><strong>Admin Notes:</strong><br>${adminNotes}</p>
                            </div>
                            ` : ''}
                            
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="${process.env.NEXT_PUBLIC_APP_URL}/client/insurance-claims" style="background-color: #16acd4; color: #000; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Claim</a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 40px; background-color: #0d0f14; border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
                            <p style="margin: 0; color: #52525b; font-size: 12px;">© ${new Date().getFullYear()} Detailing Garage</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

