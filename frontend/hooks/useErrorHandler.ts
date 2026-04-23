'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FrontendApiError, 
  ErrorHandlerOptions, 
  defaultErrorHandlerOptions,
  normalizeError,
  RecommendedAction
} from '@/types/api-error';

// =============================================================================
// Hook Return Type
// =============================================================================

interface UseErrorHandlerReturn {
  error: FrontendApiError | null;
  isLoading: boolean;
  handleError: (error: unknown) => FrontendApiError;
  clearError: () => void;
  handleAsync: <T>(promise: Promise<T>, options?: ErrorHandlerOptions) => Promise<T | null>;
  retry: () => void;
}

// =============================================================================
// Use Error Handler Hook
// =============================================================================

export function useErrorHandler(
  onRetry?: () => void,
  globalOptions: ErrorHandlerOptions = {}
): UseErrorHandlerReturn {
  const router = useRouter();
  const [error, setError] = useState<FrontendApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mergedOptions = { ...defaultErrorHandlerOptions, ...globalOptions };

  /**
   * Handle and normalize any error
   */
  const handleError = useCallback((err: unknown): FrontendApiError => {
    const normalizedError = normalizeError(err);
    
    setError(normalizedError);

    // Handle based on options
    if (mergedOptions.logToConsole) {
      console.error('[useErrorHandler]', normalizedError);
    }

    // Handle auth errors
    if (mergedOptions.redirectOnAuthError && normalizedError.isUnauthorized()) {
      const currentPath = window.location.pathname;
      sessionStorage.setItem('redirect_after_login', currentPath);
      // Use window.location for navigation to avoid typed route issues
      if (typeof window !== 'undefined') {
        window.location.href = '/login?error=unauthorized';
      }
    }

    return normalizedError;
  }, [mergedOptions.logToConsole, mergedOptions.redirectOnAuthError, router]);

  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Handle async operations with automatic error handling
   */
  const handleAsync = useCallback(async <T,>(
    promise: Promise<T>,
    options?: ErrorHandlerOptions
  ): Promise<T | null> => {
    const localOptions = { ...mergedOptions, ...options };
    setIsLoading(true);
    clearError();

    try {
      const result = await promise;
      return result;
    } catch (err) {
      const normalizedError = handleError(err);
      
      // Retry logic
      if (localOptions.retryCount && localOptions.retryCount > 0 && localOptions.onRetry) {
        setTimeout(() => {
          localOptions.onRetry?.();
        }, 1000);
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError, mergedOptions]);

  /**
   * Retry the last operation
   */
  const retry = useCallback(() => {
    clearError();
    onRetry?.();
  }, [clearError, onRetry]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    handleAsync,
    retry,
  };
}

// =============================================================================
// Use API Error Hook
// Specialized hook for API operations
// =============================================================================

interface UseApiErrorReturn extends UseErrorHandlerReturn {
  execute: <T>(apiCall: () => Promise<T>) => Promise<T | null>;
}

export function useApiError(onRetry?: () => void): UseApiErrorReturn {
  const errorHandler = useErrorHandler(onRetry, {
    showToast: true,
    redirectOnAuthError: true,
    logToConsole: process.env.NODE_ENV === 'development',
  });

  const execute = useCallback(async <T,>(apiCall: () => Promise<T>): Promise<T | null> => {
    return errorHandler.handleAsync(apiCall());
  }, [errorHandler]);

  return {
    ...errorHandler,
    execute,
  };
}

// =============================================================================
// Use Form Error Hook
// Specialized hook for form validation errors
// =============================================================================

interface FormFieldError {
  field: string;
  message: string;
}

interface UseFormErrorReturn {
  fieldErrors: Record<string, string>;
  generalError: string | null;
  handleFormError: (error: unknown) => void;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
}

export function useFormError(): UseFormErrorReturn {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleFormError = useCallback((error: unknown) => {
    const normalizedError = normalizeError(error);

    // Handle validation errors with field details
    if (normalizedError.isValidation() && normalizedError.details?.errors) {
      const errors = normalizedError.details.errors as Array<{ path: string; message: string }>;
      const newFieldErrors: Record<string, string> = {};

      errors.forEach((err) => {
        const field = err.path.split('.')[0]; // Get top-level field
        newFieldErrors[field] = err.message;
      });

      setFieldErrors(newFieldErrors);
      setGeneralError(null);
    } else {
      // General error
      setGeneralError(normalizedError.getUserMessage());
      setFieldErrors({});
    }
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
    setGeneralError(null);
  }, []);

  return {
    fieldErrors,
    generalError,
    handleFormError,
    clearFieldError,
    clearAllErrors,
    hasErrors: Object.keys(fieldErrors).length > 0 || !!generalError,
  };
}

// =============================================================================
// Use Safe Async Hook
// For operations where errors shouldn't crash the component
// =============================================================================

type AsyncState<T> = 
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: FrontendApiError };

interface UseSafeAsyncReturn<T> {
  state: AsyncState<T>;
  execute: (promise: Promise<T>) => Promise<void>;
  reset: () => void;
  retry: () => void;
}

export function useSafeAsync<T>(
  asyncFunction?: () => Promise<T>
): UseSafeAsyncReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
  });

  const execute = useCallback(async (promise: Promise<T>): Promise<void> => {
    setState({ status: 'loading', data: null, error: null });

    try {
      const data = await promise;
      setState({ status: 'success', data, error: null });
    } catch (err) {
      const normalizedError = normalizeError(err);
      setState({ status: 'error', data: null, error: normalizedError });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: 'idle', data: null, error: null });
  }, []);

  const retry = useCallback(() => {
    if (asyncFunction) {
      reset();
      execute(asyncFunction());
    }
  }, [asyncFunction, execute, reset]);

  return {
    state,
    execute,
    reset,
    retry,
  };
}

// =============================================================================
// Export all hooks
// =============================================================================

export default useErrorHandler;
