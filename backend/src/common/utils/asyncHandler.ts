import { Request, Response, NextFunction, RequestHandler } from 'express';

// =============================================================================
// Async Handler Types
// =============================================================================

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

type AsyncErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

// =============================================================================
// Typed Request Interface
// =============================================================================

export interface TypedRequest<TBody = unknown, TQuery = unknown, TParams = unknown> extends Request {
  body: TBody;
  query: TQuery & Request['query'];
  params: TParams & Request['params'];
}

// =============================================================================
// Async Handler Wrapper
// Wraps async route handlers to catch errors and forward to error middleware
// =============================================================================

export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// =============================================================================
// Async Error Handler Wrapper
// Wraps async error middleware handlers
// =============================================================================

export const asyncErrorHandler = (fn: AsyncErrorRequestHandler) => {
  return (err: Error, req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(err, req, res, next)).catch(next);
  };
};

// =============================================================================
// Typed Async Handler
// Provides better type inference for request and response bodies
// =============================================================================

export const typedAsyncHandler = <TBody = unknown, TQuery = unknown, TParams = unknown>(
  fn: (req: TypedRequest<TBody, TQuery, TParams>, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req as TypedRequest<TBody, TQuery, TParams>, res, next)).catch(next);
  };
};

// =============================================================================
// Legacy Support - Keep for backwards compatibility
// =============================================================================

export const asyncHandlerTyped = <T extends Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: T, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// =============================================================================
// Usage Examples
// =============================================================================

/*
import { asyncHandler, typedAsyncHandler } from '@/common/utils/asyncHandler';
import { tenantService } from '@/modules/tenant/services/tenant.service';

// Basic usage
router.get('/users', asyncHandler(async (req, res) => {
  const users = await userService.findAll();
  res.json({ success: true, data: users });
}));

// With typed request body
interface CreateUserBody {
  email: string;
  name: string;
}

router.post('/users', typedAsyncHandler<CreateUserBody>(async (req, res) => {
  // req.body is typed as CreateUserBody
  const user = await userService.create(req.body);
  res.json({ success: true, data: user });
}));

// With typed params and body
interface UpdateUserParams {
  id: string;
}

interface UpdateUserBody {
  name: string;
}

router.put('/users/:id', typedAsyncHandler<UpdateUserBody, unknown, UpdateUserParams>(
  async (req, res) => {
    const { id } = req.params; // id is string
    const { name } = req.body;  // name is string
    const user = await userService.update(id, { name });
    res.json({ success: true, data: user });
  }
));
*/
