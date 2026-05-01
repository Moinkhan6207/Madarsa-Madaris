'use client';

import { InstitutionProfileForm } from '@components/onboarding/InstitutionProfileForm';

// Prevent prerendering during build to avoid QueryClient errors
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  return <InstitutionProfileForm />;
}
