import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { testConnection } from './config/database.js';
import { validateEnvironment } from './utils/validateEnv.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { log, logError } from './utils/logger.js';

// Import routes
import authRoutes from './routes/auth.js';
import vouchersRoutes from './routes/vouchers.js';
import rewardsRoutes from './routes/rewards.js';
import dashboardRoutes from './routes/dashboard.js';
import profileRoutes from './routes/profile.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - allow localhost and network IPs in development
const isDevelopment = process.env.NODE_ENV !== 'production';
const CORS_ORIGIN = process.env.CORS_ORIGIN;

// Security headers
app.use(helmet({
    contentSecurityPolicy: isDevelopment ? false : undefined, // Disable in dev for easier debugging
    crossOriginEmbedderPolicy: false // Allow embedding if needed
}));

// CORS - strict in production
app.use(cors({
    origin: isDevelopment && !CORS_ORIGIN
        ? true // Allow all origins in development (for mobile testing)
        : CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'NIMUN Card API is running',
        timestamp: new Date().toISOString()
    });
});

// Database connection test
app.get('/health/db', async (req, res) => {
    const result = await testConnection();
    if (result.success) {
        res.json({
            success: true,
            message: 'Database connection successful'
        });
    } else {
        res.status(500).json({
            success: false,
            error: result.error
        });
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vouchers', vouchersRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

/**
 * Start server with database connection verification
 */
async function startServer() {
    // Validate environment variables
    if (!validateEnvironment()) {
        process.exit(1);
    }

    log('🔍 Verifying database connection...\n');

    // Test database connection before starting server
    const dbTest = await testConnection();
    
    if (!dbTest.success) {
        logError('❌ Database connection failed!', { error: dbTest.error });
        if (isDevelopment) {
            console.error('💡 Troubleshooting:');
            console.error('   1. Check your .env file has correct Supabase credentials');
            console.error('   2. Verify SUPABASE_URL starts with https:// (not db.)');
            console.error('   3. Make sure your Supabase project is active');
            console.error('   4. Run: npm run verify (to check configuration)\n');
        }
        process.exit(1);
    }

    log('✅ Database connection verified!\n');

    // Start server - Render provides PORT via environment variable
    // Listen on all interfaces (0.0.0.0) for Render deployment
    const HOST = '0.0.0.0';
    const SERVER_PORT = process.env.PORT || PORT;
    app.listen(SERVER_PORT, HOST, () => {
        if (isDevelopment) {
            console.log('═══════════════════════════════════════════════════');
            console.log(`🚀 NIMUN Card API server running on port ${PORT}`);
            console.log(`📡 CORS enabled for: ${isDevelopment && !CORS_ORIGIN ? 'All origins (dev mode)' : CORS_ORIGIN || 'http://localhost:5173'}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`💾 Database: Connected`);
            console.log('═══════════════════════════════════════════════════\n');
            console.log(`📍 Local: http://localhost:${SERVER_PORT}/health`);
            console.log(`📍 Network: http://192.168.1.2:${SERVER_PORT}/health (use your actual IP)`);
            console.log(`📍 DB check: http://localhost:${SERVER_PORT}/health/db\n`);
        } else {
            log(`🚀 NIMUN Card API server running on port ${PORT}`);
            log(`🌍 Environment: production`);
            log(`💾 Database: Connected`);
        }
    });
}

// Start the server
startServer().catch((error) => {
    logError('❌ Failed to start server', error);
    process.exit(1);
});

export default app;

