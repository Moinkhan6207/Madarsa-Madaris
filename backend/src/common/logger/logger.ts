import pino from 'pino';
import path from 'path';
import { env, isDevelopment } from '../../config/env';

// =============================================================================
// Pino Logger Configuration
// =============================================================================

const loggerConfig: pino.LoggerOptions = {
  level: env.LOG_LEVEL,
  base: {
    pid: process.pid,
    env: env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'password',
      '*.password',
      'token',
      '*.token',
      'authorization',
      '*.authorization',
      'cookie',
      '*.cookie',
      'secret',
      '*.secret',
      'jwt',
      '*.jwt',
      'apiKey',
      '*.apiKey',
      'creditCard',
      '*.creditCard',
      'ssn',
      '*.ssn',
    ],
    remove: true,
  },
};

// =============================================================================
// Pretty Print for Development
// =============================================================================

const streams: pino.TransportTargetOptions[] = [
  {
    target: 'pino/file',
    options: { 
      destination: path.join(process.cwd(), env.LOG_FILE || 'logs/app.log'),
      mkdir: true 
    },
    level: env.LOG_LEVEL,
  },
];

if (isDevelopment()) {
  streams.push({
    target: 'pino-pretty',
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
      messageFormat: '{msg}',
    },
    level: env.LOG_LEVEL,
  });
}

const transport = pino.transport({ targets: streams });

// =============================================================================
// Logger Instance
// =============================================================================

export const logger = pino(loggerConfig, transport);

// =============================================================================
// Child Loggers
// =============================================================================

export const createModuleLogger = (module: string): pino.Logger => {
  return logger.child({ module });
};

export const createRequestLogger = (
  requestId: string,
  tenantId?: string,
  userId?: string
): pino.Logger => {
  return logger.child({
    requestId,
    tenantId,
    userId,
  });
};

// =============================================================================
// Request Context Logging Helper
// =============================================================================

interface LogContext {
  requestId?: string;
  tenantId?: string;
  userId?: string;
  path?: string;
  method?: string;
  [key: string]: unknown;
}

export const logWithContext = (
  level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace',
  message: string,
  context: LogContext,
  error?: Error
): void => {
  const childLogger = logger.child(context);

  if (error) {
    childLogger[level]({ err: error }, message);
  } else {
    childLogger[level](message);
  }
};

// =============================================================================
// Performance Logging
// =============================================================================

export const createPerformanceLogger = (operation: string): {
  start: () => void;
  end: () => number;
} => {
  let startTime: number;

  return {
    start: (): void => {
      startTime = performance.now();
      logger.debug({ operation }, `${operation} started`);
    },
    end: (): number => {
      const duration = performance.now() - startTime;
      logger.debug({ operation, duration: `${duration.toFixed(2)}ms` }, `${operation} completed`);
      return duration;
    },
  };
};
