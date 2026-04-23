'use client';

import { Button } from './Button';
import { FrontendApiError, getUserFriendlyMessage, RecommendedAction } from '@/types/api-error';

// =============================================================================
// Error Alert Props
// =============================================================================

interface ErrorAlertProps {
  error: FrontendApiError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  className?: string;
}

// =============================================================================
// Severity Styles
// =============================================================================

const severityStyles = {
  critical: {
    container: 'bg-red-50 border-red-400',
    icon: 'text-red-400',
    title: 'text-red-800',
    message: 'text-red-700',
    iconSvg: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
  },
  high: {
    container: 'bg-orange-50 border-orange-400',
    icon: 'text-orange-400',
    title: 'text-orange-800',
    message: 'text-orange-700',
    iconSvg: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  medium: {
    container: 'bg-yellow-50 border-yellow-400',
    icon: 'text-yellow-400',
    title: 'text-yellow-800',
    message: 'text-yellow-700',
    iconSvg: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  },
  low: {
    container: 'bg-blue-50 border-blue-400',
    icon: 'text-blue-400',
    title: 'text-blue-800',
    message: 'text-blue-700',
    iconSvg: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  },
};

// =============================================================================
// Error Alert Component
// =============================================================================

export function ErrorAlert({ 
  error, 
  onRetry, 
  onDismiss, 
  showDetails = false,
  className = '' 
}: ErrorAlertProps) {
  if (!error) return null;

  const severity = error.getSeverity();
  const styles = severityStyles[severity];
  const userMessage = getUserFriendlyMessage(error);
  const recommendedAction = error.getRecommendedAction();

  const handleAction = () => {
    if (recommendedAction === 'signin') {
      window.location.href = '/login';
      return;
    }
    onRetry?.();
  };

  const getActionButtonText = (): string => {
    switch (recommendedAction) {
      case 'signin':
        return 'Sign In';
      case 'retry':
      case 'retry_later':
        return 'Try Again';
      case 'contact_support':
        return 'Contact Support';
      default:
        return 'Retry';
    }
  };

  return (
    <div className={`rounded-md border p-4 ${styles.container} ${className}`} role="alert">
      <div className="flex">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {styles.iconSvg}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${styles.title}`}>
            Error
          </h3>
          <div className={`mt-2 text-sm ${styles.message}`}>
            <p>{userMessage}</p>
            
            {/* Request ID for support */}
            {error.requestId && (
              <p className="mt-2 text-xs opacity-75">
                Reference ID: <code className="font-mono">{error.requestId}</code>
              </p>
            )}

            {/* Error details for development */}
            {showDetails && process.env.NODE_ENV === 'development' && (
              <div className="mt-3 p-2 bg-white/50 rounded text-xs font-mono overflow-auto max-h-32">
                <p className="font-semibold">Code: {error.code}</p>
                <p>Status: {error.statusCode}</p>
                <p>Message: {error.message}</p>
                {error.stack && (
                  <pre className="mt-1 text-xs">{error.stack}</pre>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            {(onRetry || recommendedAction === 'signin' || recommendedAction === 'retry') && (
              <Button 
                onClick={handleAction} 
                variant="outline" 
                size="sm"
              >
                {getActionButtonText()}
              </Button>
            )}
            {onDismiss && (
              <Button 
                onClick={onDismiss} 
                variant="ghost" 
                size="sm"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Inline Error Component
// =============================================================================

interface InlineErrorProps {
  message: string | null;
  className?: string;
}

export function InlineError({ message, className = '' }: InlineErrorProps) {
  if (!message) return null;

  return (
    <p className={`text-sm text-red-600 mt-1 ${className}`} role="alert">
      {message}
    </p>
  );
}

// =============================================================================
// Form Field Error Component
// =============================================================================

interface FormFieldErrorProps {
  error?: string;
  className?: string;
}

export function FormFieldError({ error, className = '' }: FormFieldErrorProps) {
  if (!error) return null;

  return (
    <div className={`flex items-center gap-1 mt-1 ${className}`}>
      <svg 
        className="h-4 w-4 text-red-500 flex-shrink-0" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <span className="text-sm text-red-600">{error}</span>
    </div>
  );
}

// =============================================================================
// Error Banner Component
// =============================================================================

interface ErrorBannerProps {
  error: FrontendApiError | null;
  onClose?: () => void;
  className?: string;
}

export function ErrorBanner({ error, onClose, className = '' }: ErrorBannerProps) {
  if (!error) return null;

  const userMessage = getUserFriendlyMessage(error);

  return (
    <div className={`bg-red-600 text-white px-4 py-3 ${className}`} role="alert">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{userMessage}</span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-white hover:text-red-100 transition-colors"
            aria-label="Dismiss error"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      {error.requestId && (
        <p className="mt-1 text-xs text-red-200">
          Reference: {error.requestId}
        </p>
      )}
    </div>
  );
}

// =============================================================================
// Loading Error State Component
// =============================================================================

interface LoadingErrorStateProps {
  error: FrontendApiError | null;
  onRetry: () => void;
  className?: string;
}

export function LoadingErrorState({ error, onRetry, className = '' }: LoadingErrorStateProps) {
  if (!error) return null;

  const userMessage = getUserFriendlyMessage(error);

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Failed to Load
      </h3>
      <p className="text-gray-600 mb-4 max-w-sm">
        {userMessage}
      </p>
      {error.requestId && (
        <p className="text-sm text-gray-500 mb-4">
          Reference: <code className="font-mono">{error.requestId}</code>
        </p>
      )}
      <Button onClick={onRetry} variant="primary">
        Try Again
      </Button>
    </div>
  );
}

// =============================================================================
// Exports
// =============================================================================

export default ErrorAlert;
