import { PrismaClient } from '@prisma/client';
import { AppError } from '../../../common/errors/AppError';
import { emailService } from '../../../common/email/email.service';
import { CmsService } from '../../cms/services/cms.service';

export class OnboardingService {
  private cmsService: CmsService;
  
  constructor(private readonly prisma: PrismaClient) {
    this.cmsService = new CmsService(prisma);
  }

  async getOnboardingStatus(tenantId: string) {
    const status = await this.prisma.onboardingProgress.findUnique({
      where: { tenantId }
    });

    if (!status) {
      throw new AppError('Onboarding status not found', 404, 'ONBOARDING_NOT_FOUND');
    }

    return status;
  }

  async updateStepStatus(tenantId: string, stepName: string, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED') {
    const validSteps = ['accountStep', 'profileStep', 'brandingStep', 'branchStep', 'sessionStep', 'adminStep', 'finalizationStep'];
    if (!validSteps.includes(stepName)) {
      throw new AppError('Invalid step name', 400, 'INVALID_STEP');
    }

    const updated = await this.prisma.onboardingProgress.update({
      where: { tenantId },
      data: {
        [stepName]: status,
      }
    });

    return updated;
  }

  async finalizeOnboarding(tenantId: string) {
    const progress = await this.prisma.onboardingProgress.findUnique({ where: { tenantId } });
    if (!progress) throw new AppError('Not found', 404, 'ONBOARDING_NOT_FOUND');

    // Simulate validation that all required steps are COMPLETED or SKIPPED
    const required = ['profileStep', 'brandingStep', 'branchStep', 'sessionStep'];
    const incomplete = required.filter(step => progress[step as keyof typeof progress] === 'NOT_STARTED' || progress[step as keyof typeof progress] === 'IN_PROGRESS');

    if (incomplete.length > 0) {
      throw new AppError('Cannot finalize onboarding with incomplete steps', 400, 'ONBOARDING_INCOMPLETE', true, { incomplete });
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.onboardingProgress.update({
        where: { tenantId },
        data: { finalizationStep: 'COMPLETED', completedAt: new Date() }
      });
      
      const tenant = await tx.tenant.update({
        where: { id: tenantId },
        data: { status: 'PENDING_ACTIVATION' },
        include: { 
          users: { 
            where: { isActive: true },
            take: 1 
          } 
        }
      });

      // FR-3: Automatically bootstrap the website pages during finalization
      await this.cmsService.bootstrapWebsite(tenantId, tx);

      return tenant;
    });

    // Send Onboarding Completed Email
    if (result.users[0]) {
      emailService.sendOnboardingCompletedEmail(result.users[0].email, result.displayName);
    }

    return { finalized: true };
  }
}
