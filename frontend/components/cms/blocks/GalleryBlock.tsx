
import React from 'react';
import Image from 'next/image';

export default function GalleryBlock({ content, config, settings }: any) {
  const images = content.images || [];
  const primary = settings?.primaryColor || '#10b981';

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <span 
            className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 inline-block"
            style={{ color: primary, background: `${primary}15` }}
          >
            Moments & Glimpses
          </span>
          <h2 className="text-3xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight uppercase mt-2">
            {content.title || 'Institutional Gallery'}
          </h2>
          <p className="text-gray-500 mt-4 font-medium max-w-2xl mx-auto">
            {content.subtitle || 'Experience our campus life through these captured moments of learning and celebration.'}
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.length > 0 ? images.map((img: any, i: number) => (
            <div 
              key={i} 
              className="group aspect-square relative overflow-hidden rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-700 cursor-pointer"
            >
              <Image 
                src={img.url} 
                alt={img.alt || 'Gallery Image'} 
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                 <div>
                    <div 
                      className="w-10 h-1 bg-white rounded-full mb-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
                      style={{ background: primary }}
                    ></div>
                    <p className="text-white text-xs font-bold uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      {img.caption || 'Campus View'}
                    </p>
                 </div>
              </div>
            </div>
          )) : (
            [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div 
                key={i} 
                className="aspect-square bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3 group hover:bg-emerald-50/20 hover:border-emerald-100 transition-all cursor-not-allowed"
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                   <div className="w-6 h-6 rounded-md bg-gray-100 group-hover:bg-emerald-100 transition-colors"></div>
                </div>
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Image Slot</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
