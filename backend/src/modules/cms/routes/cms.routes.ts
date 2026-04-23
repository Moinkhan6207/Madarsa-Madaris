import { Router } from 'express';
import { CmsSettingsController, CmsPageController, MediaController } from '../controllers/cms.controller';
import { upload } from '../../../common/middleware/upload.middleware';

const router = Router();

// Website Settings
router.get('/settings', CmsSettingsController.get);
router.put('/settings', CmsSettingsController.update);

// Pages
router.get('/pages', CmsPageController.list);
router.post('/pages', CmsPageController.create);
router.post('/pages/bootstrap', CmsPageController.bootstrap);
router.get('/pages/:id', CmsPageController.get);
router.put('/pages/:id', CmsPageController.update);
router.delete('/pages/:id', CmsPageController.remove);

// Media
router.get('/media', MediaController.list);
router.post('/media/upload', upload.single('file'), MediaController.upload);
router.delete('/media/:id', MediaController.remove);

export { router as cmsRoutes };
