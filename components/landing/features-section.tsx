"use client";

import { useEffect, useRef, useState } from "react";

const features = [
  {
    number: "01",
    title: "Waterfall Enrichment",
    description: "Give us a name and company. We query 15+ providers in sequence until we find a verified email and direct dial. You only pay for results.",
    visual: "waterfall",
  },
  {
    number: "02",
    title: "3-Stage Verification",
    description: "Every email passes syntax validation, live SMTP handshake, and catch-all detection. If it bounces within 14 days, you get an automatic credit refund.",
    visual: "verify",
  },
  {
    number: "03",
    title: "Smart Routing",
    description: "Verified contacts flow directly into HubSpot, Salesforce, or your custom webhook. Set rules for who goes where based on title, company size, or score.",
    visual: "routing",
  },
  {
    number: "04",
    title: "AI Agent Access (MCP)",
    description: "Your AI SDR connects via Model Context Protocol. Claude, ChatGPT, or custom agents can search, enrich, and verify contacts without human CSV exports.",
    visual: "mcp",
  },
];

function WaterfallVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      {/* Provider cascade */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect
            x={40 + i * 8}
            y={30 + i * 22}
            width="100"
            height="16"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity={i < 3 ? 0.25 : 1}
          >
            <animate
              attributeName="opacity"
              values={i === 3 ? "0.4;1;1" : "0.15;0.5;0.15"}
              dur="3s"
              begin={`${i * 0.4}s`}
              repeatCount="indefinite"
            />
          </rect>
          {/* X mark for misses, check for hit */}
          {i < 3 && (
            <text
              x={148 + i * 8}
              y={42 + i * 22}
              fontSize="10"
              fill="currentColor"
              opacity="0.4"
            >
              --
            </text>
          )}
          {i === 3 && (
            <path
              d={`M ${146 + i * 8} ${38 + i * 22} l 3 3 l 6 -6`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <animate attributeName="opacity" values="0;1;1" dur="3s" begin="1.2s" repeatCount="indefinite" />
            </path>
          )}
        </g>
      ))}
      {/* Arrow down between rows */}
      {[0, 1, 2].map((i) => (
        <line
          key={`arrow-${i}`}
          x1={90 + i * 8}
          y1={46 + i * 22}
          x2={90 + (i + 1) * 8}
          y2={50 + (i + 1) * 22}
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.3"
          strokeDasharray="2 2"
        />
      ))}
    </svg>
  );
}

function VerifyVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      {/* Three check stages */}
      {["Syntax", "SMTP", "Catch-all"].map((label, i) => (
        <g key={label}>
          <rect
            x="50"
            y={30 + i * 40}
            width="100"
            height="28"
            rx="4"
            fill="currentColor"
            opacity="0.06"
          />
          <text
            x="65"
            y={48 + i * 40}
            fontSize="10"
            fill="currentColor"
            opacity="0.7"
            fontFamily="monospace"
          >
            {label}
          </text>
          {/* Animated check */}
          <circle
            cx="135"
            cy={44 + i * 40}
            r="7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.3"
          >
            <animate
              attributeName="opacity"
              values="0.2;1;1"
              dur="2.5s"
              begin={`${i * 0.6}s`}
              repeatCount="indefinite"
            />
          </circle>
          <path
            d={`M ${131} ${44 + i * 40} l 2.5 2.5 l 5 -5`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0"
          >
            <animate
              attributeName="opacity"
              values="0;0;1;1"
              dur="2.5s"
              begin={`${i * 0.6}s`}
              repeatCount="indefinite"
            />
          </path>
          {/* Connector */}
          {i < 2 && (
            <line
              x1="100"
              y1={58 + i * 40}
              x2="100"
              y2={70 + i * 40}
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.2"
              strokeDasharray="2 2"
            />
          )}
        </g>
      ))}
    </svg>
  );
}

function RoutingVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      {/* Source node */}
      <circle cx="40" cy="80" r="10" fill="currentColor" opacity="0.8">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Routing lines to destinations */}
      {[{ y: 40, label: "CRM" }, { y: 80, label: "Sequence" }, { y: 120, label: "Webhook" }].map((dest, i) => (
        <g key={dest.label}>
          <path
            d={`M 50 80 Q 90 ${80 + (dest.y - 80) * 0.3} 120 ${dest.y}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.3"
          >
            <animate
              attributeName="opacity"
              values="0.2;0.7;0.2"
              dur="2s"
              begin={`${i * 0.5}s`}
              repeatCount="indefinite"
            />
          </path>
          {/* Destination boxes */}
          <rect
            x="125"
            y={dest.y - 12}
            width="55"
            height="24"
            rx="4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <text
            x="135"
            y={dest.y + 4}
            fontSize="9"
            fill="currentColor"
            opacity="0.7"
            fontFamily="monospace"
          >
            {dest.label}
          </text>
        </g>
      ))}

      {/* Animated dot traveling along path */}
      <circle r="3" fill="currentColor">
        <animateMotion dur="2s" repeatCount="indefinite">
          <mpath href="#routePath" />
        </animateMotion>
      </circle>
      <path id="routePath" d="M 50 80 Q 90 56 120 40" fill="none" />
    </svg>
  );
}

function MCPVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      {/* AI agent icon */}
      <rect x="25" y="55" width="50" height="50" rx="6" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1.5" />
      <text x="37" y="85" fontSize="11" fill="currentColor" opacity="0.8" fontFamily="monospace">AI</text>

      {/* MCP connection */}
      <line x1="75" y1="80" x2="125" y2="80" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3">
        <animate attributeName="stroke-dashoffset" values="0;-7" dur="0.8s" repeatCount="indefinite" />
      </line>
      <text x="85" y="72" fontSize="7" fill="currentColor" opacity="0.5" fontFamily="monospace">MCP</text>

      {/* LeadScale API */}
      <rect x="125" y="55" width="50" height="50" rx="6" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1.5" />
      <text x="131" y="77" fontSize="7" fill="currentColor" opacity="0.6" fontFamily="monospace">search</text>
      <text x="131" y="89" fontSize="7" fill="currentColor" opacity="0.6" fontFamily="monospace">enrich</text>
      <text x="131" y="101" fontSize="7" fill="currentColor" opacity="0.6" fontFamily="monospace">verify</text>

      {/* Response arrow */}
      <path d="M 125 95 Q 100 110 75 95" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function AnimatedVisual({ type }: { type: string }) {
  switch (type) {
    case "waterfall":
      return <WaterfallVisual />;
    case "verify":
      return <VerifyVisual />;
    case "routing":
      return <RoutingVisual />;
    case "mcp":
      return <MCPVisual />;
    default:
      return <WaterfallVisual />;
  }
}

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`group relative transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 py-12 lg:py-20 border-b border-foreground/10">
        {/* Number */}
        <div className="shrink-0">
          <span className="font-mono text-sm text-muted-foreground">{feature.number}</span>
        </div>

        {/* Content */}
        <div className="flex-1 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-3xl lg:text-4xl font-display mb-4 group-hover:translate-x-2 transition-transform duration-500">
              {feature.title}
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </div>

          {/* Visual */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-48 h-40 text-foreground">
              <AnimatedVisual type={feature.visual} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturesSection() {
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

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative py-24 lg:py-32"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Capabilities
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Everything you need.
            <br />
            <span className="text-muted-foreground">Nothing you don&apos;t.</span>
          </h2>
        </div>

        {/* Features List */}
        <div>
          {features.map((feature, index) => (
            <FeatureCard key={feature.number} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
