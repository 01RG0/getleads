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

const cardStates = [
  {
    label: "INPUT",
    lines: [
      { key: "name:", value: "Sarah Chen" },
      { key: "company:", value: "Acme Corp" },
    ],
    status: null,
  },
  {
    label: "PROCESSING",
    lines: [
      { key: "provider_1:", value: "Apollo — miss" },
      { key: "provider_2:", value: "Prospeo — miss" },
      { key: "provider_3:", value: "Findymail — match!" },
      { key: "verify:", value: "SMTP ✓  Catch-all ✓  Syntax ✓" },
    ],
    status: "verifying",
  },
  {
    label: "OUTPUT",
    lines: [
      { key: "email:", value: "s.chen@acmecorp.com" },
      { key: "phone:", value: "+1 (415) 555-0142" },
      { key: "title:", value: "VP of Engineering" },
      { key: "pushed_to:", value: "HubSpot → Sequence #4" },
    ],
    status: "verified",
  },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
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

  const currentCard = cardStates[activeStep];

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
                  <span className={`font-display text-3xl transition-colors duration-500 ${activeStep === index ? "text-primary" : "text-background/30"}`}>{step.number}</span>
                  <div className="flex-1">
                    <h3 className="text-2xl lg:text-3xl font-display mb-3 group-hover:translate-x-2 transition-transform duration-300">
                      {step.title}
                    </h3>
                    <p className="text-background/60 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Progress indicator */}
                    {activeStep === index && (
                      <div className="mt-4 h-0.5 bg-background/10 overflow-hidden rounded-full">
                        <div
                          className="h-full bg-primary rounded-full"
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

          {/* Dynamic card that changes with steps */}
          <div className="lg:sticky lg:top-32 self-start">
            <div className="border border-background/10 p-8 lg:p-10 min-h-[360px] relative overflow-hidden">
              {/* Animated glow on step change */}
              <div
                key={activeStep}
                className="absolute inset-0 bg-primary/5 opacity-0 animate-pulse-once pointer-events-none"
              />

              {/* Step indicator dots */}
              <div className="flex gap-2 mb-6">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === activeStep ? "w-8 bg-primary" : i < activeStep ? "w-3 bg-green-400/60" : "w-3 bg-background/20"
                    }`}
                  />
                ))}
              </div>

              {/* Card label */}
              <span className="text-xs font-mono uppercase tracking-widest text-background/40">
                {currentCard.label}
              </span>

              {/* Card content - animated */}
              <div
                key={`card-${activeStep}`}
                className="mt-4 p-5 border border-background/10 rounded bg-background/5 space-y-2"
              >
                {currentCard.lines.map((line, i) => (
                  <p
                    key={`${activeStep}-${i}`}
                    className="font-mono text-sm text-background/70 opacity-0"
                    style={{
                      animation: `fadeSlideIn 0.4s ease-out ${i * 120}ms forwards`
                    }}
                  >
                    <span className="text-background/40">{line.key}</span>{" "}
                    <span className={line.value.includes("match") ? "text-green-400" : line.value.includes("miss") ? "text-background/40" : ""}>
                      {line.value}
                    </span>
                  </p>
                ))}
              </div>

              {/* Status indicator */}
              {currentCard.status && (
                <div
                  className="mt-4 flex items-center gap-2 opacity-0"
                  style={{ animation: "fadeSlideIn 0.4s ease-out 500ms forwards" }}
                >
                  {currentCard.status === "verified" && (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs font-mono text-green-400/80">Verified & delivered</span>
                    </>
                  )}
                  {currentCard.status === "verifying" && (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs font-mono text-primary/80">Verifying...</span>
                    </>
                  )}
                </div>
              )}

              {/* Animated cursor for processing step */}
              {activeStep === 1 && (
                <div className="mt-3 flex items-center gap-1 opacity-0" style={{ animation: "fadeSlideIn 0.4s ease-out 600ms forwards" }}>
                  <div className="w-1.5 h-4 bg-primary/70 animate-blink" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 0.8s step-end infinite;
        }
        .animate-pulse-once {
          animation: pulseOnce 0.6s ease-out forwards;
        }
        @keyframes pulseOnce {
          0% { opacity: 0.3; }
          100% { opacity: 0; }
        }
      `}</style>
    </section>
  );
}
