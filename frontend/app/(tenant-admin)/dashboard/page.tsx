'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api';
import { getOnboardingStatus } from '@services/onboarding.service';
import { Loader2, Users, School, Calendar, MapPin, Settings, ArrowUpRight, TrendingUp, Sparkles, Plus, CheckCircle, ChevronRight } from 'lucide-react';

function StatCard({ label, value, icon: Icon, color, trend, i }: { label: string; value: string | number; icon: any; color: string; trend?: string; i: number }) {
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
}

export default function TenantDashboard() {
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

  const stats = [
    { label: 'Total Students', value: '452', icon: Users, color: 'blue', trend: '+12%' },
    { label: 'Total Teachers', value: '28', icon: School, color: 'purple', trend: '+2%' },
    { label: 'Active Branches', value: tenant?.branchCount || '01', icon: MapPin, color: 'emerald' },
    { label: 'Active Session', value: '2024-25', icon: Calendar, color: 'amber' },
  ];

  return (
    <>
      <AnimationStyles />
      <div className="space-y-10">
        {/* Welcome Header */}
        <header 
          className="flex items-end justify-between animate-fade-in-left"
        >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-black text-amber-600 uppercase tracking-[0.2em]">Live Overview</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Assalamu Alaikum, <span className="text-emerald-600">{tenant?.displayName}</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">
            Manage your daily operations and track institutional progress.
          </p>
        </div>
        
        <div className="hidden sm:flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                <Calendar className="w-4.5 h-4.5" />
                View Schedule
            </button>
            <button className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-200">
                <Plus className="w-4.5 h-4.5" />
                New Entry
            </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
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
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</h3>
                    <p className="text-sm text-slate-400 font-medium">Detailed tracking of recent system events.</p>
                </div>
                <button className="text-emerald-600 font-bold text-sm hover:underline">View All</button>
            </div>
            
            <div className="space-y-6">
                {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex items-center gap-6 p-4 hover:bg-slate-50 rounded-2xl transition-colors group cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                            0{i+1}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Student Admission Processed</h4>
                            <p className="text-sm text-slate-500 font-medium">New student record added to Branch #1</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">2m ago</span>
                            <span className="text-[10px] font-black text-emerald-600 mt-1 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">Success</span>
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
            
            <h3 className="text-xl font-black mb-2 tracking-tight relative z-10">Quick Actions</h3>
            <p className="text-slate-400 text-sm mb-8 font-medium relative z-10">Common tasks at your fingertips.</p>
            
            <div className="space-y-4 relative z-10">
               {[
                 { label: 'Add New Student', icon: Plus, bg: 'bg-emerald-500 hover:bg-emerald-400' },
                 { label: 'Mark Attendance', icon: CheckCircle, bg: 'bg-indigo-500 hover:bg-indigo-400' },
                 { label: 'Manage Sessions', icon: Calendar, bg: 'bg-slate-800 hover:bg-slate-700' },
                 { label: 'Institution Config', icon: Settings, bg: 'bg-slate-800 hover:bg-slate-700' }
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
