import { Response } from 'express';
import { ApiResponse, PaginatedResult } from '../types';

// =============================================================================
// Success Response Helpers
// =============================================================================

export const successResponse = <T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  message?: string
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };

  if (message) {
    response.data = { ...(data as Record<string, unknown>), message } as T;
  }

  res.status(statusCode).json(response);
};

export const createdResponse = <T>(res: Response, data: T, message?: string): void => {
  successResponse(res, data, 201, message);
};

export const noContentResponse = (res: Response): void => {
  res.status(204).send();
};

// =============================================================================
// Paginated Response Helper
// =============================================================================

export const paginatedResponse = <T>(
  res: Response,
  result: PaginatedResult<T>,
  statusCode: number = 200
): void => {
  const response: ApiResponse<PaginatedResult<T>> = {
    success: true,
    data: result,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
};

// =============================================================================
// Pagination Utility
// =============================================================================

export const createPaginatedResult = <T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
  };
};

// =============================================================================
// Error Response Helpers (for use when not going through error middleware)
// =============================================================================

export const errorResponse = (
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: Record<string, unknown>
): void => {
  const response: ApiResponse<never> = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
};

// =============================================================================
// Common Response Messages
// =============================================================================

export const ResponseMessages = {
  // Success messages
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  FETCHED: 'Resource fetched successfully',
  LIST_FETCHED: 'Resources fetched successfully',
  
  // Error messages
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden access',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error',
} as const;
