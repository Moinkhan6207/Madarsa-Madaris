import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';
import { prisma } from '../../../config/prisma.service';

// 5 minutes cache for public pages
const publicCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Cache key generator
const getCacheKey = (tenantSlug: string, pageSlug: string) => `page:${tenantSlug}:${pageSlug || 'home'}`;

export class PublicWebsiteController {
  static async getPage(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantSlug, pageSlug } = req.params;
      const normalizedSlug = pageSlug || 'home';
      const cacheKey = getCacheKey(tenantSlug as string, normalizedSlug as string);

      // 1. Try Cache
      const cachedData = publicCache.get(cacheKey);
      if (cachedData) {
        // Set cache headers for CDN/browser caching
        res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
        res.setHeader('X-Cache', 'HIT');
        return res.json({ success: true, data: cachedData, source: 'cache' });
      }

      // 2. Fetch tenant with optimized select
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug as string },
        select: {
          id: true,
          slug: true,
          displayName: true,
          websiteSettings: {
            select: {
              siteTitle: true,
              metaDescription: true,
              faviconUrl: true,
              logoUrl: true,
              primaryColor: true,
              secondaryColor: true,
              accentColor: true,
              footerText: true,
              contactEmail: true,
              contactPhone: true,
              whatsappNumber: true,
              facebookUrl: true,
              instagramUrl: true,
              twitterUrl: true,
              linkedinUrl: true,
              youtubeUrl: true,
            }
          },
        }
      });

      if (!tenant) {
        return res.status(404).json({ success: false, message: 'Institution website not found' });
      }

      // 3. Fetch all pages for navigation (lightweight)
      const allPages = await prisma.page.findMany({
        where: { 
          tenantId: tenant.id,
          isPublished: true, 
          deletedAt: null 
        },
        select: {
          id: true,
          slug: true,
          title: true,
          isHomePage: true,
        },
        orderBy: { isHomePage: 'desc' },
        take: 50, // Limit navigation items
      });

      // 4. Fetch specific page with blocks in parallel
      const targetPage = await prisma.page.findFirst({
        where: {
          tenantId: tenant.id,
          isPublished: true,
          deletedAt: null,
          ...(normalizedSlug !== 'home'
            ? { slug: normalizedSlug as string }
            : { OR: [{ isHomePage: true }, { slug: 'home' }] }
          )
        },
        include: {
          blocks: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              type: true,
              content: true,
              config: true,
              order: true,
            }
          }
        }
      });

      if (!targetPage && pageSlug) {
        return res.status(404).json({ success: false, message: 'Page not found' });
      }

      // Build optimized response
      const responseData = {
        tenant: {
          id: tenant.id,
          slug: tenant.slug,
          displayName: tenant.displayName
        },
        settings: tenant.websiteSettings,
        page: targetPage ? {
          id: targetPage.id,
          slug: targetPage.slug,
          title: targetPage.title,
          isHomePage: targetPage.isHomePage,
          metaTitle: targetPage.metaTitle,
          metaDescription: targetPage.metaDescription,
          ogImage: targetPage.ogImage,
          canonicalUrl: targetPage.canonicalUrl,
          blocks: targetPage.blocks || [],
        } : null,
        navigation: allPages || []
      };

      // 5. Set Cache
      publicCache.set(cacheKey, responseData);

      // Set cache headers
      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
      res.setHeader('X-Cache', 'MISS');

      return res.json({
        success: true,
        data: responseData,
        source: 'db'
      });
    } catch (e) { 
      next(e); 
      return; 
    }
  }

  // Helper to clear cache (use when page is updated)
  static clearCache(tenantSlug: string, pageSlug?: string) {
    if (pageSlug) {
      publicCache.del(getCacheKey(tenantSlug, pageSlug));
    } else {
      const keys = publicCache.keys().filter(k => k.startsWith(`page:${tenantSlug}:`));
      publicCache.del(keys);
    }
  }

  // Health check for cache status
  static getCacheStats() {
    return {
      keys: publicCache.keys().length,
      stats: publicCache.getStats()
    };
  }
}
