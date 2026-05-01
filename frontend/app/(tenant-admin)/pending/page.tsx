'use client';

import { useState, useEffect, startTransition } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api';
import { useRouter } from 'next/navigation';
import { Loader2, Clock, RefreshCcw, LogOut } from 'lucide-react';
import { TenantStatus } from '@/types/tenant';
import { logout } from '@services/auth.service';

// Prevent prerendering during build to avoid QueryClient errors
export const dynamic = 'force-dynamic';

export default function PendingApprovalPage() {
  const router = useRouter();

  const { data: tenant, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['tenant-me'],
    queryFn: async () => {
      const res = await api.get('/tenant/me');
      return res.data.data;
    }
  });

  useEffect(() => {
    if (tenant?.status === TenantStatus.ACTIVE) {
      startTransition(() => router.push('/dashboard'));
    }
  }, [tenant, router]);

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto animate-pulse flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mx-auto"></div>
          <div className="h-3 w-48 bg-gray-100 rounded animate-pulse mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
          <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Account Under Review</h1>
          <p className="text-gray-500 text-sm">
            Thank you for completing the setup! Our team is currently reviewing your registration for <strong>{tenant?.displayName}</strong>.
          </p>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 text-xs text-amber-800 text-left">
          <p className="font-semibold uppercase tracking-wider mb-1">What Happens Next?</p>
          <ul className="list-disc list-inside space-y-1 text-amber-900/80">
            <li>We verify your institution details.</li>
            <li>We check your primary branch configuration.</li>
            <li>You will receive an email once activated.</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            {isFetching ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCcw className="w-5 h-5" />}
            {isFetching ? 'Checking Status...' : 'Refresh Status'}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-600 hover:bg-gray-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        <p className="text-xs text-gray-400">
          Institution ID: <code className="bg-gray-100 px-1 rounded">{tenant?.id}</code>
        </p>
      </div>
    </div>
  );
}
