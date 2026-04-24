
import React from 'react';
import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';

export default function HeroBlock({ content, config, settings, tenant }: any) {
  const primary = settings?.primaryColor || '#10b981';
  const secondary = settings?.secondaryColor || '#0f172a';
  const tenantSlug = tenant?.slug;
  const hasImage = !!content.imageUrl;
  const hasVideo = !!content.videoUrl;

  return (
    <section
      className="relative min-h-[85vh] overflow-hidden flex items-center"
      style={{ background: secondary }}
    >
      {/* Background image with overlay */}
      {hasImage && (
        <>
          <img
            src={content.imageUrl}
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/20"></div>
        </>
      )}

      {/* Decorative elements */}
      {!hasImage && (
        <>
          <div
            className="absolute top-0 right-0 w-[40%] h-full opacity-5 transform skew-x-12 translate-x-1/2"
            style={{ background: primary }}
          ></div>
          <div
            className="absolute bottom-0 left-0 w-[30%] h-[50%] blur-3xl rounded-full -translate-x-1/2 translate-y-1/2 opacity-15"
            style={{ background: primary }}
          ></div>
        </>
      )}

      <div className="max-w-7xl mx-auto px-6 relative z-10 py-24 md:py-32 w-full">
        <div className={`${hasImage ? 'max-w-3xl' : 'max-w-3xl'}`}>
          {/* Badge */}
          {content.badge && (
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 border"
              style={{ color: primary, borderColor: `${primary}40`, background: `${primary}15` }}
            >
              {content.badge}
            </div>
          )}

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight">
            {content.title || 'Empowering Future Generations'}
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg md:text-xl text-gray-300 font-medium leading-relaxed max-w-2xl">
            {content.subtitle || 'Providing high-quality Islamic education and moral values in a modern environment.'}
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href={content.ctaLink || (tenantSlug ? `/public/${tenantSlug}/admission` : '#')}
              className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl"
              style={{ background: primary, boxShadow: `0 20px 40px ${primary}40` }}
            >
              {content.ctaText || 'Apply for Admission'}
              <ArrowRight className="w-5 h-5" />
            </a>

            {hasVideo ? (
              <a
                href={content.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                <Play className="w-5 h-5 fill-white" />
                Watch Video
              </a>
            ) : (
              <a
                href={tenantSlug ? `/public/${tenantSlug}/courses` : '#'}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                Explore Courses
              </a>
            )}
          </div>

          {/* Trust signals */}
          {content.stats && content.stats.length > 0 && (
            <div className="mt-16 flex flex-wrap gap-8">
              {content.stats.map((stat: any, i: number) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-black text-white">{stat.value}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/5 to-transparent"></div>
    </section>
  );
}
