'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Eagerly load above-the-fold components
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';

// Lazy load below-the-fold sections with loading skeletons
const TrustSection = dynamic(() => import('@/components/landing/TrustSection').then(mod => ({ default: mod.TrustSection })), {
  loading: () => <div className="h-32 bg-gray-50 animate-pulse" />,
  ssr: false,
});

const FeaturesSection = dynamic(() => import('@/components/landing/FeaturesSection').then(mod => ({ default: mod.FeaturesSection })), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
  ssr: false,
});

const HowItWorksSection = dynamic(() => import('@/components/landing/HowItWorksSection').then(mod => ({ default: mod.HowItWorksSection })), {
  loading: () => <div className="h-64 bg-gray-50 animate-pulse" />,
  ssr: false,
});

const BenefitsSection = dynamic(() => import('@/components/landing/BenefitsSection').then(mod => ({ default: mod.BenefitsSection })), {
  loading: () => <div className="h-80 bg-gray-50 animate-pulse" />,
  ssr: false,
});

const IslamicIdentitySection = dynamic(() => import('@/components/landing/IslamicIdentitySection').then(mod => ({ default: mod.IslamicIdentitySection })), {
  loading: () => <div className="h-48 bg-gray-50 animate-pulse" />,
  ssr: false,
});

const CtaSection = dynamic(() => import('@/components/landing/CtaSection').then(mod => ({ default: mod.CtaSection })), {
  loading: () => <div className="h-40 bg-gray-50 animate-pulse" />,
  ssr: false,
});

const Footer = dynamic(() => import('@/components/landing/Footer').then(mod => ({ default: mod.Footer })), {
  loading: () => <div className="h-40 bg-gray-900 animate-pulse" />,
  ssr: false,
});

export default function Home() {
  const router = useRouter();

  // Preload login and register routes on page mount for faster navigation
  useEffect(() => {
    router.prefetch('/login');
    router.prefetch('/register');
  }, [router]);

  return (
    <main className="min-h-screen bg-white selection:bg-primary-100 selection:text-primary-900">
      <Navbar />
      <div className="pt-2">
        {/* Above the fold - load immediately */}
        <HeroSection />
        
        {/* Below the fold - lazy loaded with skeleton */}
        <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse" />}>
          <TrustSection />
        </Suspense>
        
        <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse" />}>
          <FeaturesSection />
        </Suspense>
        
        <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse" />}>
          <HowItWorksSection />
        </Suspense>
        
        <Suspense fallback={<div className="h-80 bg-gray-50 animate-pulse" />}>
          <BenefitsSection />
        </Suspense>
        
        <Suspense fallback={<div className="h-48 bg-gray-50 animate-pulse" />}>
          <IslamicIdentitySection />
        </Suspense>
        
        <Suspense fallback={<div className="h-40 bg-gray-50 animate-pulse" />}>
          <CtaSection />
        </Suspense>
      </div>
      
      <Suspense fallback={<div className="h-40 bg-gray-900 animate-pulse" />}>
        <Footer />
      </Suspense>
    </main>
  );
}
