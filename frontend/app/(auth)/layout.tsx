'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left Side: Illustration & Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-emerald-950 items-center justify-center overflow-hidden">
        {/* Background Image */}
        <Image 
          src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80" 
          alt="Islamic Architecture" 
          fill
          className="object-cover opacity-20 mix-blend-luminosity"
          priority
        />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-emerald-900/80 to-emerald-950/90" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[120px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[120px] -ml-32 -mb-32" />

        {/* Desktop Kalma - Centered at top */}
        <div className="absolute top-10 left-0 right-0 opacity-60 z-20 text-center">
            <span className="text-2xl font-serif text-white font-bold arabic-text tracking-widest" dir="rtl">
                لَا إِلٰهَ إِلَّا ٱلله مُحَمَّدٌ رَسُولُ ٱلله
            </span>
        </div>

        <div className="relative z-10 p-12 max-w-xl text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8 flex items-center justify-center lg:justify-start">
                <div className="bg-white p-2 rounded-2xl shadow-2xl">
                    <Image src="/assets/makka_sharif.png" alt="Logo" width={48} height={48} />
                </div>
                <span className="ml-4 text-3xl font-black tracking-tight text-white">IdaraSys</span>
            </div>
            
            <h1 className="text-5xl font-black mb-6 leading-tight">
              Manage your institution with <span className="text-emerald-400 font-serif">Barakah</span>.
            </h1>
            <p className="text-xl text-emerald-100 font-medium leading-relaxed mb-10">
              Modernizing Madarsas & Idaras with technology, keeping Islamic values at the core. Simple, efficient, and professional.
            </p>

            <div className="flex items-center gap-6">
                <div className="flex -space-x-3 overflow-hidden">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-emerald-900 bg-emerald-800 flex items-center justify-center text-xs font-bold text-emerald-200">
                           {i === 1 ? 'A' : i === 2 ? 'B' : i === 3 ? 'C' : 'D'}
                        </div>
                    ))}
                </div>
                <span className="text-sm font-semibold text-emerald-200">
                    Trusted by 50+ Institutions
                </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Auth Forms */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-gray-50/50 h-screen overflow-y-auto">
        <div className="absolute top-8 left-8 z-20">
          <Link 
            href="/"
            className="group flex items-center text-sm font-bold text-gray-500 hover:text-emerald-600 transition-all bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        {/* Mobile View Kalma - Reduced margin */}
        <div className="lg:hidden pt-20 pb-2 text-center opacity-90">
            <span className="text-xl font-serif text-black font-bold arabic-text tracking-widest" dir="rtl">
                لَا إِلٰهَ إِلَّا ٱلله مُحَمَّدٌ رَسُولُ ٱلله
            </span>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-12">
          {/* Bismillah on Desktop Right Side */}
          <div className="hidden lg:block text-center mb-8 opacity-90">
            <span className="text-xl font-serif text-black font-bold arabic-text tracking-widest" dir="rtl">
                بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </span>
          </div>

          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
