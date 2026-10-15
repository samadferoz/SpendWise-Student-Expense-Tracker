import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import transactionRoutes from './routes/transactionRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initDatabase, isCloudantConfigured, DB_NAME } from './config/cloudant.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend clients (dev server, Docker host, etc.)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// API Routes
app.use('/api', transactionRoutes);

// Root route for API welcome / status
app.get('/', (req, res) => {
  res.json({
    project: 'SpendWise — Student Expense Tracker API',
    status: 'online',
    version: '1.0.0',
    database: DB_NAME,
    documentation: '/api/health',
    endpoints: [
      'GET    /api/health',
      'GET    /api/transactions',
      'GET    /api/transactions/:id',
      'POST   /api/transactions',
      'PUT    /api/transactions/:id',
      'DELETE /api/transactions/:id'
    ]
  });
});

// 404 Route Not Found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling
app.use(errorHandler);

// Start Server and attempt Cloudant connection
const startServer = async () => {
  app.listen(PORT, async () => {
    console.log('====================================================');
    console.log(`🚀 SpendWise Backend running at http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Cloudant configured: ${isCloudantConfigured() ? 'YES' : 'NO'}`);
    console.log('====================================================');

    if (isCloudantConfigured()) {
      try {
        await initDatabase();
      } catch (err) {
        console.error('⚠️ [SpendWise] Initial Cloudant connection test failed:', err.message);
        console.error('   Please verify CLOUDANT_URL and CLOUDANT_APIKEY in backend/.env');
      }
    } else {
      console.warn('⚠️ [SpendWise] CLOUDANT_URL or CLOUDANT_APIKEY missing in environment.');
      console.warn('   Create a .env file based on .env.example with your IBM Cloudant credentials.');
    }
  });
};

startServer();

export default app;
