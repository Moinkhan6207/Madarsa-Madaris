import React from 'react';
import HeroBlock from './blocks/HeroBlock';
import AboutBlock from './blocks/AboutBlock';
import StatsBlock from './blocks/StatsBlock';
import CTABlock from './blocks/CTABlock';
import GalleryBlock from './blocks/GalleryBlock';
import CourseListBlock from './blocks/CourseListBlock';
import DonationBannerBlock from './blocks/DonationBannerBlock';
import TestimonialsBlock from './blocks/TestimonialsBlock';
import FormBlock from './blocks/FormBlock';

interface PublicRendererProps {
  settings: any;
  page: any;
  tenant: any;
  navigation?: any[];
}

const componentMap: Record<string, any> = {
  'hero': HeroBlock,
  'about': AboutBlock,
  'stats': StatsBlock,
  'cta': CTABlock,
  'gallery': GalleryBlock,
  'courses': CourseListBlock,
  'donation-banner': DonationBannerBlock,
  'testimonials': TestimonialsBlock,
  'form': FormBlock,
  'events': HeroBlock, // Placeholder for events
  'results': StatsBlock, // Placeholder for results
};

export default function PublicRenderer({ settings, page, tenant }: PublicRendererProps) {
  const blocks = page?.blocks || [];

  return (
    <main className="min-h-screen bg-white">
      {blocks.length > 0 ? blocks.map((block: any, index: number) => {
        const Component = componentMap[block.type];
        if (!Component) return <div key={index} className="p-4 border border-dashed border-red-200 text-red-500 text-xs text-center">Unknown Block: {block.type}</div>;
        
        // Determine content based on current language structure
        const lang = settings?.primaryLanguage || 'en';
        const blockContent = block.content?.[lang] || block.content?.['en'] || block.content || {};
        
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
