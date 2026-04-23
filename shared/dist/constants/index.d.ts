export declare const TENANT_CONSTANTS: {
    readonly SUBDOMAIN: {
        readonly MIN_LENGTH: 3;
        readonly MAX_LENGTH: 63;
        readonly PATTERN: RegExp;
        readonly RESERVED: readonly ["admin", "api", "app", "auth", "billing", "blog", "cdn", "dashboard", "demo", "dev", "docs", "ftp", "help", "idara", "localhost", "login", "mail", "madarsa", "payments", "portal", "register", "signup", "smtp", "staging", "status", "support", "system", "test", "web", "www"];
    };
    readonly INSTITUTION_TYPES: readonly ["MADRASA", "ISLAMIC_SCHOOL", "IDARA", "DARUL_ULOOM", "QURAN_CENTER", "ISLAMIC_CENTER", "OTHER"];
    readonly STATUSES: readonly ["PENDING", "ACTIVE", "SUSPENDED", "CANCELLED", "PENDING_DELETION"];
    readonly DEFAULTS: {
        readonly TIMEZONE: "UTC";
        readonly DATE_FORMAT: "YYYY-MM-DD";
        readonly LANGUAGE: "en";
        readonly CURRENCY: "USD";
        readonly PRIMARY_COLOR: "#4F46E5";
        readonly SECONDARY_COLOR: "#10B981";
        readonly ACCENT_COLOR: "#F59E0B";
    };
    readonly TRIAL_PERIOD_DAYS: 14;
};
export declare const PAGINATION: {
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_LIMIT: 20;
    readonly MAX_LIMIT: 100;
};
export declare const USER_TYPES: readonly ["SYSTEM_ADMIN", "TENANT_ADMIN", "PRINCIPAL", "VICE_PRINCIPAL", "ADMINISTRATOR", "TEACHER", "STUDENT", "GUARDIAN", "ACCOUNTANT", "LIBRARIAN", "RECEPTIONIST", "STAFF"];
export declare const USER_STATUSES: readonly ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION", "DELETED"];
export declare const ERROR_MESSAGES: {
    readonly TENANT: {
        readonly SUBDOMAIN_TAKEN: "This subdomain is already taken. Please choose another one.";
        readonly SUBDOMAIN_INVALID: "Subdomain must be 3-63 characters and can only contain lowercase letters, numbers, and hyphens.";
        readonly SUBDOMAIN_RESERVED: "This subdomain is reserved and cannot be used.";
        readonly NOT_FOUND: "Tenant not found.";
        readonly UNAUTHORIZED: "You do not have permission to access this tenant.";
    };
    readonly AUTH: {
        readonly INVALID_CREDENTIALS: "Invalid email or password.";
        readonly TOKEN_EXPIRED: "Your session has expired. Please login again.";
        readonly UNAUTHORIZED: "You must be logged in to access this resource.";
        readonly FORBIDDEN: "You do not have permission to perform this action.";
    };
    readonly VALIDATION: {
        readonly REQUIRED_FIELD: "This field is required.";
        readonly INVALID_EMAIL: "Please enter a valid email address.";
        readonly INVALID_PASSWORD: "Password must be at least 8 characters.";
    };
};
export declare const SUCCESS_MESSAGES: {
    readonly TENANT: {
        readonly CREATED: "Tenant created successfully. Please check your email to verify your account.";
        readonly UPDATED: "Tenant information updated successfully.";
        readonly DELETED: "Tenant has been deleted.";
        readonly VERIFIED: "Tenant has been verified successfully.";
    };
    readonly AUTH: {
        readonly LOGIN_SUCCESS: "Login successful.";
        readonly LOGOUT_SUCCESS: "Logout successful.";
        readonly REGISTER_SUCCESS: "Registration successful.";
    };
};
//# sourceMappingURL=index.d.ts.map