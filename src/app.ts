import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { errorHandler } from './middlewares';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(compression());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// 404 handler
app.use((_req, res, _next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
