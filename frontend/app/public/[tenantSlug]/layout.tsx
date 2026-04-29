import React from 'react';
import { Suspense } from 'react';
import Navbar from '@/components/cms/Navbar';
import Footer from '@/components/cms/Footer';

// Cache duration - 5 minutes in production, no cache in development
const REVALIDATE_SECONDS = process.env.NODE_ENV === 'production' ? 300 : 0;

// Cache for layout data to avoid refetching during navigation
let layoutDataCache: Record<string, { data: any; timestamp: number }> = {};
const LAYOUT_CACHE_TTL = 60000; // 1 minute in-memory cache

async function getSharedData(tenantSlug: string) {
  // Check in-memory cache first
  const cached = layoutDataCache[tenantSlug];
  if (cached && Date.now() - cached.timestamp < LAYOUT_CACHE_TTL) {
    return cached.data;
  }

  const apiUrl = process.env.NEXT_PUBLIC_INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
  
  try {
    // For the layout, we just need ANY page data to get the settings and navigation
    // We use 'home' as the default reference for these shared items
    const res = await fetch(`${apiUrl}/public/website/${tenantSlug}/home`, { 
      next: { revalidate: REVALIDATE_SECONDS },
      // Add cache tags for on-demand revalidation
      ...(REVALIDATE_SECONDS > 0 && { 
        cache: 'force-cache',
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    
    // Store in memory cache
    if (data?.success) {
      layoutDataCache[tenantSlug] = { data, timestamp: Date.now() };
    }
    
    return data;
  } catch (e) {
    console.error('Shared data fetch error:', e);
    return null;
  }
}

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  const { tenantSlug } = await params;
  const result = await getSharedData(tenantSlug);

  if (!result?.success) {
    return <>{children}</>; // Fallback to raw children if fetch fails
  }

  const { settings, tenant, navigation } = result.data;

  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<div className="h-16 bg-white border-b" />}>
        <Navbar 
          tenant={tenant} 
          settings={settings || {}} 
          navigation={navigation || []} 
        />
      </Suspense>
      
      <div className="flex-grow">
        {children}
      </div>

      <Suspense fallback={<div className="h-32 bg-gray-900" />}>
        <Footer 
          settings={settings || {}} 
          tenant={tenant} 
        />
      </Suspense>
      
      {/* Global CSS Variables for Tenant Branding - Inline Critical CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary-color: ${settings?.primaryColor || '#10b981'};
          --secondary-color: ${settings?.secondaryColor || '#0f172a'};
          --accent-color: ${settings?.accentColor || '#f59e0b'};
        }
      `}} />
    </div>
  );
}

// Enable static generation with ISR for layout
export const revalidate = 300; // 5 minutes
