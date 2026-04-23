'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronRight, Loader2, Info, RefreshCw } from 'lucide-react';
import { getOnboardingStatus, getProfile, getBranding, getBranches, getSessions, finalizeOnboarding } from '@services/onboarding.service';
import { Alert, SectionCard, SkeletonLoader } from '@components/ui/FormElements';

export function ReviewSetup() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useQuery({ 
    queryKey: ['onboarding'], 
    queryFn: getOnboardingStatus,
    refetchOnMount: 'always'
  });
  
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({ 
    queryKey: ['profile'], 
    queryFn: getProfile,
    refetchOnMount: 'always',
    retry: 2
  });
  
  const { data: branding, isLoading: brandingLoading, refetch: refetchBranding } = useQuery({ 
    queryKey: ['branding'], 
    queryFn: getBranding,
    refetchOnMount: 'always',
    retry: 2
  });

  const { data: branches, isLoading: branchesLoading, refetch: refetchBranches } = useQuery({ 
    queryKey: ['branches'], 
    queryFn: getBranches,
    refetchOnMount: 'always'
  });

  const { data: sessions, isLoading: sessionsLoading, refetch: refetchSessions } = useQuery({ 
    queryKey: ['sessions'], 
    queryFn: getSessions,
    refetchOnMount: 'always'
  });

  const handleRefresh = async () => {
    await Promise.all([
      refetchStatus(),
      refetchProfile(),
      refetchBranding(),
      refetchBranches(),
      refetchSessions()
    ]);
  };

  const finalizeMutation = useMutation({
    mutationFn: finalizeOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      router.push('/dashboard');
    },
  });

  const isLoading = statusLoading || profileLoading || brandingLoading || branchesLoading || sessionsLoading;

  if (isLoading) return <SkeletonLoader rows={10} />;

  console.log('[DEBUG] Rendering ReviewSetup', {
    statusKey: status?.profileStep,
    profileData: profile,
    brandingData: branding,
    branchesCount: branches?.length,
    sessionsCount: sessions?.length
  });

  const isReady = status?.profileStep === 'COMPLETED' && 
                  status?.brandingStep === 'COMPLETED' && 
                  status?.branchStep === 'COMPLETED' && 
                  status?.sessionStep === 'COMPLETED';

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${(statusLoading || profileLoading) ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      <SectionCard title="Review Your Setup" description="Check all information before finalizing your institution's registration.">
        <div className="space-y-6">
          {/* Profile Summary */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold flex items-center justify-between">
              Institution Profile
              <button onClick={() => router.push('/setup/profile')} className="text-emerald-600 text-sm font-medium hover:underline">Edit</button>
            </h3>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <p><span className="text-gray-500">Name:</span> {profile?.shortName || '-'}</p>
              <p><span className="text-gray-500">Principal:</span> {profile?.principalName || '-'}</p>
              <p><span className="text-gray-500">City:</span> {profile?.city || '-'}</p>
              <p><span className="text-gray-500">Phone:</span> {profile?.phone || '-'}</p>
            </div>
          </div>

          {/* Branding Summary */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold flex items-center justify-between">
              Branding
              <button onClick={() => router.push('/setup/branding')} className="text-emerald-600 text-sm font-medium hover:underline">Edit</button>
            </h3>
            <div className="mt-2 text-sm space-y-1">
              <p><span className="text-gray-500">Primary Color:</span> <span className="inline-block w-4 h-4 rounded border align-middle ml-1" style={{ backgroundColor: branding?.primaryColor || '#10b981' }}></span> {branding?.primaryColor || '-'}</p>
              <p><span className="text-gray-500">Tagline:</span> {branding?.tagline || '-'}</p>
            </div>
          </div>

          {/* Branches Summary */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold flex items-center justify-between">
              Branches
              <button onClick={() => router.push('/setup/branches')} className="text-emerald-600 text-sm font-medium hover:underline">Edit</button>
            </h3>
            <div className="mt-2 space-y-2">
              {branches?.map(b => (
                <div key={b.id} className="text-sm flex items-center justify-between py-1 bg-gray-50 px-2 rounded">
                  <span>{b.name} {b.isPrimary && <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-1 rounded font-bold uppercase tracking-wider">Primary</span>}</span>
                  <span className="text-gray-500 text-xs">{b.city}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Session Summary */}
          <div className="pb-2">
            <h3 className="text-lg font-semibold flex items-center justify-between">
              Academic Session
              <button onClick={() => router.push('/setup/session')} className="text-emerald-600 text-sm font-medium hover:underline">Edit</button>
            </h3>
            <div className="mt-2 text-sm">
              {sessions?.filter(s => s.isCurrent).map(s => (
                <p key={s.id}><span className="text-gray-500">Active Session:</span> {s.name} ({new Date(s.startDate).getFullYear()} - {new Date(s.endDate).getFullYear()})</p>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {!isReady && (
        <Alert type="info" message="Please complete all steps before finalizing. Some steps appear to be incomplete." />
      )}

      {finalizeMutation.error && (
        <Alert type="error" message={(finalizeMutation.error as Error).message} />
      )}

      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-gray-500 max-w-md text-center">
          By clicking finalize, you confirm that the information provided is accurate. This will activate your platform.
        </p>
        
        <button
          onClick={() => finalizeMutation.mutate()}
          disabled={!isReady || finalizeMutation.isPending}
          className="w-full md:w-auto min-w-[240px] flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-emerald-700 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {finalizeMutation.isPending ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <CheckCircle2 className="w-6 h-6" />
          )}
          {finalizeMutation.isPending ? 'Activating Platform...' : 'Finalize & Activate'}
        </button>
      </div>
    </div>
  );
}
