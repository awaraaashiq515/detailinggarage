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
    </table>
</body>
</html>
`;

export const surveyorInsuranceClaimTemplate = ({
    surveyorName,
    claimNumber,
    vehicleMake,
    vehicleModel,
    vehicleVariant,
    vehicleYear,
    registrationNumber,
    policyNumber,
    insuranceCompany,
    estimatedDamage,
    incidentDate,
    incidentLocation,
    incidentDescription,
    customerName,
    customerMobile,
    isEv,
    customMessage,
    pdfDownloadUrl,
    workshopName
}: {
    surveyorName?: string
    claimNumber: string
    vehicleMake: string
    vehicleModel: string
    vehicleVariant?: string
    vehicleYear: string
    registrationNumber: string
    policyNumber: string
    insuranceCompany: string
    estimatedDamage?: number | null
    incidentDate?: string
    incidentLocation?: string
    incidentDescription?: string
    customerName?: string
    customerMobile?: string
    isEv?: boolean
    customMessage?: string
    pdfDownloadUrl?: string
    workshopName?: string
}) => {
    const formattedAmount = estimatedDamage
        ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(estimatedDamage)
        : 'Under Assessment'

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Insurance Claim Assessment & Estimate Report - ${claimNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0d12; color: #ffffff;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0b0d12;">
        <tr>
            <td align="center" style="padding: 30px 10px;">
                <table role="presentation" style="width: 100%; max-width: 650px; border-collapse: collapse; background-color: #12151c; border-radius: 16px; border: 1px solid rgba(255,255,255,0.12); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
                    
                    <!-- Header Banner -->
                    <tr>
                        <td style="padding: 32px 36px; background: linear-gradient(135deg, #09203f 0%, #16acd4 50%, #00d4ff 100%);">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td>
                                        <div style="font-size: 11px; font-weight: 900; letter-spacing: 2px; color: rgba(255,255,255,0.85); text-transform: uppercase;">DETAILING GARAGE® | CLAIMS & SURVEY DESK</div>
                                        <h1 style="margin: 6px 0 2px 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">Vehicle Insurance Claim Assessment</h1>
                                        <div style="font-size: 14px; color: #ffffff; font-weight: 600; opacity: 0.95;">Claim Dossier & Estimate Report for Deputed Surveyor</div>
                                    </td>
                                    <td align="right" style="vertical-align: top;">
                                        <span style="display: inline-block; padding: 6px 14px; background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.3); border-radius: 9999px; font-size: 11px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">
                                            ${isEv ? '⚡ EV CLAIM' : 'ACCIDENT CLAIM'}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 32px 36px;">
                            <p style="margin: 0 0 16px 0; font-size: 15px; color: #e4e4e7; line-height: 1.6;">
                                Respected Surveyor <strong>${surveyorName || 'Officer'}</strong>,
                            </p>
                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #a1a1aa; line-height: 1.6;">
                                Please find attached the complete <strong>Insurance Claim Assessment PDF Report</strong>, including vehicle damage evaluation, repair cost estimates, and inspection photographs for the vehicle registered below.
                            </p>

                            <!-- Key Claim Reference Card -->
                            <div style="background-color: #171b24; border: 1px solid rgba(22, 172, 212, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="width: 50%; padding-bottom: 12px;">
                                            <div style="font-size: 10px; font-weight: 800; color: #16acd4; text-transform: uppercase; letter-spacing: 1px;">Claim Number</div>
                                            <div style="font-size: 16px; font-weight: 900; color: #ffffff; font-family: monospace;">${claimNumber}</div>
                                        </td>
                                        <td style="width: 50%; padding-bottom: 12px;">
                                            <div style="font-size: 10px; font-weight: 800; color: #16acd4; text-transform: uppercase; letter-spacing: 1px;">Estimated Repair Amount</div>
                                            <div style="font-size: 16px; font-weight: 900; color: #22c55e;">${formattedAmount}</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="width: 50%;">
                                            <div style="font-size: 10px; font-weight: 800; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">Insurance Company</div>
                                            <div style="font-size: 13px; font-weight: 700; color: #ffffff;">${insuranceCompany}</div>
                                        </td>
                                        <td style="width: 50%;">
                                            <div style="font-size: 10px; font-weight: 800; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">Policy Number</div>
                                            <div style="font-size: 13px; font-weight: 700; color: #ffffff; font-family: monospace;">${policyNumber}</div>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Vehicle Details Table -->
                            <div style="background-color: #1a1e29; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
                                <div style="padding: 12px 18px; background-color: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 11px; font-weight: 900; color: #d4d4d8; text-transform: uppercase; letter-spacing: 1px;">
                                    🚗 Insured Vehicle Information
                                </div>
                                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                        <td style="padding: 10px 18px; color: #71717a; width: 40%;">Vehicle Make & Model:</td>
                                        <td style="padding: 10px 18px; color: #ffffff; font-weight: 700;">${vehicleMake} ${vehicleModel} ${vehicleVariant || ''} (${vehicleYear})</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                        <td style="padding: 10px 18px; color: #71717a;">Registration Number:</td>
                                        <td style="padding: 10px 18px; color: #00d4ff; font-weight: 900; font-family: monospace;">${registrationNumber}</td>
                                    </tr>
                                    ${customerName ? `
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                        <td style="padding: 10px 18px; color: #71717a;">Vehicle Owner / Insured:</td>
                                        <td style="padding: 10px 18px; color: #ffffff; font-weight: 600;">${customerName} ${customerMobile ? `(${customerMobile})` : ''}</td>
                                    </tr>
                                    ` : ''}
                                    ${incidentDate ? `
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                        <td style="padding: 10px 18px; color: #71717a;">Date of Incident:</td>
                                        <td style="padding: 10px 18px; color: #ffffff; font-weight: 600;">${incidentDate}</td>
                                    </tr>
                                    ` : ''}
                                    ${incidentLocation ? `
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                        <td style="padding: 10px 18px; color: #71717a;">Incident Location:</td>
                                        <td style="padding: 10px 18px; color: #ffffff; font-weight: 600;">${incidentLocation}</td>
                                    </tr>
                                    ` : ''}
                                    ${incidentDescription ? `
                                    <tr>
                                        <td style="padding: 10px 18px; color: #71717a; vertical-align: top;">Damage Brief:</td>
                                        <td style="padding: 10px 18px; color: #e4e4e7; font-size: 12px; line-height: 1.5;">${incidentDescription}</td>
                                    </tr>
                                    ` : ''}
                                </table>
                            </div>

                            ${customMessage ? `
                            <!-- Workshop Message to Surveyor -->
                            <div style="background-color: rgba(22, 172, 212, 0.08); border-left: 4px solid #16acd4; border-radius: 4px 12px 12px 4px; padding: 14px 18px; margin-bottom: 24px;">
                                <div style="font-size: 11px; font-weight: 800; color: #16acd4; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Message from Workshop Team:</div>
                                <div style="font-size: 13px; color: #e4e4e7; line-height: 1.5; white-space: pre-line;">${customMessage}</div>
                            </div>
                            ` : ''}

                            <!-- Attachment Notice Banner -->
                            <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(22, 172, 212, 0.12) 100%); border: 1px dashed rgba(34, 197, 94, 0.4); border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px;">
                                <div style="font-size: 14px; font-weight: 800; color: #22c55e; margin-bottom: 4px;">
                                    📎 Attached File: Insurance_Claim_${claimNumber}.pdf
                                </div>
                                <div style="font-size: 12px; color: #a1a1aa;">
                                    The full estimate sheet with part-wise breakdown & inspection photographs has been attached directly to this email.
                                </div>
                                ${pdfDownloadUrl ? `
                                <div style="margin-top: 14px;">
                                    <a href="${pdfDownloadUrl}" target="_blank" style="display: inline-block; padding: 10px 22px; background-color: #16acd4; color: #000000; font-size: 12px; font-weight: 900; text-decoration: none; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                                        View / Download PDF Online
                                    </a>
                                </div>
                                ` : ''}
                            </div>

                            <!-- Physical Inspection & Contact -->
                            <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 1.5;">
                                The vehicle is currently stationed at <strong>${workshopName || 'Detailing Garage Workshop'}</strong> and available for physical re-inspection/survey. Please let us know if additional documents or photos are required.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 36px; background-color: #0b0d12; border-top: 1px solid rgba(255,255,255,0.08); text-align: center;">
                            <div style="font-size: 12px; font-weight: 700; color: #d4d4d8; margin-bottom: 4px;">
                                ${workshopName || 'Detailing Garage'} – Premium Auto Protection & Bodycraft Studio
                            </div>
                            <div style="font-size: 11px; color: #52525b;">
                                Automated Claim Dispatch System • © ${new Date().getFullYear()} All Rights Reserved
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
};


