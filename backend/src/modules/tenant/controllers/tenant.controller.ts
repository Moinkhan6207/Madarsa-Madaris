import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../services/tenant.service';
import { CreateTenantDto } from '../dto/tenant.dto';
import { prisma } from '../../../config/prisma.service';

const tenantService = new TenantService(prisma);

export class TenantController {
  
  static async createTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const payload: CreateTenantDto = req.body;
      const actorUserId = req.user?.id || 'SYSTEM_API'; // In a real system, actor comes from valid auth
      
      const result = await tenantService.createTenant(payload, actorUserId);
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId } = req.params;
      
      const result = await tenantService.getTenantById(tenantId as string);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.context!.tenantId;
      
      if (!tenantId) {
        res.status(200).json({
          success: true,
          data: null
        });
        return;
      }
      
      // Use lightweight method for faster response
      const result = await tenantService.getTenantMe(tenantId as string);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
