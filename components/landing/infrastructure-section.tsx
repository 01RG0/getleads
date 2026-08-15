"use client";

import { useEffect, useRef, useState } from "react";

const resilienceLayers = [
  { label: "Provider waterfall", detail: "When a provider times out or errors, the request automatically routes to the next provider in the chain. No manual intervention needed.", tag: "Failover" },
  { label: "Retry queue", detail: "If all 15+ providers fail simultaneously, the record enters a persistent retry queue. Your team gets a Slack/email notification within 60 seconds.", tag: "Recovery" },
  { label: "Idempotent reprocessing", detail: "Re-running a failed enrichment never creates duplicates. The same input always resolves to the same contact record.", tag: "Safety" },
  { label: "Isolated verification pipeline", detail: "The 3-stage email verification runs on separate infrastructure so a slow DNS lookup never blocks your enrichment results.", tag: "Isolation" },
  { label: "Live status per record", detail: "Every contact shows its current state: enriched, verifying, queued for retry, or failed with reason. Nothing sits in limbo.", tag: "Visibility" },
];

function AnimatedCounter({ target, suffix = "", duration = 2000 }: { target: string; suffix?: string; duration?: number }) {
  const [display, setDisplay] = useState(target);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        const num = parseFloat(target.replace(/[^0-9.]/g, ''));
        if (!isNaN(num)) {
          const steps = 30;
          const stepDuration = duration / steps;
          let current = 0;
          const timer = setInterval(() => {
            current++;
            const progress = current / steps;
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = num * eased;
            if (target.includes('.')) {
              setDisplay(value.toFixed(1) + suffix);
            } else {
              setDisplay(Math.round(value) + suffix);
            }
            if (current >= steps) {
              clearInterval(timer);
              setDisplay(target);
            }
          }, stepDuration);
        }
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, suffix, duration, hasAnimated]);

  return <div ref={ref}>{display}</div>;
}

export function InfrastructureSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeLayer, setActiveLayer] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLayer((prev) => (prev + 1) % resilienceLayers.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              Infrastructure
            </span>
            <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-8">
              No lead gets
              <br />
              lost.
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              If a provider times out, the request auto-retries through the next provider in the waterfall. If all providers fail, the record stays in a retry queue and your team gets notified. Every enrichment either succeeds or surfaces clearly — nothing disappears.
            </p>
            <div className="grid grid-cols-3 gap-8">
              <div className="group">
                <div className="text-4xl lg:text-5xl font-display mb-2 text-primary transition-transform duration-300 group-hover:scale-105">
                  <AnimatedCounter target="99.9%" suffix="%" />
                </div>
                <div className="text-sm text-muted-foreground">Uptime</div>
                <div className="mt-2 h-1 bg-foreground/5 rounded-full overflow-hidden">
                  <div className={`h-full bg-primary/40 rounded-full transition-all duration-1000 ${isVisible ? "w-[99.9%]" : "w-0"}`} />
                </div>
              </div>
              <div className="group">
                <div className="text-4xl lg:text-5xl font-display mb-2 text-primary transition-transform duration-300 group-hover:scale-105">Auto</div>
                <div className="text-sm text-muted-foreground">Retry on failure</div>
                <div className="mt-2 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 bg-primary/30 rounded-full"
                      style={{ animation: `pulseBar 1.5s ease-in-out ${i * 0.3}s infinite` }}
                    />
                  ))}
                </div>
              </div>
              <div className="group">
                <div className="text-4xl lg:text-5xl font-display mb-2 text-primary transition-transform duration-300 group-hover:scale-105">Zero</div>
                <div className="text-sm text-muted-foreground">Silent drops</div>
                <div className="mt-2 h-1 bg-[#3D7A4E]/20 rounded-full overflow-hidden">
                  <div className={`h-full bg-[#3D7A4E]/50 rounded-full transition-all duration-1500 delay-500 ${isVisible ? "w-full" : "w-0"}`} />
                </div>
              </div>
            </div>
          </div>

          <div className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
            <div className="border border-foreground/10 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-foreground/10 flex items-center justify-between bg-foreground/[0.01]">
                <span className="text-sm font-mono text-muted-foreground">Resilience layers</span>
                <span className="flex items-center gap-2 text-xs font-mono text-[#3D7A4E]">
                  <span className="w-2 h-2 rounded-full bg-[#3D7A4E] animate-pulse" />
                  All systems nominal
                </span>
              </div>
              <div>
                {resilienceLayers.map((layer, index) => (
                  <div
                    key={layer.label}
                    className={`px-6 py-5 border-b border-foreground/5 last:border-b-0 transition-colors duration-300 cursor-pointer ${
                      activeLayer === index ? "bg-primary/[0.04]" : "hover:bg-foreground/[0.01]"
                    }`}
                    style={{ borderLeft: activeLayer === index ? "2px solid var(--color-primary, #A6631F)" : "2px solid transparent" }}
                    onClick={() => setActiveLayer(index)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 transition-colors duration-300 ${
                          activeLayer === index ? "bg-primary" : "bg-foreground/20"
                        }`} />
                        <div>
                          <div className={`font-medium transition-colors duration-300 ${activeLayer === index ? "text-foreground" : "text-foreground/70"}`}>
                            {layer.label}
                          </div>
                          <div className={`text-sm text-muted-foreground mt-1 transition-opacity duration-300 ${
                            activeLayer === index ? "opacity-100" : "opacity-50"
                          }`}>
                            {layer.detail}
                          </div>
                        </div>
                      </div>
                      <span className={`font-mono text-xs border px-2 py-1 rounded shrink-0 transition-colors duration-300 ${
                        activeLayer === index ? "border-primary/30 text-primary bg-primary/5" : "border-foreground/10 text-muted-foreground"
                      }`}>
                        {layer.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseBar {
          0%, 100% { opacity: 0.3; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.5); }
        }
      `}</style>
    </section>
  );
}
