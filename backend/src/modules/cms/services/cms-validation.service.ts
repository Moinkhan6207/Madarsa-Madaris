import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';

export const BlockSchema = z.object({
  type: z.enum(['hero', 'about', 'stats', 'cta', 'gallery', 'courses', 'testimonials', 'donation-banner', 'form']),
  content: z.record(z.any()),
  config: z.record(z.any()).optional(),
  order: z.number().int().optional(),
});

export const PageSchema = z.object({
  title: z.string().min(2).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  isPublished: z.boolean().optional(),
  isHomePage: z.boolean().optional(),
  metaTitle: z.string().max(70).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  ogImage: z.string().url().optional().or(z.literal('')).nullable(),
  canonicalUrl: z.string().url().optional().or(z.literal('')).nullable(),
  blocks: z.array(BlockSchema).optional(),
});

export class CmsValidationService {
  /**
   * Deeply sanitizes all strings in an object to prevent XSS
   */
  static sanitizeContent(data: any): any {
    if (typeof data === 'string') {
      return sanitizeHtml(data, {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'span'],
        allowedAttributes: {
          'a': ['href', 'target']
        },
        allowedIframeHostnames: ['www.youtube.com']
      });
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeContent(item));
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeContent(value);
      }
      return sanitized;
    }

    return data;
  }

  static validatePage(data: any) {
    return PageSchema.parse(data);
  }

  static validateUpdatePage(data: any) {
    return PageSchema.partial().parse(data);
  }
}
