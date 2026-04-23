import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../errors';
import { logger } from '../logger/logger';
import { isProduction } from '../../config/env';

// =============================================================================
// Error Response Interface
// =============================================================================

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    stack?: string;
  };
  requestId?: string;
  timestamp: string;
}

// =============================================================================
// Global Error Handler Middleware
// =============================================================================

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err;
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let errorDetails: Record<string, unknown> | undefined;

  // Generate request ID for error tracking
  const requestId = req.headers['x-request-id'] as string || 
                    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // =============================================================================
  // Handle Specific Error Types
  // =============================================================================

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));

    error = new ValidationError('Validation failed', 'VALIDATION_ERROR', {
      errors: validationErrors,
    });
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case 'P2002':
        error = new AppError(
          'A record with this value already exists',
          409,
          'DUPLICATE_RECORD',
          true,
          { fields: prismaError.meta?.target }
        );
        break;
      case 'P2025':
        error = new AppError(
          'Record not found',
          404,
          'RECORD_NOT_FOUND',
          true,
          prismaError.meta
        );
        break;
      case 'P2003':
        error = new AppError(
          'Foreign key constraint failed',
          400,
          'FOREIGN_KEY_VIOLATION',
          true,
          prismaError.meta
        );
        break;
      default:
        logger.error({ 
          prismaCode: prismaError.code, 
          prismaMeta: prismaError.meta,
          requestId 
        }, 'Unhandled Prisma error');
        
        error = new AppError(
          'Database error occurred',
          500,
          'DATABASE_ERROR',
          false,
          { code: prismaError.code }
        );
    }
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    error = new AppError(
      'Invalid token',
      401,
      'INVALID_TOKEN',
      true
    );
  }

  if (error.name === 'TokenExpiredError') {
    error = new AppError(
      'Token has expired',
      401,
      'TOKEN_EXPIRED',
      true
    );
  }

  // Handle AppError
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    errorCode = error.code;
    errorDetails = error.details;

    // Log operational vs programming errors differently
    if (error.isOperational) {
      logger.warn(
        {
          requestId,
          code: errorCode,
          statusCode,
          message: error.message,
          path: req.path,
          method: req.method,
          userId: (req as { user?: { userId: string } }).user?.userId,
          tenantId: (req as { tenantContext?: { tenantId: string } }).tenantContext?.tenantId,
        },
        'Operational error occurred'
      );
    } else {
      logger.error(
        {
          requestId,
          code: errorCode,
          statusCode,
          message: error.message,
          stack: error.stack,
          path: req.path,
          method: req.method,
          userId: (req as { user?: { userId: string } }).user?.userId,
          tenantId: (req as { tenantContext?: { tenantId: string } }).tenantContext?.tenantId,
        },
        'Programming error occurred'
      );
    }
  } else {
    // Unknown error
    logger.error(
      {
        requestId,
        errorName: error.name,
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
      },
      'Unhandled error occurred'
    );
  }

  // =============================================================================
  // Build Error Response
  // =============================================================================

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message: isProduction() && !(error instanceof AppError) 
        ? 'An unexpected error occurred' 
        : error.message,
      details: errorDetails,
    },
    requestId,
    timestamp: new Date().toISOString(),
  };

  // Include stack trace in development
  if (!isProduction() && error.stack) {
    errorResponse.error.stack = error.stack;
  }

  // Send response
  res.status(statusCode).json(errorResponse);
};

// =============================================================================
// 404 Not Found Handler
// =============================================================================

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = req.headers['x-request-id'] as string ||
                    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  logger.warn(
    {
      requestId,
      path: req.path,
      method: req.method,
    },
    'Route not found'
  );

  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
    requestId,
    timestamp: new Date().toISOString(),
  });
};

// =============================================================================
// Async Handler Wrapper
// Wraps async route handlers to catch errors
// =============================================================================

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
