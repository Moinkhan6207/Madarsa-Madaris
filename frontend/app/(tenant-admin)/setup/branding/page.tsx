'use client';

import { BrandingForm } from '@components/onboarding/BrandingForm';

// Prevent prerendering during build to avoid QueryClient errors
export const dynamic = 'force-dynamic';

export default function BrandingPage() {
  return <BrandingForm />;
}
