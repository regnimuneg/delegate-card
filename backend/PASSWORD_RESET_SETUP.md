# Password Reset Setup Guide

## Email Configuration

The password reset feature requires SMTP email configuration. Add these environment variables to your `backend/.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=registration.nimun@nu.edu.eg
SMTP_PASSWORD=your_email_password_or_app_password

# Frontend URL (for reset links)
FRONTEND_URL=http://localhost:5173
```

## Gmail Setup

If using Gmail, you'll need to:

1. **Enable 2-Factor Authentication** on the Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this app password (not your regular password) in `SMTP_PASSWORD`

## Other Email Providers

For other SMTP providers (Outlook, SendGrid, etc.), adjust:
- `SMTP_HOST`: Your provider's SMTP server
- `SMTP_PORT`: Usually 587 (TLS) or 465 (SSL)
- `SMTP_SECURE`: `true` for port 465, `false` for port 587

## Testing

After configuration, test the email setup:

```bash
node -e "import('./src/utils/email.js').then(m => m.testEmailConfig())"
```

## Database Migration

Run the updated schema to add the `password_reset_tokens` table:

1. Open Supabase SQL Editor
2. Run `backend/src/db/schema.sql` (or just the password_reset_tokens table section)

## Installation

Install the nodemailer dependency:

```bash
cd backend
npm install
```

