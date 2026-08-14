"use client";

import { useState } from "react";
import { AgenticIntro } from "@/components/opening/AgenticIntro/AgenticIntro";
import { Navigation } from "@/components/landing/navigation";
import { CascadeWatermark } from "@/components/landing/cascade-watermark";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { InfrastructureSection } from "@/components/landing/infrastructure-section";
import { MetricsSection } from "@/components/landing/metrics-section";
import { IntegrationsSection } from "@/components/landing/integrations-section";
import { SecuritySection } from "@/components/landing/security-section";
import { DevelopersSection } from "@/components/landing/developers-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CtaSection } from "@/components/landing/cta-section";
import { FooterSection } from "@/components/landing/footer-section";

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <>
      {!introComplete && <AgenticIntro onComplete={() => setIntroComplete(true)} />}
      {introComplete && (
        <main className="relative min-h-screen overflow-x-hidden noise-overlay">
          <CascadeWatermark />
          <Navigation />
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <InfrastructureSection />
          <MetricsSection />
          <IntegrationsSection />
          <SecuritySection />
          <DevelopersSection />
          <TestimonialsSection />
          <PricingSection />
          <CtaSection />
          <FooterSection />
        </main>
      )}
    </>
  );
}
