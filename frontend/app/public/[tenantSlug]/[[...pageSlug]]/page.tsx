import React from 'react';
import { Metadata } from 'next';
import PublicRenderer from '@/components/cms/PublicRenderer';

async function getPageData(tenantSlug: string, pageSlug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
  
  try {
    const res = await fetch(`${apiUrl}/public/website/${tenantSlug}/${pageSlug}`, { 
      next: { revalidate: process.env.NODE_ENV === 'production' ? 60 : 0 }
    });

    if (!res.ok) {
      if (res.status === 404) return { success: false, notFound: true };
      throw new Error(`Failed to fetch page data: ${res.statusText}`);
    }
    return res.json();
  } catch (e) {
    console.error('Fetch error:', e);
    return { success: false, error: true };
  }
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { tenantSlug, pageSlug } = await params;
  const slug = (pageSlug && pageSlug.length > 0) ? pageSlug[pageSlug.length - 1] : 'home';
  const result = await getPageData(tenantSlug, slug);

  if (!result?.success || !result.data) return { title: 'Institution Website' };

  const { page, settings, tenant } = result.data;
  const title = page?.metaTitle || `${page?.title || 'Home'} | ${tenant.displayName}`;
  const description = page?.metaDescription || settings?.metaDescription || `Official website of ${tenant.displayName}`;
  const url = `${process.env.NEXT_PUBLIC_MAIN_DOMAIN}/public/${tenantSlug}/${slug === 'home' ? '' : slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: page?.canonicalUrl || url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: tenant.displayName,
      images: page?.ogImage ? [{ url: page.ogImage, width: 1200, height: 630 }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: page?.ogImage ? [page.ogImage] : [],
    }
  };
}

export default async function PublicPage({ params }: any) {
  const { tenantSlug, pageSlug } = await params;
  // Handle root home or specific slug
  const slug = (pageSlug && pageSlug.length > 0) ? pageSlug[pageSlug.length - 1] : 'home';
  
  const result = await getPageData(tenantSlug, slug);

  if (result?.notFound || (!result?.success && !result?.error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center max-w-md">
           <div className="text-[12rem] font-black text-gray-50 leading-none mb-4 select-none">404</div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tight -mt-20 relative z-10">PAGE NOT FOUND</h1>
           <p className="text-gray-500 mt-6 font-medium leading-relaxed">
             The page "{slug}" you are looking for doesn't exist or has been moved to a new destination.
           </p>
           <a 
            href={`/public/${tenantSlug}`} 
            className="inline-flex items-center gap-2 mt-10 px-10 py-5 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-2xl hover:shadow-gray-200"
           >
             Return Home
           </a>
        </div>
      </div>
    );
  }

  if (result?.error) {
    throw new Error("Unable to load page content at this time.");
  }

  const { settings, page, tenant, navigation } = result.data;

  return (
    <PublicRenderer 
      settings={settings || {}} 
      page={page || { title: 'Home', blocks: [] }} 
      tenant={tenant}
      navigation={navigation || []}
    />
  );
}
