'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Maximize2, Search, Camera } from 'lucide-react';

const GalleryBlock = React.memo(({ content, config, settings }: any) => {
  const primary = settings?.primaryColor || '#10b981';
  const images = content.images || [];

  const placeholderImages = [1, 2, 3, 4, 5, 6];

  return <section className="py-24 bg-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-[11px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full border mb-6 inline-block" style={{ color: primary, background: `${primary}10`, borderColor: `${primary}30` }}>
            Visual Journey
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight mt-2">
            {content.title || 'Glimpses of Our Institution'}
          </motion.h2>
          <p className="text-gray-500 mt-6 font-medium max-w-2xl mx-auto text-lg">
            {content.subtitle || 'Experience our campus life through these captured moments of learning and celebration.'}
          </p>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {images.length > 0 ? images.map((img: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -10 }} className="relative rounded-[3rem] overflow-hidden group cursor-pointer shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] transition-all">
              <div className="relative aspect-[4/5] bg-gray-100">
                <Image
                  src={img.url}
                  alt={img.alt || 'Gallery image'}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-10">
                <div className="flex items-center justify-between translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div>
                    <div className="text-white font-black text-2xl mb-1">{img.caption || 'Campus View'}</div>
                    <div className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Institutional Gallery</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl" style={{ background: primary }}>
                    <Maximize2 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="absolute top-6 right-6 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                <Search className="w-5 h-5 text-white" />
              </div>
            </motion.div>
          )) : placeholderImages.map((_, i) => (
            <div key={i} className="aspect-square bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-4 transition-all">
               <Camera className="w-10 h-10 text-gray-200" />
               <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Image Slot</span>
            </div>
          ))}
        </div>
      </div>
    </section>;
});

GalleryBlock.displayName = 'GalleryBlock';

export default GalleryBlock;
