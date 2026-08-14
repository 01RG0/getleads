"use client";

import { ArrowRight, Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    description: "For SDRs who need verified emails fast",
    price: 49,
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
    price: 149,
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
    price: 499,
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
  return (
    <section id="pricing" className="relative py-32 lg:py-40 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-20">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase block mb-6">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl">
            Start with the workflow your team needs today. Expand enrichment, verification, and routing as your volume grows.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 lg:p-10 rounded-lg bg-white border ${
                plan.popular ? "border-primary shadow-lg md:-my-4 md:py-12 lg:py-14" : "border-border"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-8 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium uppercase tracking-widest rounded-full">
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
                  <span className="text-5xl font-bold text-foreground">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={plan.name === "Agency" ? "#cta" : "#pricing"}
                className={`w-full py-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all group ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-primary text-primary hover:bg-primary/5"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="mt-12 text-center text-sm text-muted-foreground">
          All plans include GDPR/CCPA compliance, encrypted data, and 14-day bounce guarantee.
        </p>
      </div>
    </section>
  );
}
