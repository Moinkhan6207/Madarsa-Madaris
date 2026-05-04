'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api';
import { getOnboardingStatus } from '@services/onboarding.service';
import { Users, School, MapPin, Calendar, TrendingUp, LayoutDashboard, ArrowRight, ArrowUpRight, Sparkles, Plus, ChevronRight, CheckCircle, Settings } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n/useTranslation';

// Prevent prerendering during build to avoid QueryClient errors
export const dynamic = 'force-dynamic';

// Memoized StatCard to prevent unnecessary re-renders
const StatCard = React.memo(({ label, value, icon: Icon, color, trend, i }: { label: string; value: string | number; icon: any; color: string; trend?: string; i: number }) => {
  const colorMap: any = {
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    blue: 'bg-blue-50 text-blue-600 ring-blue-100',
    purple: 'bg-purple-50 text-purple-600 ring-purple-100',
    amber: 'bg-amber-50 text-amber-600 ring-amber-100',
  };

  return (
    <div
      className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${i * 100}ms` }}
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight className="w-5 h-5 text-slate-300" />
      </div>

      <div className="flex flex-col gap-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ring-4 ${colorMap[color]}`}>
          <Icon className="w-7 h-7" />
        </div>

        <div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-slate-900 tracking-tight">{value}</h3>
            {trend && (
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-bold mb-1">
                <TrendingUp className="w-3 h-3" />
                {trend}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

export default function TenantDashboard() {
  const { t, direction } = useTranslation();
  const { data: tenant, isLoading: tenantLoading } = useQuery({
    queryKey: ['tenant-me'],
    queryFn: async () => {
      const res = await api.get('/tenant/me');
      return res.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { data: onboarding, isLoading: onboardingLoading } = useQuery({
    queryKey: ['onboarding'],
    queryFn: getOnboardingStatus,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Fetch pre-computed stats from backend
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/tenant/dashboard/stats');
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - backend has caching
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (tenantLoading || onboardingLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-emerald-200 rounded-full"></div>
          <div className="w-32 h-4 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Skeleton for stats loading
  if (statsLoading) {
    return (
      <>
        <AnimationStyles />
        <div className="space-y-10">
          <header className="flex items-end justify-between">
            <div className="space-y-4">
              <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-4 w-64 bg-slate-100 rounded animate-pulse"></div>
            </div>
            <div className="flex gap-3">
              <div className="h-12 w-32 bg-slate-100 rounded-xl animate-pulse"></div>
              <div className="h-12 w-32 bg-slate-900 rounded-xl animate-pulse"></div>
            </div>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-3xl p-8 h-40 animate-pulse"></div>
            ))}
          </div>
        </div>
      </>
    );
  }

  const statsData = [
    { label: t('dashboard.totalStudents'), value: stats?.totalStudents || '-', icon: Users, color: 'blue' },
    { label: t('dashboard.totalTeachers'), value: stats?.totalTeachers || '-', icon: School, color: 'purple' },
    { label: t('dashboard.activeBranches'), value: stats?.totalBranches || tenant?.branchCount || '-', icon: MapPin, color: 'emerald' },
    { label: t('dashboard.totalPages'), value: stats?.totalPages || '-', icon: Calendar, color: 'amber' },
  ];

  return (
    <>
      <AnimationStyles />
      <div className="space-y-10" dir={direction}>
        {/* Welcome Header */}
        <header 
          className="flex items-end justify-between animate-fade-in-left"
        >
        <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-black text-amber-600 uppercase tracking-[0.2em]">{t('dashboard.liveOverview')}</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {t('dashboard.greeting')}, <span className="text-emerald-600">{tenant?.displayName}</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">
            {t('dashboard.manageSubtitle')}
          </p>
        </div>
        
        <div className="hidden sm:flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                <Calendar className="w-4.5 h-4.5" />
                {t('dashboard.viewSchedule')}
            </button>
            <button className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-200">
                <Plus className="w-4.5 h-4.5" />
                {t('dashboard.newEntry')}
            </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statsData.map((stat: any, i: number) => (
          <StatCard key={stat.label} {...stat} i={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Feed */}
        <div 
            className="lg:col-span-2 space-y-8 animate-fade-in-up"
            style={{ animationDelay: '500ms' }}
        >
          <div className="bg-white rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100">
            <div className="flex items-center justify-between mb-8">
                <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('dashboard.recentActivity')}</h3>
                    <p className="text-sm text-slate-400 font-medium">{t('dashboard.recentActivitySubtitle')}</p>
                </div>
                <button className="text-emerald-600 font-bold text-sm hover:underline">{t('common.viewAll')}</button>
            </div>
            
            <div className="space-y-6">
                {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex items-center gap-6 p-4 hover:bg-slate-50 rounded-2xl transition-colors group cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                            0{i+1}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{t('dashboard.studentAdmissionProcessed')}</h4>
                            <p className="text-sm text-slate-500 font-medium">{t('dashboard.newStudentRecord')}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">{t('dashboard.minutesAgo')}</span>
                            <span className="text-[10px] font-black text-emerald-600 mt-1 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">{t('common.success')}</span>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
        
        {/* Quick Actions Sidebar */}
        <div 
            className="space-y-8 animate-fade-in-right"
            style={{ animationDelay: '600ms' }}
        >
          <div className="bg-slate-900 rounded-[2rem] p-10 text-white shadow-2xl shadow-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles size={120} />
            </div>
            
            <h3 className="text-xl font-black mb-2 tracking-tight relative z-10">{t('dashboard.quickActions')}</h3>
            <p className="text-slate-400 text-sm mb-8 font-medium relative z-10">{t('dashboard.quickActionsSubtitle')}</p>
            
            <div className="space-y-4 relative z-10">
               {[
                 { label: t('dashboard.addNewStudent'), icon: Plus, bg: 'bg-emerald-500 hover:bg-emerald-400' },
                 { label: t('dashboard.markAttendance'), icon: CheckCircle, bg: 'bg-indigo-500 hover:bg-indigo-400' },
                 { label: t('dashboard.manageSessions'), icon: Calendar, bg: 'bg-slate-800 hover:bg-slate-700' },
                 { label: t('dashboard.institutionConfig'), icon: Settings, bg: 'bg-slate-800 hover:bg-slate-700' }
               ].map((action) => (
                 <button 
                    key={action.label}
                    className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all active:scale-[0.98] ${action.bg}`}
                 >
                    <span className="font-bold flex items-center gap-3">
                        <action.icon className="w-5 h-5 opacity-70" />
                        {action.label}
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                 </button>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

// CSS Animations - injected via styled-jsx
const AnimationStyles = () => (
  <style jsx global>{`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeInLeft {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes fadeInRight {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.5s ease-out forwards;
      opacity: 0;
    }
    .animate-fade-in-left {
      animation: fadeInLeft 0.5s ease-out forwards;
      opacity: 0;
    }
    .animate-fade-in-right {
      animation: fadeInRight 0.5s ease-out forwards;
      opacity: 0;
    }
  `}</style>
);
