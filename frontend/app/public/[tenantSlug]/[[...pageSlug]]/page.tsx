import React from 'react';
import { Metadata } from 'next';
import PublicRenderer from '@/components/cms/PublicRenderer';

async function getPageData(tenantSlug: string, pageSlug?: string) {
  const slug = pageSlug || 'home';
  const apiUrl = process.env.NEXT_PUBLIC_INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
  
  try {
    const res = await fetch(`${apiUrl}/public/website/${tenantSlug}/${slug}`, { 
      next: { revalidate: 60 } // ISR: Revalidate every 60 seconds
    });

    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error('Fetch error:', e);
    return null;
  }
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { tenantSlug, pageSlug } = await params;
  const slug = (pageSlug && pageSlug.length > 0) ? pageSlug[pageSlug.length - 1] : 'home';
  const result = await getPageData(tenantSlug, slug);

  if (!result?.success) return { title: 'Institution Website' };

  const { page, settings, tenant } = result.data;
  const title = page?.metaTitle || `${page?.title || 'Home'} | ${tenant.displayName}`;
  const description = page?.metaDescription || settings?.metaDescription || `Official website of ${tenant.displayName}`;
  const url = `${process.env.NEXT_PUBLIC_MAIN_DOMAIN}/${tenantSlug}/${slug === 'home' ? '' : slug}`;

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
  const slug = (pageSlug && pageSlug.length > 0) ? pageSlug[pageSlug.length - 1] : 'home';
  
  const result = await getPageData(tenantSlug, slug);

  if (!result?.success || (!result.data.page && slug !== 'home')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
           <h1 className="text-9xl font-black text-gray-200 mb-4 animate-bounce">404</h1>
           <p className="text-2xl font-black text-gray-900 tracking-tight">PAGE NOT FOUND</p>
           <p className="text-gray-500 mt-3 font-semibold">The page you are looking for has been moved or deleted.</p>
           <a href="/" className="inline-block mt-8 px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all">
             Back to Home
           </a>
        </div>
      </div>
    );
  }

  const { settings, page, tenant } = result.data;

  return (
    <PublicRenderer 
      settings={settings} 
      page={page || { title: 'Home', blocks: [] }} 
      tenant={tenant}
    />
  );
}
