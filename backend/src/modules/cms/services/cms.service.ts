import { PrismaClient } from '@prisma/client';
import { AppError } from '../../../common/errors/AppError';
import { CmsValidationService } from './cms-validation.service';

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

  async listPages(tenantId: string) {
    return this.prisma.page.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
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

    return this.prisma.$transaction(async (tx) => {
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
  }

  async updatePage(tenantId: string, id: string, data: any) {
    // 1. Validate Schema
    const validatedData = CmsValidationService.validatePage(data);
    const { blocks, ...pageData } = validatedData;

    return this.prisma.$transaction(async (tx) => {
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
  }

  async deletePage(tenantId: string, id: string) {
    const page = await this.prisma.page.findFirst({
      where: { id, tenantId }
    });

    if (!page) {
      throw new AppError('Page not found', 404, 'PAGE_NOT_FOUND');
    }

    return this.prisma.page.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  // ─── Bootstrap ──────────────────────────────────────────────────────────────

  async bootstrapWebsite(tenantId: string) {
    const defaultPages = [
      {
        title: 'Home', slug: 'home', isPublished: true, isHomePage: true, blocks: [
          { type: 'hero', content: { title: 'Welcome to our Institution', subtitle: 'Empowering future generations', ctaText: 'Apply Now' }, order: 0 },
          { type: 'stats', content: { items: [{ label: 'Students', value: '500+' }, { label: 'Graduates', value: '1000+' }] }, order: 1 }
        ]
      },
      {
        title: 'About Us', slug: 'about', isPublished: true, isHomePage: false, blocks: [
          { type: 'about', content: { title: 'Our Story', description: 'We provide quality education based on strong values.' }, order: 0 }
        ]
      },
      {
        title: 'Courses', slug: 'courses', isPublished: true, isHomePage: false, blocks: [
          { type: 'courses', content: { title: 'Our Programs', items: ['Hifz', 'Aalimiyat', 'Nazra'] }, order: 0 }
        ]
      },
      {
        title: 'Admission', slug: 'admission', isPublished: true, isHomePage: false, blocks: [
          { type: 'hero', content: { title: 'Admissions Open', subtitle: 'Apply now for the upcoming academic year' }, order: 0 },
          { type: 'form', content: { formType: 'ADMISSION', title: 'Admission Form' }, order: 1 }
        ]
      },
      {
        title: 'Contact', slug: 'contact', isPublished: true, isHomePage: false, blocks: [
          { type: 'form', content: { formType: 'CONTACT', title: 'Get in Touch' }, order: 0 }
        ]
      },
      {
        title: 'Donation', slug: 'donation', isPublished: true, isHomePage: false, blocks: [
          { type: 'donation-banner', content: { title: 'Support Us', description: 'Your contribution makes a difference', ctaText: 'Donate' }, order: 0 }
        ]
      }
    ];

    return this.prisma.$transaction(async (tx) => {
      for (const page of defaultPages) {
        const { blocks, ...pageData } = page;
        const existing = await tx.page.findFirst({ where: { tenantId, slug: page.slug, deletedAt: null } });
        if (existing) continue;

        if (pageData.isHomePage) {
           await tx.page.updateMany({
             where: { tenantId, isHomePage: true, deletedAt: null },
             data: { isHomePage: false }
           });
        }

        const createdPage = await tx.page.create({
          data: { ...pageData, tenantId }
        });

        if (blocks.length > 0) {
          await tx.pageBlock.createMany({
            data: blocks.map((block, index) => ({
              type: block.type,
              content: { en: block.content },
              config: {},
              order: block.order !== undefined ? block.order : index,
              pageId: createdPage.id,
              tenantId
            }))
          });
        }
      }
      return { success: true, message: 'Website bootstrapped successfully' };
    });
  }
}
