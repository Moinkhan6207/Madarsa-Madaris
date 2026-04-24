'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

// Social Icons
const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
const Youtube = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>
  </svg>
);
const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);
const WhatsApp = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const NAV_LINKS = [
  { label: 'Home', slug: '' },
  { label: 'About Us', slug: 'about' },
  { label: 'Academic Courses', slug: 'courses' },
  { label: 'Admission Process', slug: 'admission' },
  { label: 'Events & Results', slug: 'events' },
  { label: 'Our Gallery', slug: 'gallery' },
];
const SUPPORT_LINKS = [
  { label: 'Make a Donation', slug: 'donation' },
  { label: 'Contact Us', slug: 'contact' },
  { label: 'Results', slug: 'results' },
];

export default function Footer({ settings, tenant }: any) {
  const primary = settings?.primaryColor || '#10b981';
  const baseUrl = `/public/${tenant?.slug}`;

  // Dynamic social links from settings
  const socialLinks = [
    { href: settings?.facebookUrl, icon: Facebook, label: 'Facebook' },
    { href: settings?.instagramUrl, icon: Instagram, label: 'Instagram' },
    { href: settings?.youtubeUrl, icon: Youtube, label: 'YouTube' },
    { href: settings?.twitterUrl, icon: Twitter, label: 'Twitter' },
    { href: settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}` : null, icon: WhatsApp, label: 'WhatsApp' },
  ].filter(s => !!s.href);

  return (
    <footer className="bg-gray-900 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/5 pb-16">

          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt={tenant?.displayName} className="h-10 w-auto object-contain" />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black"
                  style={{ background: primary }}
                >
                  {tenant?.displayName?.[0]}
                </div>
              )}
              <span className="font-black text-white text-lg tracking-tight uppercase">
                {settings?.siteTitle || tenant?.displayName}
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">
              {settings?.metaDescription || 'Empowering the next generation with quality education and Islamic values.'}
            </p>

            {/* Social Links */}
            {socialLinks.length > 0 ? (
              <div className="flex gap-3 flex-wrap">
                {socialLinks.map((social, i) => (
                  <a
                    key={i}
                    href={social.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                    style={{ ['--hover-bg' as any]: primary }}
                    onMouseEnter={e => (e.currentTarget.style.background = primary)}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-[11px] font-bold uppercase tracking-widest">
                Configure social links in Site Settings
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Quick Links</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-400">
              {NAV_LINKS.map(link => (
                <li key={link.slug}>
                  <Link
                    href={`${baseUrl}${link.slug ? '/' + link.slug : ''}`}
                    className="hover:text-white transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Support</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-400">
              {SUPPORT_LINKS.map(link => (
                <li key={link.slug}>
                  <Link href={`${baseUrl}/${link.slug}`} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Contact</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-400">
              {settings?.contactPhone && (
                <li>
                  <a href={`tel:${settings.contactPhone}`} className="flex items-center gap-3 hover:text-white transition-colors">
                    <Phone className="w-4 h-4 flex-shrink-0" style={{ color: primary }} />
                    <span>{settings.contactPhone}</span>
                  </a>
                </li>
              )}
              {settings?.contactEmail && (
                <li>
                  <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-3 hover:text-white transition-colors">
                    <Mail className="w-4 h-4 flex-shrink-0" style={{ color: primary }} />
                    <span>{settings.contactEmail}</span>
                  </a>
                </li>
              )}
              {settings?.whatsappNumber && (
                <li>
                  <a
                    href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:text-white transition-colors"
                  >
                    <WhatsApp className="w-4 h-4 flex-shrink-0" style={{ color: primary }} />
                    <span>WhatsApp Us</span>
                  </a>
                </li>
              )}
              {!settings?.contactPhone && !settings?.contactEmail && (
                <li className="text-gray-600 text-[11px] uppercase tracking-widest font-bold">
                  Configure in Site Settings
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          <p>{settings?.footerText || `© ${new Date().getFullYear()} ${settings?.siteTitle || tenant?.displayName}. All rights reserved.`}</p>
          <p className="flex items-center gap-1 text-gray-600">
            Powered by <span className="text-white font-black tracking-tighter text-xs ml-1">Idara SaaS</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
