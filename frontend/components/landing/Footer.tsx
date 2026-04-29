import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
const makkaSharif = '/assets/makka_sharif.png';


export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <div className="bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center p-0.5">
                <Image src={makkaSharif} alt="Makka Sharif" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Idara<span className="text-primary-600 font-extrabold">Sys</span>
              </span>
            </Link>
            <p className="text-gray-500 max-w-sm mb-6 leading-relaxed">
              The complete, modern, and secure management platform built specifically for the needs of Madarsas, Masjids, and Islamic Institutions.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 tracking-wider text-sm uppercase">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#features" className="text-gray-500 hover:text-primary-600 transition-colors">Features</Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-gray-500 hover:text-primary-600 transition-colors">How it works</Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-500 hover:text-primary-600 transition-colors">Pricing</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 tracking-wider text-sm uppercase">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-500 hover:text-primary-600 transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-500 hover:text-primary-600 transition-colors">Contact</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-500 hover:text-primary-600 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-500 hover:text-primary-600 transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} IdaraSys. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gray-400">
            <span>Built with respect & dedication.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
