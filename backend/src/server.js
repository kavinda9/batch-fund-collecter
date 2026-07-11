// backend/src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import contributionRoutes from './routes/contributionRoutes.js';
import authRoutes from './routes/authRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// Global Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing for frontend access
app.use(express.json()); // Enable JSON body parsing for inbound payloads

// Application Route Gateways
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/admin', adminRoutes);

// Base System Health-Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uploader: 'solo-dev'
  });
});

// Fallback Route for 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Fallback Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred.'
  });
});

// Start the Express Engine
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 API Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

export default app;