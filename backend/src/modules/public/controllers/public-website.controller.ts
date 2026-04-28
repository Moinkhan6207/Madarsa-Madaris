import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';
import { prisma } from '../../../config/prisma.service';

// 5 minutes cache for public pages
const publicCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export class PublicWebsiteController {
  static async getPage(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantSlug, pageSlug } = req.params;
      
      const pageWhere: any = { isPublished: true, deletedAt: null };
      if (!pageSlug) {
        pageWhere.OR = [{ isHomePage: true }, { slug: 'home' }];
      } else {
        pageWhere.slug = pageSlug;
      }

      const cacheKey = `page:${tenantSlug}:${pageSlug || 'root'}`;

      // 1. Try Cache
      const cachedData = publicCache.get(cacheKey);
      if (cachedData) {
        return res.json({ success: true, data: cachedData, source: 'cache' });
      }

      // 2. Optimized DB Query
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug as string },
        select: {
          id: true,
          slug: true,
          displayName: true,
          websiteSettings: true,
          pages: {
            where: { isPublished: true, deletedAt: null },
            select: {
              id: true,
              slug: true,
              title: true,
              isHomePage: true,
            },
            orderBy: { isHomePage: 'desc' },
          }
        }
      });

      if (!tenant) {
        return res.status(404).json({ success: false, message: 'Institution website not found' });
      }

      // Find the specific page requested
      const page = await prisma.page.findFirst({
        where: {
          tenantId: tenant.id,
          isPublished: true,
          deletedAt: null,
          ...( (pageSlug && pageSlug !== 'home')
            ? { slug: pageSlug } 
            : { OR: [{ isHomePage: true }, { slug: 'home' }] }
          )
        },

        include: {
          blocks: {
            orderBy: { order: 'asc' }
          }
        }
      });

      if (!page && pageSlug) {
        return res.status(404).json({ success: false, message: 'Page not found' });
      }

      const responseData = {
        tenant: {
          id: tenant.id,
          slug: tenant.slug,
          displayName: tenant.displayName
        },
        settings: (tenant as any).websiteSettings,
        page: page || null,
        navigation: tenant.pages || []
      };


      // 3. Set Cache
      publicCache.set(cacheKey, responseData);

      return res.json({
        success: true,
        data: responseData,
        source: 'db'
      });
    } catch (e) { next(e); return; }
  }

  // Helper to clear cache (use when page is updated)
  static clearCache(tenantSlug: string, pageSlug?: string) {
    if (pageSlug) {
      publicCache.del(`page:${tenantSlug}:${pageSlug}`);
    } else {
      const keys = publicCache.keys().filter(k => k.startsWith(`page:${tenantSlug}:`));
      publicCache.del(keys);
    }
  }
}
