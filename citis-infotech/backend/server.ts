import 'dotenv/config';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB, disconnectDB } from './config/db';
import { AppError, errorHandler, notFound } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { getUploadsRoot } from './middleware/upload';
import routes from './routes';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

const origins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',').map((origin) => origin.trim()).filter(Boolean);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origins.includes(origin)) return callback(null, true);
    return callback(new AppError('Origin not allowed by CORS', 403));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api', generalLimiter);

// Local disk storage for media, resumes, and images (no paid CDN required)
app.use(
  '/uploads',
  express.static(getUploadsRoot(), {
    fallthrough: true,
    maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0,
  }),
);

app.get('/health', (_req, res) => res.status(200).json({
  success: true, status: 'ok', timestamp: new Date().toISOString(),
}));
app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 5000);
let server: ReturnType<typeof app.listen> | undefined;

const start = async () => {
  for (const name of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']) {
    if (!process.env[name] || process.env[name]!.length < 32) {
      throw new Error(`${name} must contain at least 32 characters`);
    }
  }
  await connectDB();
  server = app.listen(port, () => console.log(`API listening on port ${port}`));
};

const shutdown = (signal: string) => {
  console.log(`${signal} received; shutting down`);
  server?.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

if (require.main === module) {
  start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (error) => console.error('Unhandled rejection:', error));
}

export { app, start };
