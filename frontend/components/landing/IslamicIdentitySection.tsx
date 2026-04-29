'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';

export function IslamicIdentitySection() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-12 bg-[#f8faf9] text-gray-900 relative overflow-hidden border-y border-emerald-100/50">
      {/* Decorative subtle elements */}
      <div className="absolute right-[-5%] top-[-10%] w-72 h-72 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-[-5%] bottom-[-10%] w-72 h-72 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div
          ref={ref}
          className={`flex flex-col items-center justify-center space-y-6 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-white shadow-md border border-emerald-100 flex items-center justify-center mb-2">
            <Heart className="w-8 h-8 text-emerald-600 fill-emerald-50" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-gray-900 leading-tight">
            Built with pure intention for
            <br className="hidden md:block" /> requirements of Madarsas & Maktabs
          </h2>
          
          <div className="flex items-center gap-4 w-full justify-center opacity-30">
            <div className="h-[1px] w-12 bg-emerald-600" />
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            <div className="h-[1px] w-12 bg-emerald-600" />
          </div>
          
          <p className="text-gray-700 max-w-2xl text-lg leading-relaxed font-medium">
            We understand that Islamic institutions have different operational needs than standard schools. <span className="text-emerald-700 font-bold">IdaraSys</span> is crafted carefully to respect and digitalize these specific structures effectively.
          </p>
        </div>
      </div>
    </section>
  );
}
