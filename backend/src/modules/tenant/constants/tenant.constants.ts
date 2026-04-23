// =============================================================================
// Tenant Constants
// =============================================================================

export const TENANT_CONSTANTS = {
  // Subdomain constraints
  SUBDOMAIN: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 63,
    PATTERN: /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
    RESERVED: [
      'admin',
      'api',
      'app',
      'auth',
      'billing',
      'blog',
      'cdn',
      'dashboard',
      'demo',
      'dev',
      'docs',
      'ftp',
      'help',
      'idara',
      'localhost',
      'login',
      'mail',
      'madarsa',
      'payments',
      'portal',
      'register',
      'signup',
      'smtp',
      'staging',
      'status',
      'support',
      'system',
      'test',
      'web',
      'www',
    ],
  },

  // Institution types
  INSTITUTION_TYPES: [
    'MADRASA',
    'ISLAMIC_SCHOOL',
    'IDARA',
    'DARUL_ULOOM',
    'QURAN_CENTER',
    'ISLAMIC_CENTER',
    'OTHER',
  ] as const,

  // Tenant statuses
  STATUSES: [
    'PENDING',
    'ACTIVE',
    'SUSPENDED',
    'CANCELLED',
    'PENDING_DELETION',
  ] as const,

  // Default settings
  DEFAULTS: {
    TIMEZONE: 'UTC',
    DATE_FORMAT: 'YYYY-MM-DD',
    LANGUAGE: 'en',
    CURRENCY: 'USD',
    PRIMARY_COLOR: '#4F46E5',
    SECONDARY_COLOR: '#10B981',
    ACCENT_COLOR: '#F59E0B',
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },

  // Trial period
  TRIAL_PERIOD_DAYS: 14,
} as const;

// =============================================================================
// Error Messages
// =============================================================================

export const TENANT_ERROR_MESSAGES = {
  SUBDOMAIN_TAKEN: 'This subdomain is already taken. Please choose another one.',
  SUBDOMAIN_INVALID: 'Subdomain must be 3-63 characters and can only contain lowercase letters, numbers, and hyphens.',
  SUBDOMAIN_RESERVED: 'This subdomain is reserved and cannot be used.',
  TENANT_NOT_FOUND: 'Tenant not found.',
  UNAUTHORIZED: 'You do not have permission to access this tenant.',
  VERIFICATION_REQUIRED: 'Tenant verification is required.',
} as const;

// =============================================================================
// Success Messages
// =============================================================================

export const TENANT_SUCCESS_MESSAGES = {
  CREATED: 'Tenant created successfully. Please check your email to verify your account.',
  UPDATED: 'Tenant information updated successfully.',
  DELETED: 'Tenant has been deleted.',
  VERIFIED: 'Tenant has been verified successfully.',
} as const;
