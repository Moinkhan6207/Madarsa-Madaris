import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../errors/AppError';
import { prisma } from '../../config/prisma.service';

export interface TokenPayload {
  userId: string;
}

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError('Authorization header is missing', 401, 'AUTH_HEADER_MISSING');
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new AppError('Authorization header format must be: Bearer [token]', 401, 'INVALID_AUTH_FORMAT');
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        tenant: {
          select: { status: true }
        },
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user || user.deletedAt) {
      throw new AppError('User not found or inactive', 401, 'USER_NOT_FOUND');
    }

    const roles = user.userRoles.map(ur => ur.role.code);
    const permissions = Array.from(new Set(
      user.userRoles.flatMap(ur => ur.role.rolePermissions.map(rp => rp.permission.code))
    ));

    // Assign to a custom property per the PRD structure
    req.user = {
      id: user.id,
      tenantId: user.tenantId,
      tenantStatus: user.tenant?.status,
      roles,
      permissions
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid or expired token', 401, 'INVALID_TOKEN'));
    } else {
      next(error);
    }
  }
};
