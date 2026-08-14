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

function SecurityShieldVisual({ activeFeature }: { activeFeature: number }) {
  return (
    <div className="relative w-full max-w-[200px] mx-auto">
      <svg viewBox="0 0 120 140" className="w-full h-auto">
        {/* Shield outline */}
        <path
          d="M60 10 L105 30 L105 70 C105 100 85 125 60 135 C35 125 15 100 15 70 L15 30 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary/30"
        />
        {/* Shield fill with pulse */}
        <path
          d="M60 10 L105 30 L105 70 C105 100 85 125 60 135 C35 125 15 100 15 70 L15 30 Z"
          className="text-primary/5"
          fill="currentColor"
        >
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
        </path>
        {/* Scanning line */}
        <line x1="25" x2="95" strokeWidth="1.5" stroke="currentColor" className="text-primary/40">
          <animate attributeName="y1" values="30;120;30" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="y2" values="30;120;30" dur="2.5s" repeatCount="indefinite" />
        </line>
        {/* Check mark that appears */}
        <path
          d="M42 72 L55 85 L80 55"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-green-500"
        >
          <animate attributeName="stroke-dasharray" values="0 60;60 0" dur="1.5s" begin="0.5s" fill="freeze" />
          <animate attributeName="opacity" values="0;0;1" dur="1.5s" begin="0.5s" fill="freeze" />
        </path>
        {/* Orbiting dots */}
        <circle r="3" className="text-primary" fill="currentColor">
          <animateMotion dur="4s" repeatCount="indefinite" path="M60 25 C90 25 100 50 100 70 C100 95 80 115 60 125 C40 115 20 95 20 70 C20 50 30 25 60 25" />
          <animate attributeName="opacity" values="0.3;1;0.3" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle r="2" className="text-primary/60" fill="currentColor">
          <animateMotion dur="4s" begin="2s" repeatCount="indefinite" path="M60 25 C90 25 100 50 100 70 C100 95 80 115 60 125 C40 115 20 95 20 70 C20 50 30 25 60 25" />
          <animate attributeName="opacity" values="0.2;0.8;0.2" dur="4s" begin="2s" repeatCount="indefinite" />
        </circle>
      </svg>
      {/* Active status */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] font-mono text-green-700 whitespace-nowrap">PROTECTED</span>
      </div>
    </div>
  );
}

function EncryptionVisual() {
  return (
    <div className="mt-10 p-4 border border-foreground/10 rounded-lg bg-foreground/[0.01] overflow-hidden relative">
      {/* Scanning overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 h-8 bg-gradient-to-b from-primary/5 to-transparent" style={{ animation: "scanDown 3s linear infinite" }} />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <Lock className="w-4 h-4 text-primary" />
        <span className="text-xs font-mono text-muted-foreground">Real-time encryption status</span>
      </div>
      <div className="space-y-2">
        {["TLS 1.3 handshake", "AES-256 encryption", "Key rotation"].map((item, i) => (
          <div key={item} className="flex items-center justify-between">
            <span className="text-xs font-mono text-foreground/60">{item}</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[0, 1, 2, 3].map((bar) => (
                  <div
                    key={bar}
                    className="w-1 bg-green-500 rounded-full"
                    style={{
                      height: `${8 + bar * 3}px`,
                      animation: `barPulse 1.5s ease-in-out ${i * 0.2 + bar * 0.1}s infinite`,
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px] font-mono text-green-600">active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              B2B prospecting means handling personal data responsibly. LeadScale enforces
              compliance at the infrastructure level — suppression lists, encryption, isolation,
              and full audit trails come standard, not as add-ons.
            </p>

            {/* Certifications - animated badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              {certifications.map((cert, index) => (
                <span
                  key={cert}
                  className={`px-4 py-2 bg-primary/10 border border-primary/20 text-sm font-mono rounded-md transition-all duration-500 hover:bg-primary/20 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 cursor-default ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${index * 100 + 300}ms` }}
                >
                  {cert}
                </span>
              ))}
            </div>

            {/* Encryption status visual */}
            <EncryptionVisual />
          </div>

          {/* Right: Shield + Features */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
            {/* Animated shield */}
            <div className="mb-10 flex justify-center">
              <SecurityShieldVisual activeFeature={activeFeature} />
            </div>

            {/* Features */}
            <div className="grid gap-3">
              {securityFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className={`p-5 border rounded-lg transition-all duration-500 cursor-pointer ${
                      activeFeature === index
                        ? "border-primary/30 bg-primary/[0.04] shadow-lg shadow-primary/5 -translate-x-1"
                        : "border-foreground/10 hover:border-foreground/20 hover:bg-foreground/[0.01]"
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500 ${
                        activeFeature === index
                          ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20 rotate-3"
                          : "bg-foreground/5 text-foreground/60"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-base font-medium transition-all duration-300 ${
                          activeFeature === index ? "text-foreground" : "text-foreground/70"
                        }`}>
                          {feature.title}
                        </h3>
                        <p className={`text-sm text-muted-foreground mt-1 transition-all duration-300 ${
                          activeFeature === index ? "opacity-100" : "opacity-60"
                        }`}>
                          {feature.description}
                        </p>
                      </div>
                      {/* Active indicator */}
                      {activeFeature === index && (
                        <div className="shrink-0 w-2 h-2 rounded-full bg-green-500 mt-2 animate-pulse" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scanDown {
          0% { top: -32px; }
          100% { top: 100%; }
        }
        @keyframes barPulse {
          0%, 100% { opacity: 0.5; transform: scaleY(0.8); }
          50% { opacity: 1; transform: scaleY(1.2); }
        }
      `}</style>
    </section>
  );
}
