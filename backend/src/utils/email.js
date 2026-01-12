import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Create email transporter
 * Uses SMTP configuration from environment variables
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER || 'registration.nimun@nu.edu.eg',
            pass: process.env.SMTP_PASSWORD
        }
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
    const transporter = createTransporter();
    
    // Reset URL - adjust based on your frontend URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: `"NIMUN'26" <${process.env.SMTP_USER || 'registration.nimun@nu.edu.eg'}>`,
        to: to,
        subject: 'Reset Your NIMUN\'26 Delegate Portal Password',
        html: `
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
        `,
        text: `
            NIMUN'26 Delegate Portal - Password Reset
            
            Hello ${firstName},
            
            We received a request to reset your password for your NIMUN'26 Delegate Portal account.
            
            Click the following link to reset your password:
            ${resetUrl}
            
            This link will expire in 1 hour.
            
            If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            
            Best regards,
            NIMUN'26 Registration Team
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending password reset email:', error);
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
        console.log('✅ Email server is ready to send messages');
        return { success: true };
    } catch (error) {
        console.error('❌ Email server configuration error:', error);
        return { success: false, error: error.message };
    }
}

