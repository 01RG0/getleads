"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Check, Terminal, Zap, ArrowRight } from "lucide-react";

const codeExamples = [
  {
    label: "Enrich",
    code: `import { LeadScale } from '@leadscale/sdk'

const ls = new LeadScale({
  apiKey: process.env.LEADSCALE_API_KEY
})

const contact = await ls.enrich({
  name: 'Jane Smith',
  company: 'Acme Corp'
})

// {
//   email: 'jane.smith@acme.com',
//   phone: '+1-555-0142',
//   verified: true,
//   confidence: 0.97
// }`,
  },
  {
    label: "Search",
    code: `const leads = await ls.search({
  title: 'VP of Sales',
  industry: 'SaaS',
  employees: '50-200',
  location: 'US'
})

// [
//   { name: 'Sarah Chen', email: 'sarah@...',
//     title: 'VP Sales', company: 'Acme' },
//   { name: 'Mike Torres', email: 'mike@...',
//     title: 'VP Sales', company: 'Nova' },
//   ...12 more results
// ]`,
  },
  {
    label: "Verify",
    code: `const result = await ls.verify({
  email: 'jane.smith@acme.com'
})

// {
//   deliverable: true,
//   score: 0.98,
//   risk_flags: [],
//   mx_valid: true,
//   smtp_check: 'pass',
//   catch_all: false
// }`,
  },
];

const mcpContracts = ["search_leads", "enrich_contact", "verify_deliverability", "create_campaign"];

const features = [
  {
    icon: Terminal,
    title: "TypeScript SDK",
    description: "Full type safety with auto-generated types for every response."
  },
  {
    icon: Zap,
    title: "MCP native",
    description: "Connect Claude, ChatGPT, or Copilot via Model Context Protocol."
  },
  {
    title: "Webhook streaming",
    description: "Get enrichment results pushed in real time as providers respond."
  },
  {
    title: "Batch upload",
    description: "Enrich one contact or upload 10K via CSV — same API, same guarantees."
  },
];

export function DevelopersSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [typingLine, setTypingLine] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExamples[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setTypingLine(0);
    const lines = codeExamples[activeTab].code.split('\n').length;
    const interval = setInterval(() => {
      setTypingLine((prev) => {
        if (prev >= lines) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <section id="developers" ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left: Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              For developers
            </span>
            <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-8">
              One API call.
              <br />
              <span className="text-muted-foreground">Verified contact back.</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Search, enrich, and verify B2B contacts programmatically. Connect your AI agent via MCP for fully autonomous prospecting.
            </p>

            {/* MCP tool contracts - animated */}
            <div className="mb-12">
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">MCP tool contracts</h3>
              <div className="grid grid-cols-2 gap-3">
                {mcpContracts.map((contract, i) => (
                  <code
                    key={contract}
                    className={`border border-foreground/10 px-3 py-2.5 text-sm text-foreground/80 rounded transition-all duration-500 hover:border-primary/30 hover:bg-primary/5 cursor-default ${
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                    style={{ transitionDelay: `${i * 80 + 300}ms` }}
                  >
                    {contract}
                  </code>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`transition-all duration-500 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${index * 80 + 500}ms` }}
                >
                  <h3 className="font-medium mb-1 flex items-center gap-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Code block */}
          <div
            className={`lg:sticky lg:top-32 transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="border border-foreground/10 rounded-lg overflow-hidden shadow-2xl shadow-foreground/5">
              {/* Tabs */}
              <div className="flex items-center border-b border-foreground/10 bg-foreground/[0.02]">
                {codeExamples.map((example, idx) => (
                  <button
                    key={example.label}
                    type="button"
                    onClick={() => setActiveTab(idx)}
                    className={`px-6 py-4 text-sm font-mono transition-all relative ${
                      activeTab === idx
                        ? "text-foreground bg-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {example.label}
                    {activeTab === idx && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                ))}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-4 py-4 text-muted-foreground hover:text-foreground transition-all hover:scale-110"
                  aria-label="Copy code"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Code content with line-by-line reveal */}
              <div className="p-6 lg:p-8 font-mono text-sm bg-foreground/[0.01] min-h-[280px] relative overflow-hidden">
                <pre className="text-foreground/80">
                  {codeExamples[activeTab].code.split('\n').map((line, lineIndex) => (
                    <div
                      key={`${activeTab}-${lineIndex}`}
                      className="leading-relaxed transition-all duration-300"
                      style={{
                        opacity: lineIndex < typingLine ? 1 : 0,
                        transform: lineIndex < typingLine ? 'translateX(0)' : 'translateX(-12px)',
                        transitionDelay: `${lineIndex * 30}ms`,
                      }}
                    >
                      <span className="text-foreground/20 select-none inline-block w-6 text-right mr-4">
                        {lineIndex + 1}
                      </span>
                      <span className={line.startsWith('//') ? 'text-foreground/40' : ''}>
                        {line}
                      </span>
                    </div>
                  ))}
                </pre>
                {/* Typing cursor */}
                {typingLine < codeExamples[activeTab].code.split('\n').length && (
                  <div className="inline-block w-2 h-4 bg-primary/70 animate-pulse ml-8" />
                )}
              </div>
            </div>

            {/* Links */}
            <div className="mt-6 flex items-center gap-6 text-sm">
              <a href="#" className="text-primary hover:underline underline-offset-4 font-medium flex items-center gap-1">
                Read the docs
                <ArrowRight className="w-3 h-3" />
              </a>
              <span className="text-foreground/20">|</span>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                View MCP contracts
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

