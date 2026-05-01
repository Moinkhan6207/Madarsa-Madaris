'use client';

import { useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getOnboardingStatus } from '@services/onboarding.service';
import { Loader2 } from 'lucide-react';

// Prevent prerendering during build to avoid QueryClient errors
export const dynamic = 'force-dynamic';

export default function SetupRedirect() {
  const router = useRouter();
  const { data: status, isLoading, isError } = useQuery({
    queryKey: ['onboarding'],
    queryFn: getOnboardingStatus,
    retry: 1,
  });

  useEffect(() => {
    if (isLoading || !status) return;

    // Redirection logic based on status
    if (status.profileStep === 'NOT_STARTED' || status.profileStep === 'IN_PROGRESS') {
      startTransition(() => router.replace('/setup/profile'));
    } else if (status.brandingStep === 'NOT_STARTED' || status.brandingStep === 'IN_PROGRESS') {
      startTransition(() => router.replace('/setup/branding'));
    } else if (status.branchStep === 'NOT_STARTED' || status.branchStep === 'IN_PROGRESS') {
      startTransition(() => router.replace('/setup/branches'));
    } else if (status.sessionStep === 'NOT_STARTED' || status.sessionStep === 'IN_PROGRESS') {
      startTransition(() => router.replace('/setup/session'));
    } else {
      startTransition(() => router.replace('/setup/review'));
    }
  }, [status, isLoading, router]);

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
        <p className="text-red-600 font-medium text-lg">Failed to load onboarding status.</p>
        <button 
          onClick={() => window.location.reload()}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto animate-pulse flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mx-auto"></div>
        <div className="h-3 w-56 bg-gray-100 rounded animate-pulse mx-auto"></div>
      </div>
    </div>
  );
}
