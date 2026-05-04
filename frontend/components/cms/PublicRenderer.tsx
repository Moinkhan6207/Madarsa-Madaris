import React from 'react';
import dynamic from 'next/dynamic';

interface PublicRendererProps {
  settings: any;
  page: any;
  tenant: any;
  navigation?: any[];
}

const componentMap: Record<string, any> = {
  hero: dynamic(() => import('./blocks/HeroBlock')),
  about: dynamic(() => import('./blocks/AboutBlock')),
  stats: dynamic(() => import('./blocks/StatsBlock')),
  cta: dynamic(() => import('./blocks/CTABlock')),
  gallery: dynamic(() => import('./blocks/GalleryBlock')),
  courses: dynamic(() => import('./blocks/CourseListBlock')),
  'donation-banner': dynamic(() => import('./blocks/DonationBannerBlock')),
  testimonials: dynamic(() => import('./blocks/TestimonialsBlock')),
  form: dynamic(() => import('./blocks/FormBlock')),
  events: dynamic(() => import('./blocks/HeroBlock')),
  results: dynamic(() => import('./blocks/StatsBlock')),
};

export default function PublicRenderer({ settings, page, tenant }: PublicRendererProps) {
  const blocks = page?.blocks || [];
  const lang = settings?.primaryLanguage || 'en';

  return (
    <main className="min-h-screen bg-white">
      {blocks.length > 0 ? blocks.map((block: any, index: number) => {
        const Component = componentMap[block.type];
        if (!Component) {
          return <div key={index} className="p-4 border border-dashed border-red-200 text-red-500 text-xs text-center">Unknown Block: {block.type}</div>;
        }

        const blockContent = block.content?.[lang] || block.content?.en || block.content || {};
        return <Component key={index} content={blockContent} config={block.config} settings={settings} tenant={tenant} />;
      }) : (
        <div className="py-40 text-center animate-fade-in">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl mx-auto flex items-center justify-center mb-6">
            <span className="text-4xl text-gray-200">∅</span>
          </div>
          <h2 className="text-xl font-bold text-gray-400 uppercase tracking-widest">No Content Found</h2>
          <p className="text-gray-300 mt-2">This page currently has no active content blocks.</p>
        </div>
      )}
    </main>
  );
}
