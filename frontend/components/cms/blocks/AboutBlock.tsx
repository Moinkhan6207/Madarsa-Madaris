'use client';
import React from 'react';
import Image from 'next/image';
import { CheckCircle2, Star, Award, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const AboutBlock = React.memo(({ content, config, settings }: any) => {
  const primary = settings?.primaryColor || '#10b981';
  const hasImage = !!content.imageUrl;

  return <section className="py-24 bg-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="pattern-circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1" fill={primary} />
          </pattern>
          <rect width="100%" height="100%" fill="url(#pattern-circles)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative">
            <motion.div whileHover={{ rotateY: 10, rotateX: -5, scale: 1.02 }} style={{ perspective: 1000 }} className="aspect-[4/5] bg-gray-100 rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] relative group cursor-pointer">
              {hasImage ? (
                <Image
                  src={content.imageUrl}
                  alt={content.title || 'About Us'}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-gray-50 to-gray-200">
                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 5, repeat: Infinity }} className="w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-white text-6xl font-black shadow-2xl relative z-10" style={{ background: `linear-gradient(135deg, ${primary}, ${primary}dd)` }}>ع</motion.div>
                  <div className="text-center">
                    <span className="font-black text-xl uppercase tracking-[0.3em] text-gray-400">Our Legacy</span>
                    <div className="w-12 h-1 bg-primary mx-auto mt-4 rounded-full" style={{ background: primary }}></div>
                  </div>
                </div>
              )}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="absolute bottom-10 left-10 right-10 backdrop-blur-xl bg-white/70 p-8 rounded-[2rem] border border-white/50 shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ background: primary }}>
                    <Star className="w-6 h-6 fill-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gray-900 leading-none">25+ Years</div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Trust & Excellence</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full blur-3xl -z-10 opacity-20" style={{ background: primary }}></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
            <motion.span whileInView={{ opacity: [0, 1], scale: [0.8, 1] }} className="text-[11px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full border inline-block mb-8" style={{ color: primary, background: `${primary}10`, borderColor: `${primary}30` }}>
              Who We Are
            </motion.span>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] mb-8">
              {content.title || 'A Legacy of Excellence in Education'}
            </h2>
            <div className="mt-8 space-y-6 text-gray-600 leading-relaxed font-medium text-lg">
              <p className="border-l-4 pl-6" style={{ borderColor: primary }}>
                {content.description || 'Our institution was founded with a vision to provide a balanced education that combines traditional Islamic values with modern academic excellence.'}
              </p>
              {content.description2 && <p>{content.description2}</p>}
            </div>
            {content.features && content.features.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
                {content.features.map((feat: string, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + (i * 0.1) }} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors group-hover:scale-110" style={{ background: `${primary}15`, color: primary }}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="text-gray-900 font-bold text-sm tracking-tight">{feat}</span>
                  </motion.div>
                ))}
              </div>
            )}
            <div className="mt-12 flex flex-wrap gap-6 text-center">
              <motion.a whileHover={{ scale: 1.05, boxShadow: `0 20px 40px ${primary}40` }} whileTap={{ scale: 0.95 }} href="#contact" className="px-10 py-5 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all" style={{ background: primary }}>Learn More</motion.a>
              <a href="#courses" className="px-10 py-5 bg-gray-50 text-gray-900 border border-gray-100 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-100 transition-all">Our Programs</a>
            </div>
            <div className="mt-16 pt-12 border-t border-gray-100 flex gap-8 items-center opacity-40 grayscale hover:grayscale-0 transition-all">
              <ShieldCheck className="w-8 h-8" />
              <Award className="w-8 h-8" />
              <div className="h-6 w-[1px] bg-gray-300"></div>
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Govt. Recognized</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>;
});

AboutBlock.displayName = 'AboutBlock';

export default AboutBlock;
