import { Request, Response, NextFunction } from 'express';
import { CmsService } from '../services/cms.service';
import { MediaService } from '../services/media.service';
import { prisma } from '../../../config/prisma.service';
import { LocalStorageService } from '../../../common/storage/local-storage.service';
import { AppError } from '../../../common/errors/AppError';

const cmsService = new CmsService(prisma);
const storageService = new LocalStorageService();
const mediaService = new MediaService(prisma, storageService);

export class CmsSettingsController {
  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const data = await cmsService.getSettings(tenantId);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const data = await cmsService.updateSettings(tenantId, req.body);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  }
}

export class CmsPageController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const data = await cmsService.listPages(tenantId);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const { id } = req.params;
      const data = await cmsService.getPage(tenantId, id as string);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const data = await cmsService.createPage(tenantId, req.body);
      res.status(201).json({ success: true, data });
    } catch (e) { next(e); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const { id } = req.params;
      const data = await cmsService.updatePage(tenantId, id as string, req.body);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const { id } = req.params;
      await cmsService.deletePage(tenantId, id as string);
      res.json({ success: true, message: 'Page deleted' });
    } catch (e) { next(e); }
  }

  static async bootstrap(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const data = await cmsService.bootstrapWebsite(tenantId);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  }
}

export class MediaController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const data = await mediaService.listMedia(tenantId);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  }

  static async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const file = req.file;
      const { type = 'IMAGE' } = req.body;

      if (!file) {
        throw new AppError('No file uploaded', 400, 'UPLOAD_REQUIRED');
      }

      const data = await mediaService.uploadMedia(tenantId, file, type as string);
      res.status(201).json({ success: true, data });
    } catch (e) { next(e); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const { id } = req.params;
      await mediaService.deleteMedia(tenantId, id as string);
      res.json({ success: true, message: 'Media deleted' });
    } catch (e) { next(e); }
  }
}
