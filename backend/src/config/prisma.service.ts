import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { logger } from '../common/logger/logger';

// =============================================================================
// Global Prisma Client Declaration
// =============================================================================

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// =============================================================================
// Prisma Client Singleton
// =============================================================================

const createPrismaClient = (): PrismaClient => {
  // Optimize connection settings for performance
  const dbUrl = env.DATABASE_URL || '';
  const separator = dbUrl.includes('?') ? '&' : '?';
  // Optimized pool settings: pool_timeout=15 to wait briefly on cold start
  const optimizedUrl = `${dbUrl}${separator}pgbouncer=true&connection_limit=20&pool_timeout=15`;

  const client = new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
    datasources: {
      db: {
        url: optimizedUrl,
      },
    },
  });

  // =============================================================================
  // Logging Middleware
  // =============================================================================

  // Log slow queries (>300ms) for performance monitoring
  client.$on('query', (e: { query: string; duration: number; params: string }) => {
    if (e.duration > 300) {
      logger.warn(
        {
          query: e.query.substring(0, 500), // Truncate long queries
          duration: e.duration,
          params: e.params ? e.params.substring(0, 200) : undefined,
        },
        'Slow Prisma Query detected'
      );
    }
  });

  client.$on('error', (e: { message: string }) => {
    logger.error({ error: e.message }, 'Prisma Error');
  });

  client.$on('warn', (e: { message: string }) => {
    logger.warn({ warning: e.message }, 'Prisma Warning');
  });

  // =============================================================================
  // Soft Delete Middleware
  // =============================================================================

  client.$use(async (params, next) => {
    const modelsWithSoftDelete = [
      'Tenant',
      'User',
      'Branch',
      'AcademicSession',
    ];

    if (params.model && modelsWithSoftDelete.includes(params.model)) {
      if (params.action === 'delete') {
        params.action = 'update';
        params.args.data = { deletedAt: new Date() };
      }

      if (params.action === 'deleteMany') {
        params.action = 'updateMany';
        params.args.data = { deletedAt: new Date() };
      }

      // Automatically filter out soft-deleted records
      if (params.action === 'findUnique' || params.action === 'findFirst') {
        params.args.where = {
          ...params.args.where,
          deletedAt: null,
        };
      }

      if (params.action === 'findMany') {
        if (!params.args.where) {
          params.args.where = {};
        }
        if (!params.args.where.deletedAt) {
          params.args.where.deletedAt = null;
        }
      }
    }

    return next(params);
  });

  // =============================================================================
  // Tenant Isolation Middleware
  // =============================================================================

  client.$use(async (params, next) => {
    const tenantIsolatedModels = [
      'User',
      'Role',
      'Branch',
      'AcademicSession',
      'InstitutionProfile',
      'TenantSettings',
      'TenantBranding',
      'AuditLog',
      'OnboardingProgress',
      'PlanSubscription',
      'TenantFeature',
    ];

    if (params.model && tenantIsolatedModels.includes(params.model)) {
      // Add tenant context check for create operations
      if (
        params.action === 'create' ||
        params.action === 'createMany' ||
        params.action === 'upsert'
      ) {
        if (!params.args.data?.tenantId && !params.args.where?.tenantId) {
          logger.warn(
            { model: params.model, action: params.action },
            'Tenant ID missing in tenant-isolated operation'
          );
        }
      }
    }

    return next(params);
  });

  // =============================================================================
  // Audit Logging Middleware (Disabled for performance)
  // =============================================================================

  // client.$use(async (params, next) => {
  //   const actionsToLog = ['create', 'update', 'delete', 'upsert', 'updateMany', 'deleteMany'];

  //   if (params.model && actionsToLog.includes(params.action)) {
  //     const before = Date.now();
  //     const result = await next(params);
  //     const after = Date.now();

  //     logger.debug(
  //       {
  //         model: params.model,
  //         action: params.action,
  //         duration: after - before,
  //       },
  //       'Database operation completed'
  //     );

  //     return result;
  //   }

  //   return next(params);
  // });

  return client;
};

// =============================================================================
// Singleton Instance
// =============================================================================

export const prisma = global.prisma ?? createPrismaClient();

if (!global.prisma) {
  global.prisma = prisma;
  logger.info('Prisma Client initialized (singleton)');
}

// =============================================================================
// Connection Management
// =============================================================================

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error({ error }, 'Database connection failed');
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error({ error }, 'Database disconnection failed');
    throw error;
  }
};

// =============================================================================
// Health Check
// =============================================================================

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error({ error }, 'Database health check failed');
    return false;
  }
};
