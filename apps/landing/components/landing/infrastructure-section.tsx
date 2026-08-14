"use client";

import { useEffect, useRef, useState } from "react";

const resilienceLayers = [
  { label: "Automatic retries", detail: "If a provider is slow or unavailable, the request tries again instead of disappearing.", tag: "Recovery" },
  { label: "Backup paths", detail: "When one data source cannot respond, LeadScale can continue through the next available path.", tag: "Continuity" },
  { label: "Safe reprocessing", detail: "Incomplete records stay visible and can be safely re-run rather than being lost in the queue.", tag: "Visibility" },
  { label: "Isolated research", detail: "Research work runs separately so a heavy lookup cannot slow down the rest of your lead flow.", tag: "Protection" },
  { label: "Clear status", detail: "Your team can see what succeeded, what needs attention, and what is ready to move forward.", tag: "Control" },
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
              Nothing gets
              <br />
              lost.
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              If a provider fails or times out, the request automatically retries through a backup path instead of silently dropping a lead. LeadScale keeps every handoff visible and recoverable.
            </p>
            <div className="grid grid-cols-3 gap-8">
              <div><div className="text-4xl lg:text-5xl font-display mb-2">5</div><div className="text-sm text-muted-foreground">Recovery layers</div></div>
              <div><div className="text-4xl lg:text-5xl font-display mb-2">100%</div><div className="text-sm text-muted-foreground">Visible status</div></div>
              <div><div className="text-4xl lg:text-5xl font-display mb-2">24/7</div><div className="text-sm text-muted-foreground">Ready to recover</div></div>
            </div>
          </div>

          <div className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
            <div className="border border-foreground/10">
              <div className="px-6 py-4 border-b border-foreground/10 flex items-center justify-between">
                <span className="text-sm font-mono text-muted-foreground">What your team sees</span>
                <span className="flex items-center gap-2 text-xs font-mono text-green-600"><span className="w-2 h-2 rounded-full bg-green-500" />Recovery ready</span>
              </div>
              <div>
                {resilienceLayers.map((layer, index) => (
                  <div key={layer.label} className={`px-6 py-5 border-b border-foreground/5 last:border-b-0 transition-all duration-300 ${activeLayer === index ? "bg-foreground/[0.02]" : ""}`}>
                    <button type="button" onClick={() => setActiveLayer(index)} className="w-full text-left flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4"><span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${activeLayer === index ? "bg-foreground" : "bg-foreground/20"}`} /><div><div className="font-medium">{layer.label}</div><div className="text-sm text-muted-foreground mt-1">{layer.detail}</div></div></div>
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
