// =============================================================================
// Shared Constants - Used by both backend and frontend
// =============================================================================

// =============================================================================
// Tenant Constants
// =============================================================================

export const TENANT_CONSTANTS = {
  SUBDOMAIN: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 63,
    PATTERN: /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
    RESERVED: [
      'admin', 'api', 'app', 'auth', 'billing', 'blog', 'cdn', 'dashboard',
      'demo', 'dev', 'docs', 'ftp', 'help', 'idara', 'localhost', 'login',
      'mail', 'madarsa', 'payments', 'portal', 'register', 'signup', 'smtp',
      'staging', 'status', 'support', 'system', 'test', 'web', 'www',
    ],
  },
  
  INSTITUTION_TYPES: [
    'MADRASA',
    'ISLAMIC_SCHOOL',
    'IDARA',
    'DARUL_ULOOM',
    'QURAN_CENTER',
    'ISLAMIC_CENTER',
    'OTHER',
  ] as const,

  STATUSES: [
    'PENDING',
    'ACTIVE',
    'SUSPENDED',
    'CANCELLED',
    'PENDING_DELETION',
  ] as const,

  DEFAULTS: {
    TIMEZONE: 'UTC',
    DATE_FORMAT: 'YYYY-MM-DD',
    LANGUAGE: 'en',
    CURRENCY: 'USD',
    PRIMARY_COLOR: '#4F46E5',
    SECONDARY_COLOR: '#10B981',
    ACCENT_COLOR: '#F59E0B',
  },

  TRIAL_PERIOD_DAYS: 14,
} as const;

// =============================================================================
// Pagination Constants
// =============================================================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// =============================================================================
// User Constants
// =============================================================================

export const USER_TYPES = [
  'SYSTEM_ADMIN',
  'TENANT_ADMIN',
  'PRINCIPAL',
  'VICE_PRINCIPAL',
  'ADMINISTRATOR',
  'TEACHER',
  'STUDENT',
  'GUARDIAN',
  'ACCOUNTANT',
  'LIBRARIAN',
  'RECEPTIONIST',
  'STAFF',
] as const;

export const USER_STATUSES = [
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'PENDING_VERIFICATION',
  'DELETED',
] as const;

// =============================================================================
// Error Messages
// =============================================================================

export const ERROR_MESSAGES = {
  TENANT: {
    SUBDOMAIN_TAKEN: 'This subdomain is already taken. Please choose another one.',
    SUBDOMAIN_INVALID: 'Subdomain must be 3-63 characters and can only contain lowercase letters, numbers, and hyphens.',
    SUBDOMAIN_RESERVED: 'This subdomain is reserved and cannot be used.',
    NOT_FOUND: 'Tenant not found.',
    UNAUTHORIZED: 'You do not have permission to access this tenant.',
  },
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password.',
    TOKEN_EXPIRED: 'Your session has expired. Please login again.',
    UNAUTHORIZED: 'You must be logged in to access this resource.',
    FORBIDDEN: 'You do not have permission to perform this action.',
  },
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_PASSWORD: 'Password must be at least 8 characters.',
  },
} as const;

// =============================================================================
// Success Messages
// =============================================================================

export const SUCCESS_MESSAGES = {
  TENANT: {
    CREATED: 'Tenant created successfully. Please check your email to verify your account.',
    UPDATED: 'Tenant information updated successfully.',
    DELETED: 'Tenant has been deleted.',
    VERIFIED: 'Tenant has been verified successfully.',
  },
  AUTH: {
    LOGIN_SUCCESS: 'Login successful.',
    LOGOUT_SUCCESS: 'Logout successful.',
    REGISTER_SUCCESS: 'Registration successful.',
  },
} as const;
