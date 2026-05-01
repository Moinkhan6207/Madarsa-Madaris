import { Request, Response, NextFunction } from 'express';
import { TenantStatsService } from '../services/tenant-stats.service';
import { prisma } from '../../../config/prisma.service';

const statsService = new TenantStatsService(prisma);

export class DashboardController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const stats = await statsService.getStats(tenantId);
      res.json({ success: true, data: stats });
    } catch (e) { next(e); }
  }

  static async refreshStats(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const stats = await statsService.refreshStats(tenantId);
      res.json({ success: true, data: stats });
    } catch (e) { next(e); }
  }
}
