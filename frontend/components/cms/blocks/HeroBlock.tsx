'use client';
import React from 'react';
import Image from 'next/image';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

const HeroBlock = React.memo(({ content, settings, tenant }: any) => {
  const primary = settings?.primaryColor || '#10b981';
  const secondary = settings?.secondaryColor || '#0f172a';
  const tenantSlug = tenant?.slug;
  const hasImage = !!content.imageUrl;
  const hasVideo = !!content.videoUrl;

  return (
    <section className="relative min-h-[90vh] overflow-hidden flex items-center justify-center py-20 px-6" style={{ background: secondary }}>
      {hasImage && (
        <div className="absolute inset-0 z-0">
          <Image src={content.imageUrl} alt="Hero" fill className="object-cover scale-110" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40" style={{ '--tw-gradient-to': secondary } as React.CSSProperties}></div>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full blur-[100px] opacity-20 animate-pulse" style={{ background: primary }} />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full blur-[120px] opacity-20 animate-pulse" style={{ background: primary, animationDelay: '1.5s' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(${primary} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 w-full text-center">
        <div className="inline-flex flex-col items-center animate-[fadeIn_500ms_ease-out]">
          {content.badge && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 border backdrop-blur-md transition-transform hover:scale-105" style={{ color: primary, borderColor: `${primary}40`, background: `${primary}15` }}>
              <Sparkles className="w-3 h-3" />
              {content.badge}
            </div>
          )}

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] tracking-tight max-w-5xl mb-8">
            {content.title || 'Empowering Future Generations'}
          </h1>

          <p className="text-lg md:text-2xl text-gray-300 font-medium leading-relaxed max-w-3xl mb-12">
            {content.subtitle || 'Providing high-quality Islamic education and moral values in a modern environment.'}
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            <a href={content.ctaLink || (tenantSlug ? `/public/${tenantSlug}/admission` : '#')} className="group relative flex items-center gap-3 px-10 py-5 text-white rounded-2xl font-bold text-xl transition-all shadow-2xl overflow-hidden hover:-translate-y-1" style={{ background: primary }}>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
              {content.ctaText || 'Apply for Admission'}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </a>

            {hasVideo ? (
              <a href={content.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-10 py-5 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-xl hover:bg-white/10 transition-all backdrop-blur-xl hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"><Play className="w-6 h-6 fill-white" /></div>
                Watch Trailer
              </a>
            ) : (
              <a href={tenantSlug ? `/public/${tenantSlug}/courses` : '#'} className="inline-flex items-center gap-3 px-10 py-5 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-xl hover:bg-white/10 transition-all backdrop-blur-xl hover:-translate-y-1">
                Explore Courses
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

HeroBlock.displayName = 'HeroBlock';

export default HeroBlock;
