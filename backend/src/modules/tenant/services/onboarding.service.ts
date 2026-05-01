import { PrismaClient } from '@prisma/client';
import NodeCache from 'node-cache';
import { AppError } from '../../../common/errors/AppError';
import { emailService } from '../../../common/email/email.service';
import { CmsService } from '../../cms/services/cms.service';
import { TenantService } from './tenant.service';

// Cache for onboarding data - 10 minutes TTL
const onboardingCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

export class OnboardingService {
  private cmsService: CmsService;
  private tenantService: TenantService;

  constructor(private readonly prisma: PrismaClient) {
    this.cmsService = new CmsService(prisma);
    this.tenantService = new TenantService(prisma);
  }

  async getOnboardingStatus(tenantId: string) {
    // Check cache first
    const cacheKey = `onboarding:${tenantId}`;
    const cached = onboardingCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const status = await this.prisma.onboardingProgress.findUnique({
      where: { tenantId }
    });

    if (!status) {
      throw new AppError('Onboarding status not found', 404, 'ONBOARDING_NOT_FOUND');
    }

    // Cache the result
    onboardingCache.set(cacheKey, status);
    return status;
  }

  // Clear cache when onboarding is updated
  clearOnboardingCache(tenantId: string) {
    onboardingCache.del(`onboarding:${tenantId}`);
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

    // Clear cache after update
    this.clearOnboardingCache(tenantId);
    return updated;
  }

  async finalizeOnboarding(tenantId: string) {
    const progress = await this.prisma.onboardingProgress.findUnique({ where: { tenantId } });
    if (!progress) throw new AppError('Not found', 404, 'ONBOARDING_NOT_FOUND');

    // Idempotency: if already finalized, return success immediately.
    if (progress.finalizationStep === 'COMPLETED') {
      return { finalized: true };
    }

    // Simulate validation that all required steps are COMPLETED or SKIPPED
    const required = ['profileStep', 'brandingStep', 'branchStep', 'sessionStep'];
    const incomplete = required.filter(step => progress[step as keyof typeof progress] === 'NOT_STARTED' || progress[step as keyof typeof progress] === 'IN_PROGRESS');

    if (incomplete.length > 0) {
      throw new AppError('Cannot finalize onboarding with incomplete steps', 400, 'ONBOARDING_INCOMPLETE', true, { incomplete });
    }

    // FR-3: Bootstrap website pages before finalizing status.
    // This is heavy and should not run inside a short onboarding transaction.
    await this.cmsService.bootstrapWebsite(tenantId);

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.onboardingProgress.update({
        where: { tenantId },
        data: { finalizationStep: 'COMPLETED', completedAt: new Date() }
      });
      
      return tx.tenant.update({
        where: { id: tenantId },
        data: { status: 'PENDING_ACTIVATION' },
        include: { 
          users: { 
            where: { isActive: true },
            take: 1 
          } 
        }
      });
    });

    // Send Onboarding Completed Email
    if (result.users[0]) {
      emailService.sendOnboardingCompletedEmail(result.users[0].email, result.displayName);
    }

    // Clear cache after finalization
    this.clearOnboardingCache(tenantId);
    this.tenantService.clearTenantCache(tenantId);
    return { finalized: true };
  }
}
