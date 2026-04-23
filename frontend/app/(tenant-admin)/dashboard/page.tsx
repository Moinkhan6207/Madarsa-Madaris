'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api';
import { getOnboardingStatus } from '@services/onboarding.service';
import { Loader2, Users, School, Calendar, MapPin, Settings } from 'lucide-react';
import { SectionCard } from '@components/ui/FormElements';

function StatCard({ label, value, icon: Icon, colorClass }: { label: string; value: string | number; icon: any; colorClass: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
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
  });

  const { data: onboarding, isLoading: onboardingLoading } = useQuery({
    queryKey: ['onboarding'],
    queryFn: getOnboardingStatus,
  });

  if (tenantLoading || onboardingLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assalamu Alaikum, {tenant?.displayName}</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome to your management portal.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 transition-all shadow-sm">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Students" 
          value="0" 
          icon={Users} 
          colorClass="bg-blue-100 text-blue-600" 
        />
        <StatCard 
          label="Total Teachers" 
          value="0" 
          icon={School} 
          colorClass="bg-purple-100 text-purple-600" 
        />
        <StatCard 
          label="Branches" 
          value="---" 
          icon={MapPin} 
          colorClass="bg-emerald-100 text-emerald-600" 
        />
        <StatCard 
          label="Active Session" 
          value="---" 
          icon={Calendar} 
          colorClass="bg-amber-100 text-amber-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Recent Activity" description="Coming soon: Student registrations, attendance, and fee alerts will appear here.">
            <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl text-gray-400 italic text-sm">
              Your dashboard will populate once you start adding data.
            </div>
          </SectionCard>
        </div>
        
        <div className="space-y-6">
          <SectionCard title="Quick Actions">
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 transition-all flex items-center justify-between">
                Add New Student <ArrowRight className="w-4 h-4" />
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-all flex items-center justify-between">
                Mark Attendance <ArrowRight className="w-4 h-4" />
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-all flex items-center justify-between">
                Institution Settings <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function ArrowRight(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  );
}
