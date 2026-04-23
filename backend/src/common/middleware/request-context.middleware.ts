import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger, createRequestLogger } from '../logger/logger';

interface ContextRequest extends Request {
  requestLogger?: ReturnType<typeof createRequestLogger>;
}

export const requestContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const contextReq = req as ContextRequest;
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();

  req.requestId = requestId;
  req.startTime = Date.now();
  contextReq.requestLogger = createRequestLogger(requestId);

  res.setHeader('x-request-id', requestId);

  contextReq.requestLogger.debug(
    {
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
    'Request started'
  );

  const originalJson = res.json.bind(res);
  res.json = (body: unknown): Response => {
    const duration = Date.now() - (req.startTime ?? Date.now());

    contextReq.requestLogger?.info(
      {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      },
      'Request completed'
    );

    if (res.statusCode >= 200 && res.statusCode < 300 && typeof body === 'object' && body !== null) {
      const responseBody = body as Record<string, unknown>;
      responseBody.requestId = requestId;
      responseBody.responseTime = `${duration}ms`;
      return originalJson(responseBody);
    }

    return originalJson(body);
  };

  req.setTimeout(30000, () => {
    const duration = Date.now() - (req.startTime ?? Date.now());
    contextReq.requestLogger?.warn(
      {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
      },
      'Request timeout'
    );
  });

  next();
};

export const requestLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  logger.info(
    {
      method: req.method,
      path: req.path,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
    'Incoming request'
  );

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    const requestLogger = (req as any).requestLogger || logger;

    requestLogger[logLevel](
      {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        duration: `${duration}ms`,
        contentLength: res.get('content-length'),
      },
      'Request processed'
    );
  });

  next();
};

export const correlationIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const correlationId = (req.headers['x-correlation-id'] as string) || (req.headers['x-request-id'] as string) || uuidv4();

  req.headers['x-correlation-id'] = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  if (!req.requestId) {
    req.requestId = correlationId;
  }

  next();
};
