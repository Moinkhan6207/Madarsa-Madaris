'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="relative pt-8 pb-8 lg:pt-12 lg:pb-12 overflow-hidden">
      {/* Background decoration with Kaaba/Madina subtle blend */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-white/95 z-10 backdrop-blur-sm" />
        <Image 
          src="https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?auto=format&fit=crop&q=80" 
          alt="Kaaba Background" 
          fill
          className="object-cover opacity-30"
          priority
        />

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl bg-white/60 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/50 shadow-sm"
          >
            <div className="text-center sm:text-left mb-6">
              <span className="text-xl md:text-2xl font-serif text-primary-700 font-bold arabic-text tracking-widest drop-shadow-sm" dir="rtl">
                لَا إِلٰهَ إِلَّا ٱلله مُحَمَّدٌ رَسُولُ ٱلله
              </span>
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 border border-primary-200 text-primary-800 text-sm font-bold mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary-600"></span>
              The #1 Management Platform
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1] mb-6 drop-shadow-md">
              Modern Management for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-primary-500">Madarsas & Idaras</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-800 font-medium mb-8 leading-relaxed max-w-lg">
              Deeni aur duniyawi taleem ka mukammal nizam. Streamline admissions, fees, and operations all in one unified platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/register"
                className="inline-flex justify-center items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/20 active:scale-95 transition-all text-lg group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex justify-center items-center gap-2 bg-white text-gray-800 border-2 border-gray-300 px-8 py-4 rounded-xl font-bold hover:border-primary-500 hover:text-primary-700 active:scale-95 transition-all text-lg shadow-sm"
              >
                Login
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-sm text-gray-700 font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary-600" />
                <span>Setup in 5 minutes</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:ml-auto w-full"
          >
            {/* Soft background glow */}
            <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-3xl" />
            
            <div className="relative rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl p-2 lg:p-3 overflow-hidden">
              <div className="rounded-2xl overflow-hidden border border-gray-200/50 aspect-[4/3] relative">
                <Image 
                  src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80" 
                  alt="Masjid an-Nabawi" 
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-bold text-xl drop-shadow-md">Centralized Madarsa Hub</h3>
                  <p className="text-sm text-gray-200 drop-shadow-md">Manage everything with Barakah</p>
                </div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
