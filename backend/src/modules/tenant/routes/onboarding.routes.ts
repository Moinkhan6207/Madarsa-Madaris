import { Router } from 'express';
import { OnboardingController } from '../controllers/onboarding.controller';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { tenantContextMiddleware } from '../../../common/middleware/tenant-context.middleware';
import { requirePermission } from '../../../common/middleware/permission.middleware';

const router = Router();

router.use(authMiddleware);
router.use(tenantContextMiddleware);

router.get('/', requirePermission('onboarding.view'), OnboardingController.getStatus);
router.patch('/step', requirePermission('onboarding.update'), OnboardingController.updateStep);
router.post('/finalize', requirePermission('onboarding.finalize'), OnboardingController.finalize);

export { router as onboardingRoutes };
