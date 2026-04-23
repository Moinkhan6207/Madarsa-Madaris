import { Router } from 'express';
import { TenantController } from '../controllers/tenant.controller';
import { OnboardingController } from '../controllers/onboarding.controller';
import { ProfileController, BrandingController, BranchController, SessionController } from '../controllers/setup.controller';
import { upload } from '../../../common/middleware/upload.middleware';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { tenantContextMiddleware } from '../../../common/middleware/tenant-context.middleware';
import { cmsRoutes } from '../../cms/routes/cms.routes';
import { leadRoutes } from '../../leads/routes/lead.routes';

const router = Router();

// All tenant routes require auth + tenant context
router.use(authMiddleware);
router.use(tenantContextMiddleware);

// ── Tenant Selection ───────────────────────────────────────────────────────
router.get('/me', TenantController.getMe);

// ── Onboarding Progress ────────────────────────────────────────────────────
router.get('/onboarding', OnboardingController.getStatus);
router.patch('/onboarding/step', OnboardingController.updateStep);
router.post('/onboarding/finalize', OnboardingController.finalize);

// ── Institution Profile ────────────────────────────────────────────────────
router.get('/profile', ProfileController.get);
router.put('/profile', ProfileController.update);

// ── Branding ───────────────────────────────────────────────────────────────
router.get('/branding', BrandingController.get);
router.put('/branding', BrandingController.update);
router.post('/branding/upload/:type', upload.single('file'), BrandingController.uploadImage);

// ── Branches ───────────────────────────────────────────────────────────────
router.get('/branches', BranchController.list);
router.post('/branches', BranchController.create);
router.patch('/branches/:branchId', BranchController.update);
router.delete('/branches/:branchId', BranchController.remove);

// ── Academic Sessions ──────────────────────────────────────────────────────
router.get('/academic-sessions', SessionController.list);
router.post('/academic-sessions', SessionController.create);
router.delete('/academic-sessions/:sessionId', SessionController.remove);

// ── Website Builder & CMS ──────────────────────────────────────────────────
router.use('/cms', cmsRoutes);

// ── Lead Engine ────────────────────────────────────────────────────────────
router.use('/leads', leadRoutes);

export { router as tenantRoutes };
