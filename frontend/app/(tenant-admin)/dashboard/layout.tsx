'use client';

import {
  LayoutDashboard,
  Users,
  School,
  Settings,
  LogOut,
  MapPin,
  Calendar,
  HelpCircle,
  Globe,
  MessageSquare,
  Search,
  Bell,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@lib/api';
import { logout } from '@services/auth.service';
import { useState, useEffect, useCallback } from 'react';

// Prevent prerendering during build to avoid QueryClient errors
export const dynamic = 'force-dynamic';

export default function TenantDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const { data: tenant } = useQuery({
    queryKey: ['tenant-me'],
    queryFn: async () => {
      const res = await api.get('/tenant/me');
      return res.data.data;
    },
  });

  // Prefetch dashboard data on hover
  const prefetchDashboard = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['onboarding'],
      queryFn: async () => {
        const res = await api.get('/onboarding/status');
        return res.data.data;
      },
    });
  }, [queryClient]);

  // Prefetch website builder data on hover
  const prefetchWebsiteBuilder = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['cms-pages'],
      queryFn: async () => {
        const res = await api.get('/cms/pages');
        return res.data.data;
      },
    });
  }, [queryClient]);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Website Builder', href: '/dashboard/website-builder', icon: Globe },
    { name: 'Leads', href: '/dashboard/leads', icon: MessageSquare },
    { name: 'Branches', href: '/dashboard/branches', icon: MapPin },
    { name: 'Sessions', href: '/dashboard/sessions', icon: Calendar },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <>
      {/* Branding */}
      <div className="p-8">
        <Link href="/dashboard" className="flex items-center gap-4 group">
          <div className="relative">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
              {tenant?.logoUrl ? (
                <Image
                  src={tenant.logoUrl}
                  alt="Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-black text-xl">{tenant?.displayName?.[0] || 'I'}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-black text-slate-900 leading-tight truncate text-lg tracking-tight">
              {tenant?.displayName || 'IdaraSys'}
            </h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] mt-0.5">Admin Portal</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pt-2">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href;
          const prefetchHandler = item.href === '/dashboard' ? prefetchDashboard :
                                 item.href === '/dashboard/website-builder' ? prefetchWebsiteBuilder :
                                 undefined;
          return (
            <div
              key={item.name}
              className="animate-slide-in-left"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Link
                href={item.href as any}
                prefetch={true}
                onMouseEnter={prefetchHandler}
                className={`group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[14px] font-bold transition-all relative overflow-hidden ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {item.name}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-6 space-y-2 border-t border-slate-100">
         <Link 
           href={"/support" as any}
           className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[14px] font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all group"
         >
           <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all">
              <HelpCircle className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600" />
           </div>
           Help Center
         </Link>
         <button 
           onClick={logout}
           className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[14px] font-bold text-rose-500 hover:bg-rose-50 transition-all group"
         >
           <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center group-hover:bg-white border border-transparent group-hover:border-rose-100 transition-all">
              <LogOut className="w-4.5 h-4.5" />
           </div>
           Quit Session
         </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex overflow-hidden relative">
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200/60 hidden lg:flex flex-col sticky top-0 h-screen z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[40] lg:hidden animate-fade-in"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside 
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[50] lg:hidden flex flex-col shadow-2xl animate-slide-in-left"
            >
              <div className="absolute top-6 right-[-12px] lg:hidden">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <SidebarContent />
            </aside>
          </>
        )}

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Modern Header */}
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-200/60 px-4 md:px-8 flex items-center justify-between z-20">
          <div className="flex items-center gap-3 md:gap-4 flex-1">
            {/* Hamburger for Mobile */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="relative w-full max-w-[200px] md:max-w-md group hidden sm:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Quick search..." 
                    className="w-full bg-slate-100/50 border-transparent rounded-2xl py-2 md:py-2.5 pl-10 md:pl-12 pr-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all outline-none"
                />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             <button className="relative w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
             </button>
             <div className="h-8 w-[1px] bg-slate-200 mx-1 md:mx-2" />
             <div className="flex items-center gap-2 md:gap-3 pl-1 md:pl-2">
                <div className="text-right hidden md:block">
                    <p className="text-sm font-black text-slate-900 leading-none">Admin User</p>
                    <p className="text-[11px] font-bold text-emerald-600 mt-1 uppercase tracking-wide">Standard Plan</p>
                </div>
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden shadow-inner">
                    <Image
                      src={`https://ui-avatars.com/api/?name=${tenant?.displayName || 'User'}&background=0D9488&color=fff`}
                      alt="User"
                      width={40}
                      height={40}
                      className="w-full h-full"
                      unoptimized
                    />
                </div>
             </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] custom-scrollbar pb-12">
          {/* Bismillah at Top Center */}
          <div className="text-center py-6 opacity-80 select-none">
            <span className="text-xl font-serif text-black font-bold arabic-text tracking-widest" dir="rtl">
                بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </span>
          </div>
          
          <div className="px-4 md:px-8 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.3s ease-out forwards;
          opacity: 0;
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
