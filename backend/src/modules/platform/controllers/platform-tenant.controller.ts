import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../../tenant/services/tenant.service';
import { prisma } from '../../../config/prisma.service';
import { validateTenantQuery } from '../../tenant/validators/tenant.validator';

const tenantService = new TenantService(prisma);

export class PlatformTenantController {
  static async getTenants(req: Request, res: Response, next: NextFunction) {
    try {
      const query = validateTenantQuery(req.query);
      
      const result = await tenantService.getAllTenants({
        page: query.page,
        limit: query.limit,
        search: query.search,
        status: query.status,
      });
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async approveTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;
      const actorUserId = req.context!.userId;
      
      const tenant = await tenantService.approveTenant(tenantId as string, actorUserId);
      
      res.json({
        success: true,
        data: tenant
      });
    } catch (error) {
      next(error);
    }
  }

  static async suspendTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;
      const actorUserId = req.context!.userId;
      
      const tenant = await tenantService.suspendTenant(tenantId as string, actorUserId);
      
      res.json({
        success: true,
        data: tenant
      });
    } catch (error) {
      next(error);
    }
  }

  static async activateTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;
      const actorUserId = req.context!.userId;
      
      const tenant = await tenantService.activateTenant(tenantId as string, actorUserId);
      
      res.json({
        success: true,
        data: tenant
      });
    } catch (error) {
      next(error);
    }
  }

  static async archiveTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;
      const actorUserId = req.context!.userId;
      
      const tenant = await tenantService.archiveTenant(tenantId as string, actorUserId);
      
      res.json({
        success: true,
        data: tenant
      });
    } catch (error) {
      next(error);
    }
  }
}
