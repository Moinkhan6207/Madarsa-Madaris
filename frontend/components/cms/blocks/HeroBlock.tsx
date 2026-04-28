'use client';
import React from 'react';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function HeroBlock({ content, config, settings, tenant }: any) {
  const primary = settings?.primaryColor || '#10b981';
  const secondary = settings?.secondaryColor || '#0f172a';
  const tenantSlug = tenant?.slug;
  const hasImage = !!content.imageUrl;
  const hasVideo = !!content.videoUrl;

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);

  return <section className="relative min-h-[90vh] overflow-hidden flex items-center justify-center py-20 px-6" style={{ background: secondary }}>
      {hasImage && (
        <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
          <img src={content.imageUrl} alt="Hero" className="w-full h-full object-cover scale-110" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-secondary/100" style={{'--tw-gradient-to': secondary} as React.CSSProperties}></div>
        </motion.div>
      )}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 -left-20 w-64 h-64 rounded-full blur-[100px] opacity-20" style={{ background: primary }} />
        <motion.div animate={{ y: [0, 30, 0], rotate: [0, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full blur-[120px] opacity-20" style={{ background: primary }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(${primary} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 w-full text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="inline-flex flex-col items-center">
          {content.badge && (
            <motion.div whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 border backdrop-blur-md" style={{ color: primary, borderColor: `${primary}40`, background: `${primary}15` }}>
              <Sparkles className="w-3 h-3" />
              {content.badge}
            </motion.div>
          )}

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] tracking-tight max-w-5xl mb-8">
            {content.title?.split(' ').map((word: string, i: number) => (
              <motion.span key={i} initial={{ opacity: 0, filter: 'blur(10px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.5, delay: i * 0.1 }} className="inline-block mr-3">
                {word}
              </motion.span>
            )) || 'Empowering Future Generations'}
          </h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }} className="text-lg md:text-2xl text-gray-300 font-medium leading-relaxed max-w-3xl mb-12">
            {content.subtitle || 'Providing high-quality Islamic education and moral values in a modern environment.'}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="flex flex-wrap justify-center gap-6">
            <motion.a whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} href={content.ctaLink || (tenantSlug ? `/public/${tenantSlug}/admission` : '#')} className="group relative flex items-center gap-3 px-10 py-5 text-white rounded-2xl font-bold text-xl transition-all shadow-2xl overflow-hidden" style={{ background: primary }}>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
              {content.ctaText || 'Apply for Admission'}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </motion.a>

            {hasVideo ? (
              <motion.a whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} href={content.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-10 py-5 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-xl hover:bg-white/10 transition-all backdrop-blur-xl">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="w-6 h-6 fill-white" />
                </div>
                Watch Trailer
              </motion.a>
            ) : (
              <motion.a whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} href={tenantSlug ? `/public/${tenantSlug}/courses` : '#'} className="inline-flex items-center gap-3 px-10 py-5 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-xl hover:bg-white/10 transition-all backdrop-blur-xl">
                Explore Courses
              </motion.a>
            )}
          </motion.div>
        </motion.div>
      </div>

      <motion.div animate={{ rotate: 360, y: [0, -40, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute bottom-20 left-20 w-12 h-12 border-2 border-white/10 rounded-lg hidden lg:block" />
      <motion.div animate={{ rotate: -360, x: [0, 40, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-40 right-40 w-16 h-16 border-2 border-primary opacity-20 rotate-45 hidden lg:block" />

      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-10 left-1/2 -translate-x-1/2 w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1 opacity-50">
        <div className="w-1.5 h-2 bg-white rounded-full"></div>
      </motion.div>
    </section>;
}
