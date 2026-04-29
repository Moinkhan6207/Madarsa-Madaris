import { apiClient } from '@/lib/api';

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
  whatsappNumber?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
}

export interface PageBlock {
  id?: string;
  type: string;
  content: any;
  config: any;
  order: number;
}

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

export const cmsService = {
  getSettings: () => 
    apiClient.get<{ success: boolean; data: WebsiteSettings }>('/tenant/cms/settings'),
    
  updateSettings: (data: WebsiteSettings) => 
    apiClient.put<{ success: boolean; data: WebsiteSettings }>('/tenant/cms/settings', data),
  
  listPages: () => 
    apiClient.get<{ success: boolean; data: { pages: Page[]; total: number; page: number; limit: number } }>('/tenant/cms/pages'),
    
  getPage: (id: string) => 
    apiClient.get<{ success: boolean; data: Page }>(`/tenant/cms/pages/${id}`),
    
  createPage: (data: Partial<Page>) => 
    apiClient.post<{ success: boolean; data: Page }>('/tenant/cms/pages', data),
    
  updatePage: (id: string, data: Partial<Page>) => 
    apiClient.put<{ success: boolean; data: Page }>(`/tenant/cms/pages/${id}`, data),
    
  deletePage: (id: string) => 
    apiClient.delete<{ success: boolean; message: string }>(`/tenant/cms/pages/${id}`),

  bootstrapWebsite: () => 
    apiClient.post<{ success: boolean; message: string }>('/tenant/cms/pages/bootstrap', {}),

  getTenantInfo: () =>
    apiClient.get<{ success: boolean; data: any }>('/tenant/me'),
};

