import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { IslamicIdentitySection } from '@/components/landing/IslamicIdentitySection';
import { CtaSection } from '@/components/landing/CtaSection';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <IslamicIdentitySection />
      <BenefitsSection />
      <HowItWorksSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
