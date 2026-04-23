/**
 * Base application error class
 * Used for all custom errors in the application
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: Record<string, unknown>
  ) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 - Bad Request Error
 */
export class BadRequestError extends AppError {
  constructor(
    message: string = 'Bad Request',
    code: string = 'BAD_REQUEST',
    details?: Record<string, unknown>
  ) {
    super(message, 400, code, true, details);
  }
}

/**
 * 401 - Unauthorized Error
 */
export class UnauthorizedError extends AppError {
  constructor(
    message: string = 'Unauthorized',
    code: string = 'UNAUTHORIZED',
    details?: Record<string, unknown>
  ) {
    super(message, 401, code, true, details);
  }
}

/**
 * 403 - Forbidden Error
 */
export class ForbiddenError extends AppError {
  constructor(
    message: string = 'Forbidden',
    code: string = 'FORBIDDEN',
    details?: Record<string, unknown>
  ) {
    super(message, 403, code, true, details);
  }
}

/**
 * 404 - Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(
    message: string = 'Resource not found',
    code: string = 'NOT_FOUND',
    details?: Record<string, unknown>
  ) {
    super(message, 404, code, true, details);
  }
}

/**
 * 409 - Conflict Error
 */
export class ConflictError extends AppError {
  constructor(
    message: string = 'Conflict',
    code: string = 'CONFLICT',
    details?: Record<string, unknown>
  ) {
    super(message, 409, code, true, details);
  }
}

/**
 * 422 - Unprocessable Entity (Validation Error)
 */
export class ValidationError extends AppError {
  constructor(
    message: string = 'Validation failed',
    code: string = 'VALIDATION_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message, 422, code, true, details);
  }
}

/**
 * 429 - Too Many Requests Error
 */
export class TooManyRequestsError extends AppError {
  constructor(
    message: string = 'Too many requests',
    code: string = 'TOO_MANY_REQUESTS',
    details?: Record<string, unknown>
  ) {
    super(message, 429, code, true, details);
  }
}

/**
 * 500 - Internal Server Error
 */
export class InternalServerError extends AppError {
  constructor(
    message: string = 'Internal server error',
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message, 500, code, false, details);
  }
}

/**
 * 503 - Service Unavailable Error
 */
export class ServiceUnavailableError extends AppError {
  constructor(
    message: string = 'Service unavailable',
    code: string = 'SERVICE_UNAVAILABLE',
    details?: Record<string, unknown>
  ) {
    super(message, 503, code, false, details);
  }
}

/**
 * Database Error
 */
export class DatabaseError extends AppError {
  constructor(
    message: string = 'Database error occurred',
    code: string = 'DATABASE_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message, 500, code, false, details);
  }
}

/**
 * External Service Error
 */
export class ExternalServiceError extends AppError {
  constructor(
    message: string = 'External service error',
    code: string = 'EXTERNAL_SERVICE_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message, 502, code, false, details);
  }
}

/**
 * Onboarding Finalization Blocked Error
 * Thrown when onboarding cannot be finalized due to incomplete requirements
 */
export class OnboardingFinalizationBlockedError extends AppError {
  constructor(
    message: string = 'Onboarding cannot be finalized',
    missing: string[] = [],
    details?: Record<string, unknown>
  ) {
    super(
      message,
      422,
      'ONBOARDING_FINALIZATION_BLOCKED',
      true,
      {
        ...details,
        missing,
        missingRequirements: missing,
      }
    );
  }
}
