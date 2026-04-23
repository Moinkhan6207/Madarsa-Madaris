'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { TenantStatus } from '@/types/tenant';

export default function TenantAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  const { data: tenant, isLoading, isError } = useQuery({
    queryKey: ['tenant-me'],
    queryFn: async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        throw new Error('No token found');
      }
      const res = await api.get('/tenant/me');
      return res.data.data;
    },
    retry: 1,
    // Low stale time to ensure we catch activation quickly
    staleTime: 30000,
  });

  useEffect(() => {
    if (isLoading || isError || !tenant) return;

    // Allowed routes for non-ACTIVE tenants
    const isPendingPage = pathname.startsWith('/pending');
    const isSetupPage = pathname.startsWith('/setup');

    if (tenant.status === TenantStatus.DRAFT && !isSetupPage) {
      router.replace('/setup');
    } else if (tenant.status === TenantStatus.PENDING_ACTIVATION && !isPendingPage) {
      router.replace('/pending');
    } else if (tenant.status === TenantStatus.ACTIVE && (isPendingPage || isSetupPage)) {
      // If active, they shouldn't be in pending or setup after they are done
      // (Optional: can also just let them browse but usually we want them in dashboard)
      router.replace('/dashboard');
    }
  }, [tenant, isLoading, isError, pathname, router]);

  if (!isMounted || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-bold text-red-600">Failed to load tenant context</h2>
        <p className="text-gray-500 text-sm">Please try logging in again.</p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="rounded-lg bg-emerald-600 px-6 py-2 pb font-semibold text-white hover:bg-emerald-700"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
