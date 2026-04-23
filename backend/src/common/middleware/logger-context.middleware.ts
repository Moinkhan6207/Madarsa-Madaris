import { Request, Response, NextFunction } from 'express';
import { createRequestLogger } from '../logger/logger';

export const loggerContextMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // If we have userId or tenantId in the context, update the request logger
  if (req.context) {
    const { userId, tenantId } = req.context;
    
    if (userId || tenantId) {
      (req as any).requestLogger = createRequestLogger(
        req.requestId!,
        tenantId || undefined,
        userId || undefined
      );
    }
  }

  next();
};
