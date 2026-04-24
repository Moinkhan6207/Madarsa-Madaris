'use client';

import { useQuery } from '@tanstack/react-query';
import { getOnboardingStatus } from '@services/onboarding.service';
import { StepProgress } from '@components/onboarding/StepProgress';
import { usePathname } from 'next/navigation';
import { logout } from '@services/auth.service';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentStep = pathname.split('/').pop() || 'profile';

  const { data: status, isLoading } = useQuery({
    queryKey: ['onboarding'],
    queryFn: getOnboardingStatus,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  const statusMap = status ? {
    profileStep: status.profileStep,
    brandingStep: status.brandingStep,
    branchStep: status.branchStep,
    sessionStep: status.sessionStep,
    finalizationStep: status.finalizationStep,
  } : {};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 py-6 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6">
            <div className="text-center w-full relative left-0 right-0">
              <button 
                onClick={logout}
                className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                title="Back to login"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </button>
              {/* Mobile back button */}
              <div className="sm:hidden flex justify-start mb-4">
                <button 
                  onClick={logout}
                  className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </button>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Setup your Institution</h1>
              <p className="text-sm text-gray-500 mt-1">Complete these steps to activate your platform.</p>
            </div>
            <StepProgress currentStep={currentStep} statusMap={statusMap as any} />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>

      <footer className="py-6 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Idara Management System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
