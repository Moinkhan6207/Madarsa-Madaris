'use client';

import { BranchForm } from '@components/onboarding/BranchForm';

// Prevent prerendering during build to avoid QueryClient errors
export const dynamic = 'force-dynamic';

export default function BranchesPage() {
  return <BranchForm />;
}
