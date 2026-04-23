'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getOnboardingStatus } from '@services/onboarding.service';
import { Loader2 } from 'lucide-react';

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
      router.replace('/setup/profile');
    } else if (status.brandingStep === 'NOT_STARTED' || status.brandingStep === 'IN_PROGRESS') {
      router.replace('/setup/branding');
    } else if (status.branchStep === 'NOT_STARTED' || status.branchStep === 'IN_PROGRESS') {
      router.replace('/setup/branches');
    } else if (status.sessionStep === 'NOT_STARTED' || status.sessionStep === 'IN_PROGRESS') {
      router.replace('/setup/session');
    } else {
      router.replace('/setup/review');
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
      <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      <p className="text-sm text-gray-500 font-medium">Loading your setup progress...</p>
    </div>
  );
}
