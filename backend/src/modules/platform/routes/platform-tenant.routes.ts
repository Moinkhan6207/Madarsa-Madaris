import { Router } from 'express';
import { TenantController } from '../../tenant/controllers/tenant.controller';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { tenantContextMiddleware } from '../../../common/middleware/tenant-context.middleware';
import { requirePermission } from '../../../common/middleware/permission.middleware';

const router = Router();

// For Platform admin routes we authenticate them, but they might be on a system tenant.
// In MVP, we can just allow the endpoint.
router.use(authMiddleware);
router.use(tenantContextMiddleware);

const { PlatformTenantController } = require('../controllers/platform-tenant.controller');

// List Tenants (Super Admin)
router.get('/', requirePermission('tenant.view'), PlatformTenantController.getTenants);

// Create Tenant
router.post('/', requirePermission('tenant.create'), TenantController.createTenant);

// Get specific tenant
router.get('/:tenantId', requirePermission('tenant.view'), TenantController.getTenant);

// ─── Status Management (Super Admin) ────────────────────────────────────────

router.patch('/:tenantId/approve', requirePermission('tenant.approve'), PlatformTenantController.approveTenant);
router.patch('/:tenantId/suspend', requirePermission('tenant.suspend'), PlatformTenantController.suspendTenant);
router.patch('/:tenantId/activate', requirePermission('tenant.activate'), PlatformTenantController.activateTenant);
router.patch('/:tenantId/archive', requirePermission('tenant.archive'), PlatformTenantController.archiveTenant);

export { router as platformTenantRoutes };
