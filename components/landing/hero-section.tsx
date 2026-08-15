"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AnimatedSphere } from "./animated-sphere";

const words = ["seconds", "pipeline", "revenue", "results"];

const stats = [
  { value: "<2%", label: "Bounce rate" },
  { value: "15+", label: "Data sources" },
  { value: "1.5s", label: "Avg enrichment" },
  { value: "$49/mo", label: "Starting price" },
];

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-background">
      {/* Animated sphere background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] opacity-40 pointer-events-none">
        <AnimatedSphere />
      </div>

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
            className={`text-[clamp(3rem,10vw,8rem)] font-display leading-[0.95] tracking-tight transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="block">Find verified emails</span>
            <span className="block">
              in{" "}
              <span className="relative inline-block">
                <span key={wordIndex} className="inline-flex">
                  {words[wordIndex].split("").map((char, i) => (
                    <span
                      key={`${wordIndex}-${i}`}
                      className="inline-block animate-char-in"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-3 bg-primary/15" />
              </span>
            </span>
          </h1>
        </div>

        {/* Subheadline */}
        <p
          className={`text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-10 transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          LeadScale queries 15+ data providers in sequence until it finds a match, then verifies every email with 3-stage checks — guaranteeing less than 2% bounce rates.
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
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-14 text-base rounded-full group btn-tactile shadow-[0_4px_16px_rgba(166,99,31,0.2)] hover:shadow-[0_8px_24px_rgba(166,99,31,0.3)]"
          >
            <a href="#pricing">
              Start free — 100 contacts included
              <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-1.5" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-14 px-8 text-base rounded-full border-border hover:bg-primary/5 btn-tactile"
          >
            <a href="#how-it-works">See how it works</a>
          </Button>
        </div>

        {/* Trust line */}
        <p className="text-sm text-muted-foreground mb-16">
          No credit card required. GDPR & CCPA compliant.
        </p>

        {/* Stats marquee */}
        <div
          className={`flex gap-16 pt-12 border-t border-border marquee whitespace-nowrap transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-16">
              {stats.map((stat) => (
                <div key={`${stat.label}-${i}`} className="flex items-baseline gap-4">
                  <span className="text-4xl lg:text-5xl font-display">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
