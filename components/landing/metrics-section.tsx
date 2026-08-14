"use client";

import { useEffect, useState, useRef } from "react";

const metrics = [
  {
    value: "<2%",
    label: "Bounce rate",
    description: "Guaranteed. Auto-refund if a verified email bounces within 14 days.",
  },
  {
    value: "1.5s",
    label: "Average enrichment",
    description: "Time to enrich a contact through the full waterfall pipeline.",
  },
  {
    value: "15+",
    label: "Providers",
    description: "Data sources queried in sequence. You get the best result, not just one source.",
  },
  {
    value: "$49/mo",
    label: "All-in starting price",
    description: "No per-seat fees, no hidden credit traps.",
  },
];

export function MetricsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  return (
    <section id="metrics" ref={sectionRef} className="relative py-24 lg:py-32 border-y border-border">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-border" />
            Key figures
          </span>
          <h2
            className={`text-4xl lg:text-5xl font-semibold tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Performance you can measure.
          </h2>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`p-6 rounded-lg border border-border bg-white transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl lg:text-5xl font-bold tracking-tight text-primary">
                {metric.value}
              </div>
              <div className="mt-3 text-base font-medium text-foreground">
                {metric.label}
              </div>
              <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {metric.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
