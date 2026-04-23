import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import { env } from './config/env';
import { errorMiddleware, notFoundMiddleware } from './common/middleware/error.middleware';
import { requestContextMiddleware, requestLoggingMiddleware } from './common/middleware/request-context.middleware';
import { tenantRoutes } from './modules/tenant/routes/tenant.routes';
import { platformTenantRoutes } from './modules/platform/routes/platform-tenant.routes';
import { authRoutes } from './modules/auth/routes/auth.routes';
import { publicRoutes } from './modules/public/routes/public.routes';

import { 
  apiRateLimiter, 
  authRateLimiter, 
  tenantCreationRateLimiter,
  onboardingFinalizeRateLimiter 
} from './common/middleware/rate-limit.middleware';
import { loggerContextMiddleware } from './common/middleware/logger-context.middleware';

const app: Application = express();

app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-ID',
    'X-Correlation-ID',
    'X-Tenant-ID',
  ],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(requestContextMiddleware);
app.use(requestLoggingMiddleware);
app.use(loggerContextMiddleware);

// Apply general API rate limiter
app.use('/api', apiRateLimiter);

app.get('/api/health', (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    },
  });
});

app.get('/api/health/detailed', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { checkDatabaseHealth } = await import('./config/prisma.service');
    const dbHealthy = await checkDatabaseHealth();
    res.status(dbHealthy ? 200 : 503).json({
      success: true,
      data: {
        status: dbHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        services: {
          database: dbHealthy ? 'connected' : 'disconnected',
          api: 'running',
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

const prefix = env.API_PREFIX; // /api/v1

// Platform super-admin routes
app.use(`${prefix}/platform/tenants`, tenantCreationRateLimiter, platformTenantRoutes);

// Auth routes (Public)
app.use(`${prefix}/auth`, authRateLimiter, authRoutes);

// Onboarding finalize special limit
app.use(`${prefix}/tenant/onboarding/finalize`, onboardingFinalizeRateLimiter);

// Tenant-scoped routes: /api/v1/tenant/*
app.use(`${prefix}/tenant`, tenantRoutes);

// Public routes: /api/v1/public/*
app.use(`${prefix}/public`, publicRoutes);

app.get('/', (_req: Request, res: Response): void => {
  res.json({
    name: 'Idara Management System API',
    version: '1.0.0',
    environment: env.NODE_ENV,
    documentation: '/api/docs',
    health: '/api/health',
  });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export { app };
