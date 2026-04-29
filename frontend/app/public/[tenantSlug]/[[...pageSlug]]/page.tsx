import React from 'react';
import { Metadata } from 'next';
import PublicRenderer from '@/components/cms/PublicRenderer';

// Cache duration - 5 minutes in production
const REVALIDATE_SECONDS = process.env.NODE_ENV === 'production' ? 300 : 0;

// Simple in-memory cache for metadata generation
let metadataCache: Record<string, { data: any; timestamp: number }> = {};
const METADATA_CACHE_TTL = 30000; // 30 seconds

async function getPageData(tenantSlug: string, pageSlug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
  
  try {
    const res = await fetch(`${apiUrl}/public/website/${tenantSlug}/${pageSlug}`, { 
      next: { revalidate: REVALIDATE_SECONDS },
      ...(REVALIDATE_SECONDS > 0 && {
        cache: 'force-cache',
      }),
    });

    if (!res.ok) {
      if (res.status === 404) return { success: false, notFound: true };
      throw new Error(`Failed to fetch page data: ${res.statusText}`);
    }
    
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Fetch error:', e);
    return { success: false, error: true };
  }
}

// Cached version for metadata generation
async function getPageDataCached(tenantSlug: string, pageSlug: string) {
  const cacheKey = `${tenantSlug}:${pageSlug}`;
  const cached = metadataCache[cacheKey];
  
  if (cached && Date.now() - cached.timestamp < METADATA_CACHE_TTL) {
    return cached.data;
  }
  
  const data = await getPageData(tenantSlug, pageSlug);
  if (data?.success) {
    metadataCache[cacheKey] = { data, timestamp: Date.now() };
  }
  return data;
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { tenantSlug, pageSlug } = await params;
  const slug = (pageSlug && pageSlug.length > 0) ? pageSlug[pageSlug.length - 1] : 'home';
  // Use cached version to avoid duplicate requests
  const result = await getPageDataCached(tenantSlug, slug);

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
             The page &ldquo;{slug}&rdquo; you are looking for doesn&apos;t exist or has been moved to a new destination.
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

// ISR: Revalidate pages every 5 minutes
export const revalidate = 300;
