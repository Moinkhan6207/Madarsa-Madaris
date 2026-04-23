import { z } from 'zod';

export const WebsiteSettingsSchema = z.object({
  siteTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  footerText: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
});

export const PageBlockSchema = z.object({
  type: z.string(),
  content: z.record(z.any()),
  config: z.record(z.any()).optional(),
  order: z.number().optional(),
});

export const PageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  isPublished: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  blocks: z.array(PageBlockSchema).optional(),
});

export const LeadSchema = z.object({
  type: z.enum(['ADMISSION', 'CONTACT', 'INQUIRY', 'VOLUNTEER']),
  formData: z.record(z.any()),
});
