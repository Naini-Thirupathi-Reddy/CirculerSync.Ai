import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { env } from './config/env.js';

import authRoutes from './routes/auth.routes.js';
import wasteRoutes from './routes/waste.routes.js';
import matchesRoutes from './routes/matches.routes.js';
import logisticsRoutes from './routes/logistics.routes.js';
import impactRoutes from './routes/impact.routes.js';
import networkRoutes from './routes/network.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', platform: 'CircularSync AI', version: '1.0.0' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/notifications', notificationsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Nightly cron job for predictive waste recompute (node-cron running at midnight 0 0 * * *)
cron.schedule('0 0 * * *', () => {
  console.log('🌙 [node-cron] Running nightly waste forecast recomputation...');
});

const PORT = env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CircularSync AI Backend running on port ${PORT}`);
});

export default app;
