/**
 * Validate required environment variables for production
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Validate all required environment variables
 */
export function validateEnvironment() {
    const errors = [];

    // Required for all environments
    const required = [
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY'
    ];

    // Required for production
    const productionRequired = [
        'JWT_SECRET',
        'CORS_ORIGIN',
        'FRONTEND_URL',
        'SMTP_HOST',
        'SMTP_USER',
        'SMTP_PASSWORD'
    ];

    // Check required variables
    for (const key of required) {
        if (!process.env[key]) {
            errors.push(`Missing required environment variable: ${key}`);
        }
    }

    // Check production-specific variables
    if (isProduction) {
        for (const key of productionRequired) {
            if (!process.env[key]) {
                errors.push(`Missing required production environment variable: ${key}`);
            }
        }

        // Validate JWT_SECRET strength
        const jwtSecret = process.env.JWT_SECRET;
        if (jwtSecret) {
            if (jwtSecret.length < 32) {
                errors.push('JWT_SECRET must be at least 32 characters long');
            }
            if (jwtSecret === 'change-this-in-production') {
                errors.push('JWT_SECRET must be changed from default value');
            }
        }

        // Validate CORS_ORIGIN is a valid URL
        const corsOrigin = process.env.CORS_ORIGIN;
        if (corsOrigin && !corsOrigin.startsWith('http://') && !corsOrigin.startsWith('https://')) {
            errors.push('CORS_ORIGIN must be a valid URL (http:// or https://)');
        }

        // Validate FRONTEND_URL is a valid URL
        const frontendUrl = process.env.FRONTEND_URL;
        if (frontendUrl && !frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
            errors.push('FRONTEND_URL must be a valid URL (http:// or https://)');
        }
    }

    if (errors.length > 0) {
        console.error('❌ Environment validation failed:\n');
        errors.forEach(error => console.error(`   - ${error}`));
        console.error('\n💡 Please check your .env file and ensure all required variables are set.\n');
        return false;
    }

    return true;
}
