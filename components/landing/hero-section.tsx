"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const stats = [
  { value: "<2%", label: "Bounce rate" },
  { value: "15+", label: "Data sources" },
  { value: "1.5s", label: "Avg enrichment" },
  { value: "$49/mo", label: "Starting price" },
];

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-background">
      {/* Subtle grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground/10"
            style={{
              top: `${12.5 * (i + 1)}%`,
              left: 0,
              right: 0,
            }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/10"
            style={{
              left: `${8.33 * (i + 1)}%`,
              top: 0,
              bottom: 0,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-32 lg:py-40">
        {/* Eyebrow */}
        <div
          className={`mb-8 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
            <span className="w-8 h-px bg-primary/50" />
            Waterfall enrichment across 15+ providers
          </span>
        </div>

        {/* Main headline */}
        <div className="mb-8">
          <h1
            className={`text-[clamp(2.5rem,8vw,5.5rem)] font-display leading-[1.05] tracking-tight max-w-4xl transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Find verified emails for any B2B prospect in seconds
          </h1>
        </div>

        {/* Subheadline */}
        <p
          className={`text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-10 transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          LeadScale queries 15+ data providers in sequence until it finds a match, then verifies every email with 3-stage checks — syntax, SMTP ping, and catch-all detection — guaranteeing less than 2% bounce rates.
        </p>

        {/* CTAs */}
        <div
          className={`flex flex-col sm:flex-row items-start gap-4 mb-4 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-14 text-base rounded-full group"
          >
            <a href="#pricing">
              Start free — 100 contacts included
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-14 px-8 text-base rounded-full border-border hover:bg-primary/5"
          >
            <a href="#how-it-works">See how it works</a>
          </Button>
        </div>

        {/* Trust line */}
        <p
          className={`text-sm text-muted-foreground mb-16 transition-all duration-700 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          No credit card required. GDPR & CCPA compliant.
        </p>

        {/* Stats row */}
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-border transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="text-3xl lg:text-4xl font-display tracking-tight">{stat.value}</span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
