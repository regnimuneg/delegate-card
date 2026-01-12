import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { testConnection } from './config/database.js';

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

// Middleware
app.use(cors({
    origin: isDevelopment && !CORS_ORIGIN
        ? true // Allow all origins in development (for mobile testing)
        : CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    console.log('🔍 Verifying database connection...\n');

    // Test database connection before starting server
    const dbTest = await testConnection();
    
    if (!dbTest.success) {
        console.error('❌ Database connection failed!');
        console.error(`   Error: ${dbTest.error}\n`);
        console.error('💡 Troubleshooting:');
        console.error('   1. Check your .env file has correct Supabase credentials');
        console.error('   2. Verify SUPABASE_URL starts with https:// (not db.)');
        console.error('   3. Make sure your Supabase project is active');
        console.error('   4. Run: npm run verify (to check configuration)\n');
        console.error('📖 See backend/TROUBLESHOOTING.md for more help\n');
        process.exit(1);
    }

    console.log('✅ Database connection verified!\n');

    // Start server - listen on all network interfaces for mobile access
    const HOST = isDevelopment ? '0.0.0.0' : 'localhost';
    app.listen(PORT, HOST, () => {
        console.log('═══════════════════════════════════════════════════');
        console.log(`🚀 NIMUN Card API server running on port ${PORT}`);
        console.log(`📡 CORS enabled for: ${isDevelopment && !CORS_ORIGIN ? 'All origins (dev mode)' : CORS_ORIGIN || 'http://localhost:5173'}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`💾 Database: Connected`);
        console.log('═══════════════════════════════════════════════════\n');
        console.log(`📍 Local: http://localhost:${PORT}/health`);
        console.log(`📍 Network: http://192.168.1.2:${PORT}/health (use your actual IP)`);
        console.log(`📍 DB check: http://localhost:${PORT}/health/db\n`);
    });
}

// Start the server
startServer().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});

export default app;

