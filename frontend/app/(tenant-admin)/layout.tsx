'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, startTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { TenantStatus } from '@/types/tenant';

function clearAuthState() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('tenant_id');
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export default function TenantAdminLayout({ children }: { children: React.ReactNode }) {
  return <TenantAdminLayoutInner>{children}</TenantAdminLayoutInner>;
}

function TenantAdminLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      setHasToken(Boolean(localStorage.getItem('token')));
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!hasToken) {
      // Recover from stale cookie-only auth state by forcing fresh login.
      clearAuthState();
      startTransition(() => router.replace('/login'));
    }
  }, [hasToken, isMounted, router]);

  const { data: tenant, isLoading, isError } = useQuery({
    queryKey: ['tenant-me'],
    enabled: isMounted && hasToken,
    queryFn: async () => {
      const res = await api.get('/tenant/me');
      return res.data.data;
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (isLoading || !hasToken) return;

    const userRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
    const isSuperAdmin = userRole === 'SUPER_ADMIN';

    if (isSuperAdmin && !pathname.startsWith('/platform')) {
      startTransition(() => router.replace('/platform/tenants'));
      return;
    }

    if (isError || !tenant) {
      if (!isSuperAdmin) {
        return;
      }
    }

    const isPendingPage = pathname.startsWith('/pending');
    const isSetupPage = pathname.startsWith('/setup');

    if (tenant?.status === TenantStatus.DRAFT && !isSetupPage) {
      startTransition(() => router.replace('/setup'));
    } else if (tenant?.status === TenantStatus.PENDING_ACTIVATION && !isPendingPage) {
      startTransition(() => router.replace('/pending'));
    } else if (tenant?.status === TenantStatus.ACTIVE && (isPendingPage || isSetupPage)) {
      startTransition(() => router.replace('/dashboard'));
    }
  }, [tenant, hasToken, isLoading, isError, pathname, router]);

  const userRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  let content: React.ReactNode = children;

  if (!isMounted || !hasToken || isLoading) {
    content = (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  } else if (isError && !isSuperAdmin) {
    content = (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-bold text-red-600">Failed to load tenant context</h2>
        <p className="text-gray-500 text-sm">Please try logging in again.</p>
        <button
          onClick={() => {
            clearAuthState();
            window.location.href = '/login';
          }}
          className="rounded-lg bg-emerald-600 px-6 py-2 pb font-semibold text-white hover:bg-emerald-700"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return <>{content}</>;
}
