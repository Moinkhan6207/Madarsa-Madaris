'use client';

import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Facebook = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>);
const Instagram = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>);
const Youtube = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>);

export default function Footer({ settings, tenant }: any) {
  return (
    <footer className="bg-gray-900 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/5 pb-16">
          <div className="col-span-1 md:col-span-1">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-[var(--primary-color)] rounded-lg flex items-center justify-center text-white">
                  <span className="font-black">{tenant?.displayName?.[0]}</span>
                </div>
                <span className="font-black text-white text-lg tracking-tight uppercase">{tenant?.displayName}</span>
             </div>
             <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">
               {settings?.metaDescription || 'Empowering the next generation with quality education and Islamic values.'}
             </p>
             <div className="flex gap-4">
               {[Facebook, Instagram, Youtube].map((Icon, i) => (
                 <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[var(--primary-color)] hover:text-white transition-all">
                   <Icon className="w-5 h-5" />
                 </a>
               ))}
             </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Quick Links</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-400">
              {['About Us', 'Academic Courses', 'Admission Process', 'Events & Results', 'Student Gallery'].map(link => (
                <li key={link}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Support</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-400">
              {['Make a Donation', 'Volunteer with Us', 'Parent Portal', 'Privacy Policy', 'Terms of Service'].map(link => (
                <li key={link}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Contact Information</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[var(--primary-color)] flex-shrink-0 mt-0.5" />
                <span>123 Institution Road, Knowledge City, State, Country</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[var(--primary-color)]" />
                <span>{settings?.contactPhone || '+91 98765 43210'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[var(--primary-color)]" />
                <span>{settings?.contactEmail || 'contact@institution.com'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
           <p>{settings?.footerText || `© ${new Date().getFullYear()} ${tenant?.displayName}. All rights reserved.`}</p>
           <p className="flex items-center gap-1 leading-none text-gray-600">
             Powered by <span className="text-white font-black tracking-tighter text-xs">Madarsa-SaaS</span>
           </p>
        </div>
      </div>
    </footer>
  );
}
