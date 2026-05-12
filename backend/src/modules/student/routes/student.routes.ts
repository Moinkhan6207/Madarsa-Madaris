import { Router } from 'express';
import { requirePermission } from '../../../common/middleware/permission.middleware';
import { StudentController } from '../controllers/student.controller';

const router = Router();

router.get('/', requirePermission('student.view'), StudentController.list);
router.post('/', requirePermission('student.create'), StudentController.create);
router.get('/:id', requirePermission('student.view'), StudentController.getById);
router.get('/:id/history', requirePermission('student.view'), StudentController.getHistory);
router.put('/:id', requirePermission('student.update'), StudentController.update);
router.patch('/:id/status', requirePermission('student.status.update'), StudentController.changeStatus);
router.delete('/:id', requirePermission('student.delete'), StudentController.softDelete);

router.post('/:id/guardians', requirePermission('student.guardian.manage'), StudentController.createGuardian);
router.post('/:id/sponsors', requirePermission('student.sponsor.manage'), StudentController.mapSponsor);
router.delete(
  '/:id/sponsors/:sponsorId',
  requirePermission('student.sponsor.manage'),
  StudentController.unlinkSponsor
);

router.post('/:id/documents', requirePermission('student.update'), StudentController.createDocument);
router.delete('/:id/documents/:documentId', requirePermission('student.update'), StudentController.deleteDocument);

export { router as studentRoutes };
