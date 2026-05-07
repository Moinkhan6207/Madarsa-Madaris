export interface TenantProfile {
  id: string;
  name: string;
  slug?: string;
  status?: string;
  institutionType?: string;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  updatedAt?: string;
}
