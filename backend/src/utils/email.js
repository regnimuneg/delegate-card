import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Send email using Resend HTTP API (works on Render - no SMTP ports needed)
 * Falls back to SMTP for local development
 */
async function sendEmailViaResend(to, subject, html, text, from) {
    if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not set');
    }

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: from || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: [to],
            subject: subject,
            html: html,
            text: text
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email via Resend');
    }

    return await response.json();
}

/**
 * Create email transporter (for local development with SMTP)
 * Note: Render blocks SMTP ports 25, 465, 587 - use Resend API in production
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000
    });
};

/**
 * Send password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} firstName - User's first name
 * @returns {Promise<Object>} - Email send result
 */
export async function sendPasswordResetEmail(to, resetToken, firstName = 'Delegate') {
    // Reset URL - adjust based on your frontend URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.SMTP_USER || 'reg.nimun.eg@gmail.com';
    const from = `"NIMUN'26" <${fromEmail}>`;
    const subject = 'Reset Your NIMUN\'26 Delegate Portal Password';
    
    const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #0037C0; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; background: #0037C0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>NIMUN'26</h1>
                        <p>Delegate Portal</p>
                    </div>
                    <div class="content">
                        <h2>Password Reset Request</h2>
                        <p>Hello ${firstName},</p>
                        <p>We received a request to reset your password for your NIMUN'26 Delegate Portal account.</p>
                        <p>Click the button below to reset your password:</p>
                        <a href="${resetUrl}" class="button">Reset Password</a>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #0037C0;">${resetUrl}</p>
                        <p><strong>This link will expire in 1 hour.</strong></p>
                        <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                        <p style="font-size: 12px; color: #666;">
                            Best regards,<br>
                            NIMUN'26 Registration Team
                        </p>
                    </div>
                    <div class="footer">
                        <p>This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    
    const text = `
            NIMUN'26 Delegate Portal - Password Reset
            
            Hello ${firstName},
            
            We received a request to reset your password for your NIMUN'26 Delegate Portal account.
            
            Click the following link to reset your password:
            ${resetUrl}
            
            This link will expire in 1 hour.
            
            If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            
            Best regards,
            NIMUN'26 Registration Team
        `;

    try {
        // Use Resend API if available (works on Render - no SMTP ports needed)
        if (process.env.RESEND_API_KEY) {
            const result = await sendEmailViaResend(to, subject, html, text, from);
            return { success: true, messageId: result.id };
        }
        
        // Fallback to SMTP (for local development only - won't work on Render free tier)
        const transporter = createTransporter();
        const info = await transporter.sendMail({
            from: from,
            to: to,
            subject: subject,
            html: html,
            text: text
        });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        // Error is logged by caller
        throw error;
    }
}

/**
 * Test email configuration
 */
export async function testEmailConfig() {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

