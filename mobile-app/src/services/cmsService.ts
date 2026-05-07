import { api } from '@/services/api';

export interface Page {
  id?: string;
  title: string;
  slug: string;
  isPublished: boolean;
  isHomePage?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  blocks?: PageBlock[];
}

export interface PageBlock {
  id?: string;
  type: string;
  content: any;
  config: any;
  order: number;
}

export interface WebsiteSettings {
  siteTitle?: string;
  metaDescription?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  footerText?: string;
  contactEmail?: string;
  contactPhone?: string;
  publicEmail?: string;
  publicPhone?: string;
  whatsappNumber?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
}

export const cmsService = {
  // Pages
  async listPages(): Promise<{ data: { pages: Page[]; total: number } }> {
    const response = await api.get('/tenant/cms/pages');
    return response.data;
  },

  async getPage(id: string): Promise<{ data: Page }> {
    const response = await api.get(`/tenant/cms/pages/${id}`);
    return response.data;
  },

  async createPage(data: Partial<Page>): Promise<{ data: Page }> {
    const response = await api.post('/tenant/cms/pages', data);
    return response.data;
  },

  async updatePage(id: string, data: Partial<Page>): Promise<{ data: Page }> {
    const response = await api.put(`/tenant/cms/pages/${id}`, data);
    return response.data;
  },

  async deletePage(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/tenant/cms/pages/${id}`);
    return response.data;
  },

  // Settings
  async getSettings(): Promise<{ data: WebsiteSettings }> {
    const response = await api.get('/tenant/cms/settings');
    return response.data;
  },

  async updateSettings(data: WebsiteSettings): Promise<{ data: WebsiteSettings }> {
    const response = await api.put('/tenant/cms/settings', data);
    return response.data;
  },

  // Bootstrap
  async bootstrapWebsite(): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/tenant/cms/pages/bootstrap', {});
    return response.data;
  },

  // Tenant Info
  async getTenantInfo(): Promise<{ success: boolean; data: any }> {
    const response = await api.get('/tenant/me');
    return response.data;
  },

  // Public page
  async getPublicPage(tenantSlug: string, pageSlug: string) {
    const normalized = pageSlug === 'home' ? '' : `/${pageSlug}`;
    const response = await api.get(`/public/${tenantSlug}${normalized}`);
    return response.data.data;
  },
};
