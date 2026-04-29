import { app } from './app';
import { env } from './config/env';
import { logger } from './common/logger/logger';
import { connectDatabase, disconnectDatabase } from './config/prisma.service';

// =============================================================================
// Server Configuration
// =============================================================================

const PORT = env.PORT;
const NODE_ENV = env.NODE_ENV;

// =============================================================================
// Graceful Shutdown Handler
// =============================================================================

const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info({ signal }, 'Received shutdown signal, starting graceful shutdown...');

  try {
    // Disconnect from database
    await disconnectDatabase();
    logger.info('Database connections closed');

    // Exit process
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error during graceful shutdown');
    process.exit(1);
  }
};

// =============================================================================
// Process Event Handlers
// =============================================================================

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.fatal({ error }, 'Uncaught Exception');
  
  // Give logger time to flush before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.fatal({ reason, promise }, 'Unhandled Promise Rejection');
  
  // Give logger time to flush before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// =============================================================================
// Start Server
// =============================================================================

const startServer = async (): Promise<void> => {
  try {
    logger.info({ environment: NODE_ENV, port: PORT }, 'Starting server...');

    // Connect to database
    await connectDatabase();
    logger.info('Database connection established');

    // Warmup database connection pool
    const { prisma } = await import('./config/prisma.service');
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection pool warmed up');

    // Start HTTP server
    app.listen(PORT, () => {
      logger.info(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 Idara Management System API                          ║
║                                                            ║
║   Environment: ${NODE_ENV.padEnd(37)}║
║   Port:       ${PORT.toString().padEnd(37)}║
║   Health:     http://localhost:${PORT}/api/health${' '.repeat(14 - PORT.toString().length)}║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.fatal({ error }, 'Failed to start server');
    process.exit(1);
  }
};

// Start the server
startServer();

// Export for testing
export { startServer };
