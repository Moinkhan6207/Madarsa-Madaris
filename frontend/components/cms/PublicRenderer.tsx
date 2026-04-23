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
import Navbar from './Navbar';
import Footer from './Footer';

interface PublicRendererProps {
  settings: any;
  page: any;
  tenant: any;
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
};

export default function PublicRenderer({ settings, page, tenant }: PublicRendererProps) {
  const blocks = page?.blocks || [];

  return (
    <div className="min-h-screen bg-white" style={{ 
      '--primary-color': settings?.primaryColor || '#10b981',
      '--secondary-color': settings?.secondaryColor || '#0f172a'
    } as React.CSSProperties}>
      
      <Navbar tenant={tenant} settings={settings} />

      <main>
        {blocks.map((block: any, index: number) => {
          const Component = componentMap[block.type];
          if (!Component) return <div key={index} className="p-4 border border-dashed border-red-200 text-red-500 text-xs">Unknown Block: {block.type}</div>;
          
          // Determine content based on current language structure
          const lang = settings?.primaryLanguage || 'en';
          const blockContent = block.content?.[lang] || block.content?.['en'] || block.content || {};
          
          return <Component key={index} content={blockContent} config={block.config} settings={settings} tenant={tenant} />;
        })}
      </main>

      <Footer settings={settings} tenant={tenant} />
    </div>
  );
}
