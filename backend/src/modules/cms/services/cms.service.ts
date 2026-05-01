import { PrismaClient } from '@prisma/client';
import NodeCache from 'node-cache';
import { AppError } from '../../../common/errors/AppError';
import { CmsValidationService } from './cms-validation.service';

// Cache for CMS data - 10 minutes TTL
const cmsCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

export class CmsService {
  constructor(private readonly prisma: PrismaClient) {}

  // ─── Website Settings ────────────────────────────────────────────────────────

  async getSettings(tenantId: string) {
    const settings = await this.prisma.websiteSettings.findUnique({
      where: { tenantId }
    });
    if (!settings) {
      // If none, create default (should be bootstrapped normally)
      return this.prisma.websiteSettings.create({
        data: { tenantId }
      });
    }
    return settings;
  }

  async updateSettings(tenantId: string, data: any) {
    return this.prisma.websiteSettings.update({
      where: { tenantId },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  // ─── Pages ───────────────────────────────────────────────────────────────────

  async listPages(tenantId: string, params?: { page?: number; limit?: number; search?: string }) {
    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 20;
    const skip = (page - 1) * limit;

    // Check cache first
    const cacheKey = `pages:${tenantId}:${page}:${limit}:${params?.search || ''}`;
    const cached = cmsCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const where: any = { tenantId, deletedAt: null };
    if (params?.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { slug: { contains: params.search, mode: 'insensitive' } }
      ];
    }

    const [pages, total] = await Promise.all([
      this.prisma.page.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          isPublished: true,
          isHomePage: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { blocks: true }
          }
        }
      }),
      this.prisma.page.count({ where })
    ]);

    const result = { pages, total, page, limit };
    
    // Cache the result
    cmsCache.set(cacheKey, result);
    return result;
  }

  // Clear cache when pages are modified
  clearPagesCache(tenantId: string) {
    const keys = cmsCache.keys().filter(key => key.startsWith(`pages:${tenantId}`));
    cmsCache.del(keys);
  }

  async getPage(tenantId: string, id: string) {
    const page = await this.prisma.page.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { 
        blocks: { 
          orderBy: { order: 'asc' } 
        } 
      }
    });
    if (!page) {
      throw new AppError('Page not found', 404, 'PAGE_NOT_FOUND');
    }
    return page;
  }

  async createPage(tenantId: string, data: any) {
    // 1. Validate Schema
    const validatedData = CmsValidationService.validatePage(data);
    const { blocks, ...pageData } = validatedData;
    
    // 2. Sanitize Blocks
    const sanitizedBlocks = blocks ? CmsValidationService.sanitizeContent(blocks) : [];

    // Check if slug exists
    const existing = await this.prisma.page.findFirst({
      where: { tenantId, slug: pageData.slug, deletedAt: null }
    });
    if (existing) {
      throw new AppError('A page with this slug already exists', 400, 'DUPLICATE_SLUG');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // If setting as homepage, unset all others
      if ((pageData as any).isHomePage) {
        await tx.page.updateMany({
          where: { tenantId, isHomePage: true, deletedAt: null },
          data: { isHomePage: false }
        });
      }

      const page = await tx.page.create({
        data: {
          ...pageData as any,
          tenantId
        }
      });

      if (sanitizedBlocks.length > 0) {
        await tx.pageBlock.createMany({
          data: sanitizedBlocks.map((block: any, index: number) => ({
            type: block.type,
            content: block.content || {},
            config: block.config || {},
            order: block.order !== undefined ? block.order : index,
            pageId: page.id,
            tenantId
          }))
        });
      }

      return page;
    });

    // Clear cache after creation
    this.clearPagesCache(tenantId);
    return result;
  }

  async updatePage(tenantId: string, id: string, data: any) {
    // 1. Validate Schema (Partial allowed for updates)
    const validatedData = CmsValidationService.validateUpdatePage(data);
    const { blocks, ...pageData } = validatedData;

    const result = await this.prisma.$transaction(async (tx) => {
      // If setting as homepage, unset all others
      if ((pageData as any).isHomePage) {
        await tx.page.updateMany({
          where: { tenantId, isHomePage: true, id: { not: id }, deletedAt: null },
          data: { isHomePage: false }
        });
      }

      // 1. Update page metadata
      const updatedPage = await tx.page.update({
        where: { id, tenantId },
        data: {
          ...pageData as any,
          updatedAt: new Date()
        }
      });

      // 2. If blocks are provided, replace them with sanitized ones
      if (blocks !== undefined) {
        const sanitizedBlocks = CmsValidationService.sanitizeContent(blocks);
        
        // Delete existing blocks
        await tx.pageBlock.deleteMany({
          where: { pageId: id, tenantId }
        });

        // Insert new blocks
        if (sanitizedBlocks.length > 0) {
          await tx.pageBlock.createMany({
            data: sanitizedBlocks.map((block: any, index: number) => ({
              type: block.type,
              content: block.content || {},
              config: block.config || {},
              order: block.order !== undefined ? block.order : index,
              pageId: id,
              tenantId
            }))
          });
        }
      }

      return updatedPage;
    });

    // Clear cache after update
    this.clearPagesCache(tenantId);
    return result;
  }

  async deletePage(tenantId: string, id: string) {
    const page = await this.prisma.page.findFirst({
      where: { id, tenantId }
    });

    if (!page) {
      throw new AppError('Page not found', 404, 'PAGE_NOT_FOUND');
    }

    const result = await this.prisma.page.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    // Clear cache after deletion
    this.clearPagesCache(tenantId);
    return result;
  }

  // ─── Bootstrap ──────────────────────────────────────────────────────────────

  async bootstrapWebsite(tenantId: string, txClient?: any) {
    const defaultPages = [
      {
        title: 'Home', slug: 'home', isPublished: true, isHomePage: true, blocks: [
          { type: 'hero', content: { title: 'Welcome to our Institution', subtitle: 'Empowering future generations with quality Islamic education', ctaText: 'Apply Now', ctaLink: '/admission', imageUrl: '' }, order: 0 },
          { type: 'stats', content: { items: [{ label: 'Students', value: '500+' }, { label: 'Graduates', value: '1000+' }, { label: 'Years of Excellence', value: '20+' }, { label: 'Branches', value: '5+' }] }, order: 1 },
          { type: 'about', content: { title: 'About Our Institution', description: 'We provide quality education based on strong Islamic values and modern pedagogy.' }, order: 2 },
          { type: 'donation-banner', content: { title: 'Support Our Mission', description: 'Your generosity helps us educate the next generation', ctaText: 'Donate Now', campaignGoal: '100000', amountRaised: '0', currency: 'INR' }, order: 3 }
        ]
      },
      {
        title: 'About Us', slug: 'about', isPublished: true, isHomePage: false, blocks: [
          { type: 'about', content: { title: 'Our Story', description: 'Founded with the mission to provide authentic Islamic education, we have been empowering students for over two decades with knowledge, character and excellence.', imageUrl: '' }, order: 0 },
          { type: 'stats', content: { items: [{ label: 'Students Enrolled', value: '500+' }, { label: 'Alumni', value: '1000+' }, { label: 'Teachers', value: '30+' }, { label: 'Years', value: '20+' }] }, order: 1 },
          { type: 'testimonials', content: { title: 'What Students Say', testimonials: [{ name: 'Ahmed Ali', role: 'Graduate 2022', text: 'An institution that shaped my character for life.', imageUrl: '' }] }, order: 2 }
        ]
      },
      {
        title: 'Courses', slug: 'courses', isPublished: true, isHomePage: false, blocks: [
          { type: 'hero', content: { title: 'Our Programs', subtitle: 'Choose the path that aligns with your calling', ctaText: 'Apply Now' }, order: 0 },
          { type: 'courses', content: { title: 'Academic Programs', courses: [{ title: 'Hifz ul Quran', duration: '3-5 Years', description: 'Complete memorization of the Holy Quran with Tajweed' }, { title: 'Aalimiyat', duration: '7 Years', description: 'Comprehensive traditional Islamic scholarship program' }, { title: 'Nazra', duration: '1-2 Years', description: 'Quran reading with proper pronunciation and rules' }] }, order: 1 }
        ]
      },
      {
        title: 'Admission', slug: 'admission', isPublished: true, isHomePage: false, blocks: [
          { type: 'hero', content: { title: 'Admissions Open', subtitle: 'Join our institution for the upcoming academic year. Limited seats available.', ctaText: 'Apply Now' }, order: 0 },
          { type: 'form', content: { formType: 'ADMISSION', title: 'Admission Application Form', description: 'Fill in your details below and our admissions team will contact you.' }, order: 1 }
        ]
      },
      {
        title: 'Contact', slug: 'contact', isPublished: true, isHomePage: false, blocks: [
          { type: 'form', content: { formType: 'CONTACT', title: 'Get in Touch', description: 'Have a question? We\'d love to hear from you.' }, order: 0 }
        ]
      },
      {
        title: 'Donation', slug: 'donation', isPublished: true, isHomePage: false, blocks: [
          { type: 'hero', content: { title: 'Support Our Mission', subtitle: 'Every contribution, big or small, helps us continue building leaders of tomorrow', ctaText: 'Donate Now' }, order: 0 },
          { type: 'donation-banner', content: { title: 'Current Campaign: New Library Fund', description: 'Help us build a state-of-the-art library for our students. Your waqf (endowment) will create ongoing charitable reward.', ctaText: 'Donate Now', campaignGoal: '100000', amountRaised: '35000', currency: 'INR' }, order: 1 }
        ]
      },
      {
        title: 'Events', slug: 'events', isPublished: true, isHomePage: false, blocks: [
          { type: 'hero', content: { title: 'Events & Programs', subtitle: 'Stay up to date with our latest events, lectures and graduation ceremonies', ctaText: 'Contact Us' }, order: 0 },
          { type: 'cta', content: { title: 'Want to be notified of upcoming events?', buttonText: 'Contact Us', link: '/contact' }, order: 1 }
        ]
      },
      {
        title: 'Results', slug: 'results', isPublished: true, isHomePage: false, blocks: [
          { type: 'hero', content: { title: 'Academic Results', subtitle: 'Celebrating the achievements of our students and graduates', ctaText: 'View Programs' }, order: 0 },
          { type: 'stats', content: { items: [{ label: 'Pass Rate', value: '98%' }, { label: 'Distinctions', value: '120+' }, { label: 'Hifz Completions', value: '45' }, { label: 'Batch Year', value: '2024' }] }, order: 1 }
        ]
      },
      {
        title: 'Gallery', slug: 'gallery', isPublished: true, isHomePage: false, blocks: [
          { type: 'hero', content: { title: 'Our Gallery', subtitle: 'Moments from campus life, events and graduation ceremonies', ctaText: 'Explore' }, order: 0 },
          { type: 'gallery', content: { title: 'Campus Life', images: [] }, order: 1 }
        ]
      }
    ];

    const operation = async (tx: any) => {
      for (const page of defaultPages) {
        const { blocks, ...pageData } = page;
        const existing = await tx.page.findFirst({ 
          where: { tenantId, slug: page.slug, deletedAt: null } 
        });

        let pageId: string;

        if (existing) {
          // Update existing page (metadata + blocks)
          await tx.page.update({
             where: { id: existing.id },
             data: { 
               isPublished: true, 
               isHomePage: pageData.isHomePage || false,
               title: pageData.title 
             }
          });
          pageId = existing.id;
          
          // Clear old blocks before adding new ones
          await tx.pageBlock.deleteMany({ where: { pageId: pageId, tenantId } });
        } else {
          // Create new page
          const createdPage = await tx.page.create({
            data: { ...pageData, tenantId, isPublished: true }
          });
          pageId = createdPage.id;
        }

        // Add default blocks
        if (blocks.length > 0) {
          await tx.pageBlock.createMany({
            data: blocks.map((block: any, index: number) => ({
              type: block.type,
              content: block.content || {},
              config: block.config || {},
              order: block.order !== undefined ? block.order : index,
              pageId: pageId,
              tenantId
            }))
          });
        }
      }
      return { success: true, message: 'Website bootstrapped successfully' };
    };

    return txClient
      ? operation(txClient)
      : this.prisma.$transaction(operation, {
          maxWait: 10000,
          timeout: 60000,
        });
  }
}
