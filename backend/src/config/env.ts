import { config } from 'dotenv';
import { z } from 'zod';

config();

// =============================================================================
// Environment Schema Validation
// =============================================================================

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  API_PREFIX: z.string().default('/api/v1'),

  // Database (NeonDB)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  CORS_ORIGIN: z.string().default('*'),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_FILE: z.string().default('logs/app.log'),

  // Tenant
  DEFAULT_TENANT_SUBDOMAIN: z.string().default('default'),
  MAX_TENANTS_PER_USER: z.string().transform(Number).default('5'),

  // Email (SMTP)
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.string().transform(Number).default('1025'), // Default MailHog port
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('no-reply@madarsa.cloud'),
});

// =============================================================================
// Parse and Validate Environment
// =============================================================================

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:');
  parsedEnv.error.issues.forEach((issue) => {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  });
  throw new Error('Missing required environment variables');
}

export const env = parsedEnv.data;

// =============================================================================
// Helper Functions
// =============================================================================

export const isDevelopment = (): boolean => env.NODE_ENV === 'development';
export const isProduction = (): boolean => env.NODE_ENV === 'production';
export const isTest = (): boolean => env.NODE_ENV === 'test';
