"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Starter",
    description: "For SDRs who need verified emails fast",
    monthlyPrice: 49,
    annualPrice: 39,
    features: [
      "2,500 enrichment credits/mo",
      "1 workspace",
      "3-stage email verification",
      "REST API access",
      "CSV export & HubSpot sync",
    ],
    cta: "Start free",
    popular: false,
  },
  {
    name: "Growth Pro",
    description: "For RevOps teams running enrichment at scale",
    monthlyPrice: 149,
    annualPrice: 119,
    features: [
      "10,000 enrichment credits/mo",
      "MCP server for AI agents",
      "Waterfall across 15+ providers",
      "Webhook & real-time streaming",
      "Advanced analytics dashboard",
      "Team roles & collaboration",
      "Priority support",
    ],
    cta: "Start free",
    popular: true,
  },
  {
    name: "Agency",
    description: "For agencies managing multiple client workspaces",
    monthlyPrice: 499,
    annualPrice: 399,
    features: [
      "50,000 enrichment credits/mo",
      "Unlimited client sub-workspaces",
      "Credit pooling & allocation",
      "White-label client portal",
      "<2% bounce SLA guarantee",
      "24/7 dedicated support",
      "Custom waterfall builder",
      "Custom contracts & invoicing",
    ],
    cta: "Contact sales",
    popular: false,
  },
];

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [animatingPrice, setAnimatingPrice] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const toggleBilling = () => {
    setAnimatingPrice(true);
    setTimeout(() => {
      setIsAnnual(!isAnnual);
      setTimeout(() => setAnimatingPrice(false), 200);
    }, 150);
  };

  return (
    <section id="pricing" ref={sectionRef} className="relative py-32 lg:py-40 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase block mb-6">
            Pricing
          </span>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl">
            Start with the workflow your team needs today. Expand enrichment, verification, and routing as your volume grows.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className={`flex items-center gap-4 mb-16 transition-all duration-700 delay-100 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          <span className={`text-sm font-medium transition-colors ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Monthly
          </span>
          <button
            type="button"
            onClick={toggleBilling}
            className="relative h-7 w-14 rounded-full bg-foreground/10 border border-foreground/10 transition-colors hover:bg-foreground/15"
          >
            <div className={`absolute top-1 h-5 w-5 rounded-full bg-primary shadow-lg transition-all duration-300 ${
              isAnnual ? "left-8" : "left-1"
            }`} />
          </button>
          <span className={`text-sm font-medium transition-colors ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Annual
          </span>
          {isAnnual && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-medium rounded-full animate-fadeIn">
              <Sparkles className="w-3 h-3" />
              Save 20%
            </span>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative p-8 lg:p-10 rounded-xl bg-white border transition-all duration-700 hover:shadow-xl hover:-translate-y-1 ${
                plan.popular ? "border-primary shadow-lg shadow-primary/10 md:-my-4 md:py-12 lg:py-14" : "border-border hover:border-primary/30"
              } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${index * 100 + 200}ms` }}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-8 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-medium uppercase tracking-widest rounded-full shadow-lg shadow-primary/20">
                  Most Popular
                </span>
              )}

              {/* Plan Header */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-8 pb-8 border-b border-border">
                <div className="flex items-baseline gap-1">
                  <span className={`text-5xl font-bold text-foreground transition-all duration-300 ${
                    animatingPrice ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                  }`}>
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                {isAnnual && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">
                      ${plan.monthlyPrice}/mo
                    </span>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                      Save ${(plan.monthlyPrice - plan.annualPrice) * 12}/yr
                    </span>
                  </div>
                )}
                {!isAnnual && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    or ${plan.annualPrice}/mo billed annually
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-10">
                {plan.features.map((feature, fIndex) => (
                  <li
                    key={feature}
                    className={`flex items-start gap-3 transition-all duration-500 ${
                      isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                    }`}
                    style={{ transitionDelay: `${index * 100 + fIndex * 50 + 400}ms` }}
                  >
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={plan.name === "Agency" ? "#cta" : "#pricing"}
                className={`w-full py-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300 group ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                    : "border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className={`mt-16 text-center transition-all duration-700 delay-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          <p className="text-sm text-muted-foreground mb-4">
            All plans include GDPR/CCPA compliance, encrypted data, and 14-day bounce guarantee.
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              100 free credits to start
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
