'use client';

import React from 'react';
import { LayoutDashboard, Users, School, Settings, LogOut, MapPin, Calendar, HelpCircle, Globe, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api';
import { logout } from '@services/auth.service';


export default function TenantDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const { data: tenant } = useQuery({
    queryKey: ['tenant-me'],
    queryFn: async () => {
      const res = await api.get('/tenant/me');
      return res.data.data;
    },
  });

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Teachers', href: '/teachers', icon: School },
    { name: 'Website Builder', href: '/website-builder', icon: Globe },
    { name: 'Leads', href: '/leads', icon: MessageSquare },
    { name: 'Branches', href: '/branches', icon: MapPin },
    { name: 'Sessions', href: '/sessions', icon: Calendar },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-68 bg-white border-r border-gray-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <span className="font-bold text-xl">{tenant?.displayName?.[0] || 'I'}</span>
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-gray-900 leading-tight truncate">{tenant?.displayName || 'Idara'}</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Institution Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href as any}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-1">
           <Link 
             href={"/support" as any}
             className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all"
           >
             <HelpCircle className="w-5 h-5 text-gray-400" />
             Help & Support
           </Link>
           <button 
             onClick={logout}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all"
           >
             <LogOut className="w-5 h-5" />
             Logout
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
