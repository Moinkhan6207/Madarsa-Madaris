import rateLimit from 'express-rate-limit';
import { AppError } from '../errors/AppError';
import { Request, Response } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message: string;
}

export const createRateLimiter = (options: RateLimitOptions) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req: Request, _res: Response) => {
      const remainingTime = Math.ceil(options.windowMs / 1000 / 60);
      throw new AppError(
        options.message || `Too many requests, please try again after ${remainingTime} minutes`,
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    },
    // Use the id as part of the key if available, otherwise fallback to IP
    keyGenerator: (req) => {
      return (req as any).user?.id || (req as any).context?.tenantId || req.ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    },
    validate: { xForwardedForHeader: false },
  });
};

// ─── Specific Limiters ───────────────────────────────────────────────────────

// Auth routes: /api/v1/auth/* (5 requests per minute)
export const authRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts. Please try again after a minute.'
});

// Tenant creation: /api/platform/tenants (3 requests per minute)
export const tenantCreationRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  max: 3,
  message: 'Tenant creation limit exceeded. Please try again later.'
});

// General API (100 requests per minute)
export const apiRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: 'API rate limit exceeded. Please slow down.'
});

// Onboarding finalize (2 requests per minute)
export const onboardingFinalizeRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  max: 2,
  message: 'Onboarding finalization limit exceeded.'
});
