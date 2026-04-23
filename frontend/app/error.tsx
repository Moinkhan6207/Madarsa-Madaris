'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FrontendApiError, getUserFriendlyMessage, getRecommendedAction } from '@/types/api-error';

// =============================================================================
// Error Page Props
// =============================================================================

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// =============================================================================
// Error Severity Configuration
// =============================================================================

const errorConfig = {
  critical: {
    icon: '🔥',
    title: 'Critical Error',
    description: 'Something went seriously wrong. We apologize for the inconvenience.',
    primaryAction: 'Try Again',
    secondaryAction: 'Go Home',
    showDetails: true,
  },
  high: {
    icon: '⚠️',
    title: 'Error Occurred',
    description: 'We encountered an issue processing your request.',
    primaryAction: 'Try Again',
    secondaryAction: 'Go Back',
    showDetails: true,
  },
  medium: {
    icon: '🔔',
    title: 'Action Required',
    description: 'Please check your input and try again.',
    primaryAction: 'Retry',
    secondaryAction: 'Cancel',
    showDetails: false,
  },
  low: {
    icon: 'ℹ️',
    title: 'Notice',
    description: 'An issue occurred but it may resolve itself.',
    primaryAction: 'Continue',
    secondaryAction: 'Go Back',
    showDetails: false,
  },
};

// =============================================================================
// Global Error Component
// =============================================================================

export default function GlobalError({ error, reset }: ErrorPageProps) {
  // Normalize the error
  const apiError = normalizeToApiError(error);
  const severity = apiError.getSeverity();
  const config = errorConfig[severity];
  const recommendedAction = apiError.getRecommendedAction();

  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global Error Boundary caught:', error);
    }

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (Sentry, etc.)
      // Example: Sentry.captureException(error);
    }
  }, [error]);

  const handlePrimaryAction = () => {
    if (recommendedAction === 'signin') {
      window.location.href = '/login';
      return;
    }
    if (recommendedAction === 'retry_later') {
      window.location.reload();
      return;
    }
    reset();
  };

  const handleSecondaryAction = () => {
    if (recommendedAction === 'signin') {
      window.history.back();
      return;
    }
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="text-6xl mb-4">{config.icon}</div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{config.title}</h1>

        {/* Description */}
        <p className="text-gray-600 mb-6">{getUserFriendlyMessage(apiError)}</p>

        {/* Request ID for support */}
        {apiError.requestId && (
          <div className="bg-gray-100 rounded p-3 mb-6 text-sm">
            <p className="text-gray-500">Reference ID:</p>
            <p className="font-mono text-gray-700">{apiError.requestId}</p>
          </div>
        )}

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === 'development' && config.showDetails && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-6 text-left">
            <p className="text-red-800 font-semibold text-sm mb-2">Error Details:</p>
            <p className="text-red-700 text-xs font-mono break-all">
              {apiError.message}
            </p>
            {apiError.stack && (
              <pre className="text-red-600 text-xs mt-2 overflow-auto max-h-32">
                {apiError.stack}
              </pre>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button onClick={handlePrimaryAction} variant="primary">
            {recommendedAction === 'signin' ? 'Sign In' : config.primaryAction}
          </Button>
          <Button onClick={handleSecondaryAction} variant="outline">
            {config.secondaryAction}
          </Button>
        </div>

        {/* Support Link */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Still having issues?{' '}
            <Link href="/support" className="text-blue-600 hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

function normalizeToApiError(error: Error & { digest?: string }): FrontendApiError {
  // Check if it's already a FrontendApiError
  if (error instanceof FrontendApiError) {
    return error;
  }

  // Check for digest (Next.js specific)
  if (error.digest) {
    return new FrontendApiError(
      error.message || 'A rendering error occurred',
      'INTERNAL_ERROR',
      500,
      { digest: error.digest }
    );
  }

  // Handle network errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return new FrontendApiError(
      'Network connection failed',
      'NETWORK_ERROR',
      0
    );
  }

  // Handle timeout errors
  if (error.message?.includes('timeout')) {
    return new FrontendApiError(
      'Request timed out',
      'TIMEOUT_ERROR',
      0
    );
  }

  // Default error
  return new FrontendApiError(
    error.message || 'An unexpected error occurred',
    'UNKNOWN_ERROR',
    500
  );
}

// =============================================================================
// Re-export for convenience
// =============================================================================

export { FrontendApiError };
