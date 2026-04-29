import { Request, Response, NextFunction } from 'express';
import { CmsService } from '../services/cms.service';
import { MediaService } from '../services/media.service';
import { prisma } from '../../../config/prisma.service';
import { LocalStorageService } from '../../../common/storage/local-storage.service';
import { AppError } from '../../../common/errors/AppError';
import { PublicWebsiteController } from '../../public/controllers/public-website.controller';

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

      // Clear all public cache for this tenant when settings change
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { slug: true } });
      if (tenant?.slug) PublicWebsiteController.clearCache(tenant.slug);

      res.json({ success: true, data });
    } catch (e) { next(e); }
  }
}

export class CmsPageController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const { page, limit, search } = req.query;
      const data = await cmsService.listPages(tenantId, {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        search: search as string
      });
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
      
      console.log(`[DEBUG] Updating CMS Page ${id} for tenant ${tenantId}`);
      if (req.body.blocks) {
        console.log(`[DEBUG] Received ${req.body.blocks.length} blocks:`, JSON.stringify(req.body.blocks, null, 2));
      } else {
        console.log(`[DEBUG] No blocks provided in request body`);
      }

      const data = await cmsService.updatePage(tenantId, id as string, req.body);
      console.log(`[DEBUG] Update successful. Page slug: ${data.slug}. Blocks count in response:`, (data as any).blocks?.length);

      // Clear public page cache so updates are immediately live
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { slug: true } });
      if (tenant?.slug) {
        PublicWebsiteController.clearCache(tenant.slug, data.slug);
        // Also clear homepage cache in case isHomePage changed
        PublicWebsiteController.clearCache(tenant.slug, 'root');
      }

      res.json({ success: true, data });
    } catch (e) { 
      console.error('[DEBUG] Update failed:', e);
      next(e); 
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const { id } = req.params;
      // Get page slug before soft-delete to clear cache
      const page = await cmsService.getPage(tenantId, id as string);
      await cmsService.deletePage(tenantId, id as string);

      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { slug: true } });
      if (tenant?.slug) PublicWebsiteController.clearCache(tenant.slug, page.slug);

      res.json({ success: true, message: 'Page deleted' });
    } catch (e) { next(e); }
  }

  static async bootstrap(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const data = await cmsService.bootstrapWebsite(tenantId);

      // Clear all tenant cache after bootstrap
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { slug: true } });
      if (tenant?.slug) PublicWebsiteController.clearCache(tenant.slug);

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
