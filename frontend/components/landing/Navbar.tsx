'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
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

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b border-transparent',
        isScrolled ? 'bg-white shadow-md border-gray-100 py-3' : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-gray-900 border-2 border-primary-200/50 rounded-lg group-hover:bg-black transition-colors shadow-inner overflow-hidden flex items-center justify-center p-1">
              <Image src={makkaSharif} alt="Makka Sharif" width={32} height={32} className="object-contain" />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              Idara<span className="text-primary-600 font-extrabold">Sys</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
              How it Works
            </Link>
            <Link href="#benefits" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
              Benefits
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-gray-900 hover:text-primary-600 px-4 py-2 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-primary-600 text-white px-5 py-2.5 rounded-full hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/20 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900 p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl"
        >
          <div className="px-4 pt-2 pb-6 space-y-1 shadow-inner">
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50"
            >
              How it Works
            </Link>
            <Link
              href="#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50"
            >
              Benefits
            </Link>
            <div className="mt-6 pt-6 border-t border-gray-100 grid gap-4">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 bg-white"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-primary-600 hover:bg-primary-700 shadow-sm"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
