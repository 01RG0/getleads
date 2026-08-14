"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "I",
    title: "Paste your prospect list",
    description: "Upload a CSV or send contacts via API. Just name + company is enough — we handle the rest.",
  },
  {
    number: "II",
    title: "We find and verify",
    description: "Our waterfall engine queries providers until it finds a valid email. Then 3-stage verification confirms deliverability in real time.",
  },
  {
    number: "III",
    title: "Verified contacts land in your tools",
    description: "Enriched records push directly to your CRM or outreach sequence. Your reps see only verified, ready-to-contact leads.",
  },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-foreground text-background overflow-hidden"
    >
      {/* Diagonal lines pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 40px,
            currentColor 40px,
            currentColor 41px
          )`
        }} />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-background/50 mb-6">
            <span className="w-8 h-px bg-background/30" />
            Process
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Three steps.
            <br />
            <span className="text-background/50">Zero guesswork.</span>
          </h2>
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Steps */}
          <div className="space-y-0">
            {steps.map((step, index) => (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`w-full text-left py-8 border-b border-background/10 transition-all duration-500 group ${
                  activeStep === index ? "opacity-100" : "opacity-40 hover:opacity-70"
                }`}
              >
                <div className="flex items-start gap-6">
                  <span className="font-display text-3xl text-background/30">{step.number}</span>
                  <div className="flex-1">
                    <h3 className="text-2xl lg:text-3xl font-display mb-3 group-hover:translate-x-2 transition-transform duration-300">
                      {step.title}
                    </h3>
                    <p className="text-background/60 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Progress indicator */}
                    {activeStep === index && (
                      <div className="mt-4 h-px bg-background/20 overflow-hidden">
                        <div
                          className="h-full bg-primary w-0"
                          style={{
                            animation: 'progress 5s linear forwards'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Before/After card */}
          <div className="lg:sticky lg:top-32 self-start">
            <div className="border border-background/10 p-8 lg:p-10 min-h-[320px] flex flex-col justify-between">
              {/* Input */}
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-background/40">Input</span>
                <div className="mt-3 p-4 border border-background/10 rounded bg-background/5">
                  <p className="font-mono text-sm text-background/70">
                    <span className="text-background/40">name:</span> Sarah Chen
                  </p>
                  <p className="font-mono text-sm text-background/70">
                    <span className="text-background/40">company:</span> Acme Corp
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center py-4">
                <svg width="20" height="24" viewBox="0 0 20 24" fill="none" className="text-background/30">
                  <path d="M10 0 L10 20 M4 14 L10 20 L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Output */}
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-background/40">Output</span>
                <div className="mt-3 p-4 border border-background/10 rounded bg-background/5">
                  <p className="font-mono text-sm text-background/70">
                    <span className="text-background/40">email:</span> s.chen@acmecorp.com
                  </p>
                  <p className="font-mono text-sm text-background/70">
                    <span className="text-background/40">phone:</span> +1 (415) 555-0142
                  </p>
                  <p className="font-mono text-sm text-background/70">
                    <span className="text-background/40">title:</span> VP of Engineering
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-xs font-mono text-green-400/80">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
