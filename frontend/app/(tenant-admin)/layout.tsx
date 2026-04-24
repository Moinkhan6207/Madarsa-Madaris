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
    if (isLoading) return;

    // 1. Handle Super Admin redirection
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const userRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
    const isSuperAdmin = userRole === 'SUPER_ADMIN';

    if (isSuperAdmin && !pathname.startsWith('/platform')) {
      router.replace('/platform/tenants');
      return;
    }

    if (isError || !tenant) {
       if (!isSuperAdmin) {
          // Only show error for regular users if context is actually missing
          return;
       }
    };

    // 2. Intelligent redirection based on status
    const isPendingPage = pathname.startsWith('/pending');
    const isSetupPage = pathname.startsWith('/setup');

    if (tenant?.status === TenantStatus.DRAFT && !isSetupPage) {
      router.replace('/setup');
    } else if (tenant?.status === TenantStatus.PENDING_ACTIVATION && !isPendingPage) {
      router.replace('/pending');
    } else if (tenant?.status === TenantStatus.ACTIVE && (isPendingPage || isSetupPage)) {
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

  // Check if we should show error
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  
  if (isError && !isSuperAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-bold text-red-600">Failed to load tenant context</h2>
        <p className="text-gray-500 text-sm">Please try logging in again.</p>
        <button 
          onClick={() => {
             localStorage.removeItem('token');
             localStorage.removeItem('user');
             // Also clear cookies to prevent middleware redirect loop
             document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
             document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
             window.location.href = '/login';
          }}
          className="rounded-lg bg-emerald-600 px-6 py-2 pb font-semibold text-white hover:bg-emerald-700"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
