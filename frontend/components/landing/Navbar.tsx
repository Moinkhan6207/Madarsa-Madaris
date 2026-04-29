'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, Home, Zap, Heart, Mail, Layout, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
const makkaSharif = '/assets/makka_sharif.png';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: '#features', label: 'Features', icon: Zap },
    { href: '#how-it-works', label: 'How it Works', icon: Layout },
    { href: '#benefits', label: 'Benefits', icon: Heart },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b border-transparent',
        isScrolled || mobileMenuOpen ? 'bg-white shadow-md border-gray-100 py-3' : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group z-50">
            <div className="bg-gray-900 border-2 border-primary-200/50 rounded-lg group-hover:bg-black transition-colors shadow-inner overflow-hidden flex items-center justify-center p-1">
              <Image src={makkaSharif} alt="Makka Sharif" width={32} height={32} className="object-contain" />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              Idara<span className="text-primary-600 font-extrabold">Sys</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              prefetch={true}
              className="text-sm font-semibold text-gray-900 hover:text-primary-600 px-4 py-2 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              prefetch={true}
              className="text-sm font-semibold bg-primary-600 text-white px-5 py-2.5 rounded-full hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/20 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <button
              type="button"
              className="z-50 relative p-2 text-gray-600 hover:text-primary-600 focus:outline-none transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <div className="relative w-6 h-6">
                <motion.span
                  animate={mobileMenuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -8 }}
                  className="absolute block w-6 h-0.5 bg-current transform transition-transform duration-300"
                />
                <motion.span
                  animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="absolute block w-6 h-0.5 bg-current transform transition-opacity duration-300"
                />
                <motion.span
                  animate={mobileMenuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 8 }}
                  className="absolute block w-6 h-0.5 bg-current transform transition-transform duration-300"
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-full sm:max-w-xs bg-white z-50 md:hidden flex flex-col shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Menu Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-900 rounded-lg p-1">
                      <Image src={makkaSharif} alt="Logo" width={24} height={24} className="object-contain" />
                    </div>
                    <span className="font-bold text-gray-900">Menu</span>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Kalma Section */}
                <div className="py-4 border-b border-gray-50 bg-white text-center">
                  <span className="text-sm font-serif text-primary-700/80 font-bold arabic-text" dir="rtl">
                    لَا إِلٰهَ إِلَّا ٱلله مُحَمَّدٌ رَسُولُ ٱلله
                  </span>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-2">
                  <div className="px-6 py-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Main</span>
                  </div>
                  <nav>
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <div className="text-gray-400 group-hover:text-primary-600">
                          <link.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[15px] font-medium text-gray-700 font-sans">
                          {link.label}
                        </span>
                      </Link>
                    ))}
                  </nav>

                  <div className="mt-4 px-6 py-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account</span>
                  </div>
                  <nav>
                    <Link
                      href="/login"
                      prefetch={true}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50"
                    >
                      <div className="text-gray-400">
                        <Home className="w-5 h-5" />
                      </div>
                      <span className="text-[15px] font-medium text-gray-700">Login</span>
                    </Link>
                    <Link
                      href="/register"
                      prefetch={true}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                      <div className="text-primary-600">
                        <Zap className="w-5 h-5" />
                      </div>
                      <span className="text-[15px] font-bold text-primary-600">Get Started Free</span>
                    </Link>
                  </nav>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
