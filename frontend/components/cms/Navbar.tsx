'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

// WhatsApp icon
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function Navbar({ tenant, settings, navigation = [] }: any) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const primary = settings?.primaryColor || '#10b981';

  // Sort: Home page first, then others
  const navItems = [...navigation].sort((a, b) => {
    if (a.isHomePage || a.slug === 'home') return -1;
    if (b.isHomePage || b.slug === 'home') return 1;
    return a.title.localeCompare(b.title);
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const baseUrl = `/public/${tenant?.slug}`;
  const whatsapp = settings?.whatsappNumber;

  const isLinkActive = (item: any) => {
    const itemPath = `${baseUrl}${item.isHomePage || item.slug === 'home' ? '' : '/' + item.slug}`;
    if (item.isHomePage || item.slug === 'home') {
      return pathname === itemPath || pathname === `${itemPath}/`;
    }
    return pathname.startsWith(itemPath);
  };

  return (
    <>
      <nav className={`sticky top-0 z-[100] transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-md shadow-gray-100/50'
          : 'bg-white/80 backdrop-blur-xl border-b border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-18 md:h-20 flex items-center justify-between py-3">
          {/* Logo */}
          <Link href={baseUrl} className="flex items-center gap-3 group flex-shrink-0">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={tenant?.displayName}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"
                style={{ background: primary }}
              >
                <span className="font-black text-xl">
                  {tenant?.displayName?.[0] || 'I'}
                </span>
              </div>
            )}
            <span className="font-black text-gray-900 text-lg tracking-tight uppercase hidden sm:block">
              {settings?.siteTitle || tenant?.displayName || 'Institution'}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isLinkActive(item);
              return (
                <Link
                  key={item.slug}
                  href={`${baseUrl}${item.isHomePage || item.slug === 'home' ? '' : '/' + item.slug}`}
                  className={`relative text-[11px] font-bold transition-all uppercase tracking-widest px-4 py-2 rounded-lg ${
                    active ? 'text-gray-900 bg-gray-50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50/50'
                  }`}
                >
                  {item.title}
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                      style={{ background: primary }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all"
              >
                <WhatsAppIcon />
                WhatsApp
              </a>
            )}
            <Link
              href={`${baseUrl}/admission`}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg active:scale-95"
              style={{ background: primary }}
            >
              Apply Now
            </Link>
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-7xl mx-auto px-6 py-4 space-y-1">
              {navItems.map((item) => {
                const active = isLinkActive(item);
                return (
                  <Link
                    key={item.slug}
                    href={`${baseUrl}${item.isHomePage || item.slug === 'home' ? '' : '/' + item.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className={`block text-sm font-bold uppercase tracking-wider py-4 px-4 rounded-xl transition-all ${
                      active ? 'text-white translate-x-1' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    style={active ? { background: primary } : {}}
                  >
                    {item.title}
                  </Link>
                );
              })}
              <div className="pt-4 mt-4 border-t border-gray-50 space-y-2">
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between py-4 px-5 rounded-2xl text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100"
                  >
                    <div className="flex items-center gap-3">
                      <WhatsAppIcon />
                      Chat on WhatsApp
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </a>
                )}
                {settings?.contactPhone && (
                  <a
                    href={`tel:${settings.contactPhone}`}
                    className="flex items-center gap-3 py-4 px-5 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all font-mono"
                  >
                    <Phone className="w-4 h-4" />
                    {settings.contactPhone}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
