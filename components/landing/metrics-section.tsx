"use client";

import { useEffect, useState, useRef } from "react";
import { ShieldCheck, Zap, Database, DollarSign } from "lucide-react";

const metrics = [
  {
    value: "<2%",
    label: "Bounce rate",
    description: "Guaranteed. Auto-refund if a verified email bounces within 14 days.",
    animatedValue: 1.8,
    suffix: "%",
    prefix: "<",
    icon: ShieldCheck,
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    barColor: "bg-green-500",
    barWidth: "18%",
  },
  {
    value: "1.5s",
    label: "Average enrichment",
    description: "Time to enrich a contact through the full waterfall pipeline.",
    animatedValue: 1.5,
    suffix: "s",
    prefix: "",
    icon: Zap,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    barColor: "bg-amber-500",
    barWidth: "85%",
  },
  {
    value: "15+",
    label: "Providers",
    description: "Data sources queried in sequence. You get the best result, not just one source.",
    animatedValue: 15,
    suffix: "+",
    prefix: "",
    icon: Database,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    barColor: "bg-blue-500",
    barWidth: "100%",
  },
  {
    value: "$49/mo",
    label: "All-in starting price",
    description: "No per-seat fees, no hidden credit traps.",
    animatedValue: 49,
    suffix: "/mo",
    prefix: "$",
    icon: DollarSign,
    color: "text-primary",
    bgColor: "bg-primary/10",
    barColor: "bg-primary",
    barWidth: "40%",
  },
];

function CountUpValue({ metric, isVisible, index }: { metric: typeof metrics[0]; isVisible: boolean; index: number }) {
  const [display, setDisplay] = useState("0");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    const delay = index * 200;
    const timeout = setTimeout(() => {
      const target = metric.animatedValue;
      const steps = 50;
      const stepDuration = 1800 / steps;
      let current = 0;

      const timer = setInterval(() => {
        current++;
        const progress = current / steps;
        const eased = 1 - Math.pow(1 - progress, 5);
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
          setDone(true);
        }
      }, stepDuration);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isVisible, metric, index]);

  return (
    <span className={`inline-block transition-transform duration-300 ${done ? "scale-100" : "scale-110"}`}>
      {metric.prefix}{display}{metric.suffix}
    </span>
  );
}

export function MetricsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="metrics" ref={sectionRef} className="relative py-24 lg:py-32 border-y border-border overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, currentColor 1px, transparent 1px),
                            radial-gradient(circle at 80% 20%, currentColor 1px, transparent 1px),
                            radial-gradient(circle at 60% 80%, currentColor 1px, transparent 1px)`,
          backgroundSize: '100px 100px, 80px 80px, 120px 120px',
        }} />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative">
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
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className={`group relative p-8 rounded-xl border border-border bg-white overflow-hidden transition-all duration-700 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                {/* Top icon */}
                <div className={`w-10 h-10 rounded-lg ${metric.bgColor} flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>

                {/* Big number */}
                <div className="text-4xl lg:text-5xl font-bold tracking-tight text-primary mb-1">
                  {isVisible ? <CountUpValue metric={metric} isVisible={isVisible} index={index} /> : <span className="opacity-0">0</span>}
                </div>

                <div className="mt-3 text-base font-semibold text-foreground">
                  {metric.label}
                </div>
                <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {metric.description}
                </div>

                {/* Animated progress bar */}
                <div className="mt-5 h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${metric.barColor} rounded-full transition-all ease-out`}
                    style={{
                      width: isVisible ? metric.barWidth : "0%",
                      transitionDuration: "2000ms",
                      transitionDelay: `${index * 250 + 600}ms`,
                    }}
                  />
                </div>

                {/* Pulsing ring on hover */}
                <div className="absolute -top-2 -right-2 w-20 h-20 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700 pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
