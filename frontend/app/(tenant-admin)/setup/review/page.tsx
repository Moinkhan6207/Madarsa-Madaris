'use client';

import { ReviewSetup } from '@components/onboarding/ReviewSetup';

// Prevent prerendering during build to avoid QueryClient errors
export const dynamic = 'force-dynamic';

export default function ReviewPage() {
  return <ReviewSetup />;
}
