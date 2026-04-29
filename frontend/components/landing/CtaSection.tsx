'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CtaSection() {
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
    <section className="py-10 bg-white relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden transition-all duration-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Wave graphic overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-full">
              <path fill="white" d="M0,1000 C300,800 400,1000 1000,500 L1000,0 L0,0 Z"></path>
            </svg>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
              Start managing your Madarsa digitally today
            </h2>
            <p className="text-lg md:text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
              Join hundreds of institutions that have already upgraded to a smarter, faster, and more secure management system.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex justify-center items-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 active:scale-95 transition-all text-lg shadow-lg hover:shadow-xl group"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex justify-center items-center gap-2 bg-primary-700/50 text-white border border-primary-500/50 px-8 py-4 rounded-xl font-semibold hover:bg-primary-700 active:scale-95 transition-all text-lg"
              >
                Contact Sales
              </Link>
            </div>
            
            <p className="mt-8 text-sm text-primary-200">
              No long-term contracts. Simple setup. Top-tier support.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
