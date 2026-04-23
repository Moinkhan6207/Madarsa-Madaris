'use client';

import React from 'react';
import Link from 'next/link';

export default function Navbar({ tenant, settings }: any) {
  return (
    <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href={`/public/${tenant?.slug}`} className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[var(--primary-color)] rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 group-hover:scale-110 transition-transform">
            <span className="font-black text-xl">{tenant?.displayName?.[0] || 'I'}</span>
          </div>
          <span className="font-black text-gray-900 text-xl tracking-tight uppercase">
            {tenant?.displayName || 'Institution'}
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {['Home', 'About', 'Courses', 'Admission', 'Donation', 'Contact'].map((item) => (
            <Link 
              key={item} 
              href={`/public/${tenant?.slug}/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`}
              className="text-sm font-bold text-gray-500 hover:text-[var(--primary-color)] transition-colors uppercase tracking-wider"
            >
              {item}
            </Link>
          ))}
        </div>

        <div>
           <button className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg">
             Student Portal
           </button>
        </div>
      </div>
    </nav>
  );
}
