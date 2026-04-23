import { Router } from 'express';
import { LeadController } from '../controllers/lead.controller';

const router = Router();

router.get('/', LeadController.list);
router.get('/:id', LeadController.get);
router.patch('/:id/status', LeadController.updateStatus);

export { router as leadRoutes };
