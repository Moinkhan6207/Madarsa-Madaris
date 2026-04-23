import React from 'react';
import Image from 'next/image';

export default function GalleryBlock({ content, config }: any) {
  const images = content.images || [];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight uppercase">{content.title || 'Institutional Gallery'}</h2>
          <p className="text-gray-500 mt-4 font-medium uppercase tracking-widest text-xs">{content.subtitle || 'Glimpses of our activities and campus Life'}</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.length > 0 ? images.map((img: any, i: number) => (
            <div key={i} className="aspect-square relative group overflow-hidden rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-700">
              <Image 
                src={img.url} 
                alt={img.alt || 'Gallery Image'} 
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                 <p className="text-white text-[10px] font-bold uppercase tracking-widest">{img.caption || 'Campus View'}</p>
              </div>
            </div>
          )) : (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                Image Placeholder
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
