'use client';

import { CheckIcon } from 'lucide-react';
import Link from 'next/link';

export const WIZARD_STEPS = [
  { id: 'profile',  label: 'Profile',  stepKey: 'profileStep',      href: '/setup/profile' },
  { id: 'branding', label: 'Branding', stepKey: 'brandingStep',     href: '/setup/branding' },
  { id: 'branches', label: 'Branches', stepKey: 'branchStep',       href: '/setup/branches' },
  { id: 'session',  label: 'Session',  stepKey: 'sessionStep',      href: '/setup/session' },
  { id: 'review',   label: 'Review',   stepKey: 'finalizationStep', href: '/setup/review' },
] as const;

type StepStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';

interface StepProgressProps {
  currentStep: string;
  statusMap: Record<string, StepStatus>;
}

export function StepProgress({ currentStep, statusMap }: StepProgressProps) {
  return (
    <nav aria-label="Onboarding progress" className="w-full">
      <ol className="flex items-center w-full">
        {WIZARD_STEPS.map((step, idx) => {
          const status = statusMap[step.stepKey] ?? 'NOT_STARTED';
          const isCurrent = step.id === currentStep;
          const isCompleted = status === 'COMPLETED' || status === 'SKIPPED';
          const isLast = idx === WIZARD_STEPS.length - 1;

          return (
            <li key={step.id} className={`flex items-center ${isLast ? '' : 'w-full'}`}>
              <Link
                href={step.href}
                className="flex flex-col items-center group"
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 shrink-0
                    ${isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-white border-emerald-600 text-emerald-600 shadow-md shadow-emerald-100'
                      : 'bg-white border-gray-300 text-gray-400 group-hover:border-emerald-400'
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{idx + 1}</span>
                  )}
                </span>
                <span
                  className={`mt-2 text-xs font-medium hidden sm:block
                    ${isCurrent ? 'text-emerald-700' : isCompleted ? 'text-emerald-600' : 'text-gray-400'}
                  `}
                >
                  {step.label}
                </span>
              </Link>
              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
