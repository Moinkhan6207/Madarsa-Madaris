import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { TrustSection } from '@/components/landing/TrustSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { IslamicIdentitySection } from '@/components/landing/IslamicIdentitySection';
import { CtaSection } from '@/components/landing/CtaSection';
import { Footer } from '@/components/landing/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white selection:bg-primary-100 selection:text-primary-900">
      <Navbar />
      <div className="pt-2"> {/* Offset for sticky navbar if needed, though Hero handles it */}
        <HeroSection />
        <TrustSection />
        <FeaturesSection />
        <HowItWorksSection />
        <BenefitsSection />
        <IslamicIdentitySection />
        <CtaSection />
      </div>
      <Footer />
    </main>
  );
}
