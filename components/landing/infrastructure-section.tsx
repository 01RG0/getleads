"use client";

import { useEffect, useRef, useState } from "react";

const resilienceLayers = [
  { label: "Provider waterfall", detail: "When a provider times out or errors, the request automatically routes to the next provider in the chain. No manual intervention needed.", tag: "Failover" },
  { label: "Retry queue", detail: "If all 15+ providers fail simultaneously, the record enters a persistent retry queue. Your team gets a Slack/email notification within 60 seconds.", tag: "Recovery" },
  { label: "Idempotent reprocessing", detail: "Re-running a failed enrichment never creates duplicates. The same input always resolves to the same contact record.", tag: "Safety" },
  { label: "Isolated verification pipeline", detail: "The 3-stage email verification runs on separate infrastructure so a slow DNS lookup never blocks your enrichment results.", tag: "Isolation" },
  { label: "Live status per record", detail: "Every contact shows its current state: enriched, verifying, queued for retry, or failed with reason. Nothing sits in limbo.", tag: "Visibility" },
];

export function InfrastructureSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeLayer, setActiveLayer] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLayer((prev) => (prev + 1) % resilienceLayers.length);
    }, 2600);
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
              <div><div className="text-4xl lg:text-5xl font-display mb-2">99.9%</div><div className="text-sm text-muted-foreground">Uptime</div></div>
              <div><div className="text-4xl lg:text-5xl font-display mb-2">Auto</div><div className="text-sm text-muted-foreground">Retry on failure</div></div>
              <div><div className="text-4xl lg:text-5xl font-display mb-2">Zero</div><div className="text-sm text-muted-foreground">Silent drops</div></div>
            </div>
          </div>

          <div className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
            <div className="border border-foreground/10">
              <div className="px-6 py-4 border-b border-foreground/10 flex items-center justify-between">
                <span className="text-sm font-mono text-muted-foreground">Resilience layers</span>
                <span className="flex items-center gap-2 text-xs font-mono text-green-600"><span className="w-2 h-2 rounded-full bg-green-500" />All systems nominal</span>
              </div>
              <div>
                {resilienceLayers.map((layer, index) => (
                  <div key={layer.label} className={`px-6 py-5 border-b border-foreground/5 last:border-b-0 transition-all duration-300 ${activeLayer === index ? "bg-foreground/[0.02]" : ""}`}>
                    <button type="button" onClick={() => setActiveLayer(index)} className="w-full text-left flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4"><span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${activeLayer === index ? "bg-primary" : "bg-foreground/20"}`} /><div><div className="font-medium">{layer.label}</div><div className="text-sm text-muted-foreground mt-1">{layer.detail}</div></div></div>
                      <span className="font-mono text-xs text-muted-foreground border border-foreground/10 px-2 py-1">{layer.tag}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
