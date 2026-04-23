import { NextFunction, Response, Request } from 'express';
import { AppError } from '../errors/AppError';

export const requirePermission = (requiredPermission: string) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.context || !req.context.permissions) {
        throw new AppError('Permissions are not loaded in context', 403, 'PERMISSIONS_NOT_LOADED');
      }

      // If SUPER_ADMIN, they can bypass normal permission checks or we can just rely on their seeded permissions.
      // Assuming they have all permissions seeded, we just check the array.
      if (!req.context.permissions.includes(requiredPermission)) {
        throw new AppError(
          `Access denied. Required permission: ${requiredPermission}`,
          403,
          'PERMISSION_DENIED'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireAnyPermission = (requiredPermissions: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.context || !req.context.permissions) {
        throw new AppError('Permissions are not loaded in context', 403, 'PERMISSIONS_NOT_LOADED');
      }

      const hasAny = requiredPermissions.some((permission) => req.context?.permissions.includes(permission));
      if (!hasAny) {
        throw new AppError(
          `Access denied. Required any of permissions: ${requiredPermissions.join(', ')}`,
          403,
          'PERMISSION_DENIED'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
