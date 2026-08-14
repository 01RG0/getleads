"use client";

import { useEffect, useState, useRef } from "react";
import { Shield, Lock, Eye, FileCheck } from "lucide-react";

const securityFeatures = [
  {
    icon: Shield,
    title: "GDPR opt-out database",
    description: "Every enrichment auto-checks against suppression lists before returning results. Opted-out contacts never reach your CRM.",
  },
  {
    icon: Lock,
    title: "Encrypted everywhere",
    description: "TLS 1.3 in transit, AES-256 at rest. Your prospect data is encrypted at every stage of the enrichment pipeline.",
  },
  {
    icon: Eye,
    title: "Workspace isolation",
    description: "Client data never crosses workspace boundaries. Each agency client operates in a fully isolated environment with separate encryption keys.",
  },
  {
    icon: FileCheck,
    title: "Audit logging",
    description: "Every lookup, enrichment, and export is logged with timestamp, user, and workspace. Pull compliance reports in one click.",
  },
];

const certifications = ["GDPR", "CCPA", "SOC 2 (pending)", "Encryption at rest", "Auto-suppression"];

export function SecuritySection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
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

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % securityFeatures.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section id="security" ref={sectionRef} className="relative py-24 lg:py-32 bg-foreground/[0.02] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left: Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              Security
            </span>
            <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-8">
              Your data,
              <br />
              your rules.
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              B2B prospecting means handling personal data responsibly. LeadScale enforces
              compliance at the infrastructure level — suppression lists, encryption, isolation,
              and full audit trails come standard, not as add-ons.
            </p>

            {/* Certifications - animated badges */}
            <div className="flex flex-wrap gap-3">
              {certifications.map((cert, index) => (
                <span
                  key={cert}
                  className={`px-4 py-2 bg-primary/10 border border-primary/20 text-sm font-mono transition-all duration-500 hover:bg-primary/20 hover:scale-105 cursor-default ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${index * 80 + 300}ms` }}
                >
                  {cert}
                </span>
              ))}
            </div>

            {/* Security visual - animated lock */}
            <div className="mt-12 flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-primary/30 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-primary/20 animate-ping opacity-30" />
              </div>
              <div>
                <div className="text-sm font-medium">256-bit AES encryption active</div>
                <div className="text-xs text-muted-foreground">All data encrypted at rest and in transit</div>
              </div>
            </div>
          </div>

          {/* Right: Features - with hover/active states */}
          <div className="grid gap-4">
            {securityFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`p-6 border rounded-lg transition-all duration-500 cursor-pointer ${
                  activeFeature === index
                    ? "border-primary/30 bg-primary/[0.03] shadow-lg shadow-primary/5"
                    : "border-foreground/10 hover:border-foreground/20"
                } ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onClick={() => setActiveFeature(index)}
              >
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500 ${
                    activeFeature === index
                      ? "bg-primary text-background scale-110 shadow-lg shadow-primary/20"
                      : "border border-foreground/10 group-hover:bg-primary group-hover:text-background"
                  }`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-medium mb-1 transition-all duration-300 ${
                      activeFeature === index ? "text-foreground translate-x-1" : "text-foreground/80"
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`text-muted-foreground transition-all duration-500 ${
                      activeFeature === index ? "max-h-20 opacity-100" : "max-h-0 opacity-0 overflow-hidden lg:max-h-20 lg:opacity-70"
                    }`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
