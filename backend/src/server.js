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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(cors({
    origin: CORS_ORIGIN,
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

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 NIMUN Card API server running on port ${PORT}`);
    console.log(`📡 CORS enabled for: ${CORS_ORIGIN}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

