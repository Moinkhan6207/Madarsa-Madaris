// =============================================================================
// API Error Types
// Standardized error handling across the frontend
// =============================================================================

export interface ApiErrorResponse {
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

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
  requestId?: string;
  timestamp: string;
  isOperational: boolean;
}

export type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'TOO_MANY_REQUESTS'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'DATABASE_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'DUPLICATE_RECORD'
  | 'RECORD_NOT_FOUND'
  | 'FOREIGN_KEY_VIOLATION'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'ROUTE_NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'UNKNOWN_ERROR';

export interface ValidationErrorDetail {
  path: string;
  message: string;
  code: string;
}

export interface ValidationApiError extends ApiError {
  code: 'VALIDATION_ERROR';
  details: {
    errors: ValidationErrorDetail[];
  };
}

export const isValidationError = (error: ApiError): error is ValidationApiError => {
  return error.code === 'VALIDATION_ERROR' && error.details?.errors !== undefined;
};

export const isUnauthorizedError = (error: ApiError): boolean => {
  return error.code === 'UNAUTHORIZED' || error.statusCode === 401;
};

export const isForbiddenError = (error: ApiError): boolean => {
  return error.code === 'FORBIDDEN' || error.statusCode === 403;
};

export const isNotFoundError = (error: ApiError): boolean => {
  return error.code === 'NOT_FOUND' || error.code === 'RECORD_NOT_FOUND' || error.statusCode === 404;
};

export const isConflictError = (error: ApiError): boolean => {
  return error.code === 'CONFLICT' || error.code === 'DUPLICATE_RECORD' || error.statusCode === 409;
};

export const isServerError = (error: ApiError): boolean => {
  return error.statusCode >= 500;
};

export const isNetworkError = (error: ApiError): boolean => {
  return error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT_ERROR';
};

// Error severity levels for UI handling
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export const getErrorSeverity = (error: ApiError): ErrorSeverity => {
  if (isServerError(error) || error.code === 'UNKNOWN_ERROR') {
    return 'critical';
  }
  if (isForbiddenError(error) || isConflictError(error)) {
    return 'high';
  }
  if (isValidationError(error) || isUnauthorizedError(error)) {
    return 'medium';
  }
  return 'low';
};

// User-friendly error messages
export const getUserFriendlyMessage = (error: ApiError): string => {
  const messageMap: Record<ErrorCode, string> = {
    BAD_REQUEST: 'The request was invalid. Please check your input and try again.',
    UNAUTHORIZED: 'Please sign in to continue.',
    FORBIDDEN: "You don't have permission to perform this action.",
    NOT_FOUND: 'The requested resource was not found.',
    CONFLICT: 'This operation conflicts with existing data.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    TOO_MANY_REQUESTS: 'Too many requests. Please wait a moment and try again.',
    INTERNAL_ERROR: 'Something went wrong on our end. Please try again later.',
    SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again later.',
    DATABASE_ERROR: 'A database error occurred. Please try again later.',
    EXTERNAL_SERVICE_ERROR: 'An external service error occurred. Please try again later.',
    DUPLICATE_RECORD: 'A record with this information already exists.',
    RECORD_NOT_FOUND: 'The requested record was not found.',
    FOREIGN_KEY_VIOLATION: 'This operation violates data constraints.',
    INVALID_TOKEN: 'Your session is invalid. Please sign in again.',
    TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
    ROUTE_NOT_FOUND: 'The requested endpoint was not found.',
    NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
    TIMEOUT_ERROR: 'The request timed out. Please try again.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  };

  return messageMap[error.code as ErrorCode] || error.message || 'An unexpected error occurred';
};

export type RecommendedAction = 'signin' | 'retry' | 'correct_input' | 'retry_later' | 'contact_support' | null;

// Action recommendations based on error type
export const getRecommendedAction = (error: ApiError): RecommendedAction => {
  if (isUnauthorizedError(error) || error.code === 'TOKEN_EXPIRED') {
    return 'signin';
  }
  if (isNetworkError(error)) {
    return 'retry';
  }
  if (isValidationError(error)) {
    return 'correct_input';
  }
  if (isServerError(error)) {
    return 'retry_later';
  }
  return null;
};

export interface ErrorHandlerOptions {
  showToast?: boolean;
  redirectOnAuthError?: boolean;
  logToConsole?: boolean;
  logToService?: boolean;
  retryCount?: number;
  onRetry?: () => void;
}

export const defaultErrorHandlerOptions: ErrorHandlerOptions = {
  showToast: true,
  redirectOnAuthError: true,
  logToConsole: process.env.NODE_ENV === 'development',
  logToService: process.env.NODE_ENV === 'production',
  retryCount: 0,
};

export class FrontendApiError extends Error implements ApiError {
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;
  requestId?: string;
  timestamp: string;
  isOperational: boolean;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    details?: Record<string, unknown>,
    requestId?: string,
    timestamp: string = new Date().toISOString(),
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'FrontendApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.requestId = requestId;
    this.timestamp = timestamp;
    this.isOperational = isOperational;

    // Maintain proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FrontendApiError);
    }
  }

  getUserMessage(): string {
    return getUserFriendlyMessage(this);
  }

  getSeverity(): ErrorSeverity {
    return getErrorSeverity(this);
  }

  getRecommendedAction(): RecommendedAction {
    return getRecommendedAction(this);
  }

  isValidation(): boolean {
    return isValidationError(this as ApiError);
  }

  isUnauthorized(): boolean {
    return isUnauthorizedError(this as ApiError);
  }

  isForbidden(): boolean {
    return isForbiddenError(this as ApiError);
  }

  isNotFound(): boolean {
    return isNotFoundError(this as ApiError);
  }

  isServerError(): boolean {
    return this.statusCode >= 500;
  }
}

// Helper to convert any error to ApiError
export const normalizeError = (error: unknown): FrontendApiError => {
  if (error instanceof FrontendApiError) {
    return error;
  }

  if (error instanceof Error) {
    // Check if it's an Axios error with response data
    const axiosError = error as { response?: { data?: ApiErrorResponse; status?: number }; config?: { url?: string; method?: string } };
    
    if (axiosError.response?.data) {
      const apiError = axiosError.response.data;
      return new FrontendApiError(
        apiError.error.message,
        apiError.error.code,
        axiosError.response.status || 500,
        apiError.error.details,
        apiError.requestId,
        apiError.timestamp,
        true
      );
    }

    // Network errors
    if (error.message?.includes('Network Error') || error.message?.includes('ECONNREFUSED')) {
      return new FrontendApiError(
        'Network connection failed',
        'NETWORK_ERROR',
        0,
        { originalMessage: error.message }
      );
    }

    // Timeout errors
    if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
      return new FrontendApiError(
        'Request timed out',
        'TIMEOUT_ERROR',
        0,
        { originalMessage: error.message }
      );
    }

    return new FrontendApiError(
      error.message,
      'UNKNOWN_ERROR',
      500,
      { originalName: error.name }
    );
  }

  return new FrontendApiError(
    String(error) || 'An unexpected error occurred',
    'UNKNOWN_ERROR',
    500
  );
};

export default FrontendApiError;
