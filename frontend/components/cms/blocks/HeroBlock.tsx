
import React from 'react';

export default function HeroBlock({ content, config, settings }: any) {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-[var(--secondary-color)]">
      {/* Abstract Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[var(--primary-color)] opacity-5 transform skew-x-12 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-[var(--primary-color)] opacity-10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
            {content.title || 'Empowering Future Generations'}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 font-medium leading-relaxed max-w-2xl">
            {content.subtitle || 'Providing high-quality Islamic education and moral values in a modern environment.'}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button className="px-8 py-4 bg-[var(--primary-color)] text-white rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-emerald-900/50">
              {content.ctaText || 'Admissions Open'}
            </button>
            <button className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-sm">
              Explore Courses
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
