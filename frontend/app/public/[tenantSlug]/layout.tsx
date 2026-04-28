import React from 'react';
import Navbar from '@/components/cms/Navbar';
import Footer from '@/components/cms/Footer';

async function getSharedData(tenantSlug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
  
  try {
    // For the layout, we just need ANY page data to get the settings and navigation
    // We use 'home' as the default reference for these shared items
    const res = await fetch(`${apiUrl}/public/website/${tenantSlug}/home`, { 
      next: { revalidate: process.env.NODE_ENV === 'production' ? 60 : 0 } 
    });

    if (!res.ok) return null;
    return res.json();
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
      <Navbar 
        tenant={tenant} 
        settings={settings || {}} 
        navigation={navigation || []} 
      />
      
      <div className="flex-grow">
        {children}
      </div>

      <Footer 
        settings={settings || {}} 
        tenant={tenant} 
      />
      
      {/* Global CSS Variables for Tenant Branding */}
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
