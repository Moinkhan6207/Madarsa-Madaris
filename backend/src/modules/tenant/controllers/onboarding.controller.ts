import { Request, Response, NextFunction } from 'express';
import { OnboardingService } from '../services/onboarding.service';
import { prisma } from '../../../config/prisma.service';

const onboardingService = new OnboardingService(prisma);

export class OnboardingController {
  
  static async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const result = await onboardingService.getOnboardingStatus(tenantId);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStep(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const { stepName, status } = req.body;
      
      const result = await onboardingService.updateStepStatus(tenantId, stepName, status);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async finalize(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      
      const result = await onboardingService.finalizeOnboarding(tenantId);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

}
