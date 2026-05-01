'use client';

import { SessionForm } from '@components/onboarding/SessionForm';

// Prevent prerendering during build to avoid QueryClient errors
export const dynamic = 'force-dynamic';

export default function SessionPage() {
  return <SessionForm />;
}
