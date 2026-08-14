"use client";

import { useEffect, useState, useRef } from "react";

const metrics = [
  {
    value: "<2%",
    label: "Bounce rate",
    description: "Guaranteed. Auto-refund if a verified email bounces within 14 days.",
    animatedValue: 1.8,
    suffix: "%",
    prefix: "<",
  },
  {
    value: "1.5s",
    label: "Average enrichment",
    description: "Time to enrich a contact through the full waterfall pipeline.",
    animatedValue: 1.5,
    suffix: "s",
    prefix: "",
  },
  {
    value: "15+",
    label: "Providers",
    description: "Data sources queried in sequence. You get the best result, not just one source.",
    animatedValue: 15,
    suffix: "+",
    prefix: "",
  },
  {
    value: "$49/mo",
    label: "All-in starting price",
    description: "No per-seat fees, no hidden credit traps.",
    animatedValue: 49,
    suffix: "/mo",
    prefix: "$",
  },
];

function CountUpValue({ metric, isVisible }: { metric: typeof metrics[0]; isVisible: boolean }) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isVisible) return;
    const target = metric.animatedValue;
    const steps = 40;
    const stepDuration = 1500 / steps;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      const progress = current / steps;
      const eased = 1 - Math.pow(1 - progress, 4);
      const value = target * eased;

      if (metric.suffix === "s" || metric.value.includes(".")) {
        setDisplay(value.toFixed(1));
      } else {
        setDisplay(Math.round(value).toString());
      }

      if (current >= steps) {
        clearInterval(timer);
        if (metric.suffix === "s" || metric.value.includes(".")) {
          setDisplay(target.toFixed(1));
        } else {
          setDisplay(target.toString());
        }
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible, metric]);

  return (
    <span>
      {metric.prefix}{display}{metric.suffix}
    </span>
  );
}

export function MetricsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`group relative p-8 rounded-xl border border-border bg-white overflow-hidden transition-all duration-700 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${index * 120}ms` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Background glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent transition-opacity duration-500 ${
                hoveredIndex === index ? "opacity-100" : "opacity-0"
              }`} />

              <div className="relative">
                <div className="text-4xl lg:text-5xl font-bold tracking-tight text-primary mb-1">
                  {isVisible ? <CountUpValue metric={metric} isVisible={isVisible} /> : "0"}
                </div>
                <div className="mt-3 text-base font-medium text-foreground">
                  {metric.label}
                </div>
                <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {metric.description}
                </div>

                {/* Animated underline */}
                <div className="mt-4 h-0.5 bg-foreground/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-primary/30 rounded-full transition-all duration-1000 ${
                      isVisible ? "w-full" : "w-0"
                    }`}
                    style={{ transitionDelay: `${index * 200 + 500}ms` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
