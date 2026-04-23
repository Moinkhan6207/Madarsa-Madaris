import { TokenPayload } from '../middleware/auth.middleware';
import { TenantContext } from '../middleware/tenant-context.middleware';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      tenantContext?: TenantContext;
      permissions?: string[];
      effectivePermissions?: string[];
      requestId?: string;
      startTime?: number;
    }
  }
}

export {};
