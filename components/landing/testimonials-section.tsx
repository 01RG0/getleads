"use client";

import { useEffect, useState, useRef } from "react";

const testimonials = [
  {
    quote: "We were burning through domains sending to Apollo's 'verified' emails. LeadScale's triple-check actually works — our bounce rate dropped from 14% to 1.2% in the first week.",
    author: "Head of Outbound",
    role: "Series B SaaS",
    company: "Early access pilot",
    metric: "14% → 1.2%",
    metricLabel: "bounce rate",
  },
  {
    quote: "I manage 23 client accounts. Before LeadScale, that meant 23 logins and 23 invoices. Now it's one dashboard with per-client credit controls.",
    author: "Agency Founder",
    role: "50-person shop",
    company: "Early access pilot",
    metric: "23 → 1",
    metricLabel: "dashboard",
  },
  {
    quote: "Our AI SDR pulls contacts via MCP, verifies them, and adds to sequences automatically. What used to take an SDR 3 hours happens in 30 seconds.",
    author: "RevOps Engineer",
    role: "PLG startup",
    company: "Early access pilot",
    metric: "3hrs → 30s",
    metricLabel: "time saved",
  },
  {
    quote: "The waterfall is the killer feature. We get emails that Hunter and Prospeo miss individually because LeadScale tries both plus 13 others.",
    author: "Sales Ops Lead",
    role: "Enterprise team",
    company: "Early access pilot",
    metric: "15+",
    metricLabel: "providers",
  },
];

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 100);

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
        setIsAnimating(false);
        setProgress(0);
      }, 400);
    }, 5000);

    return () => {
      clearInterval(interval);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  const goTo = (idx: number) => {
    if (idx === activeIndex) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIndex(idx);
      setIsAnimating(false);
      setProgress(0);
    }, 400);
  };

  const activeTestimonial = testimonials[activeIndex];

  return (
    <section ref={sectionRef} className="relative py-32 lg:py-40 border-t border-foreground/10 lg:pb-14 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Label */}
        <div className="flex items-center gap-4 mb-16">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            What people say
          </span>
          <div className="flex-1 h-px bg-foreground/10" />
          <span className="font-mono text-xs text-muted-foreground">
            {String(activeIndex + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
          </span>
        </div>

        {/* Main Quote */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-8">
            <blockquote
              className={`transition-all duration-400 ${
                isAnimating ? "opacity-0 translate-y-6 scale-[0.98]" : "opacity-100 translate-y-0 scale-100"
              }`}
            >
              <p className="font-display text-3xl md:text-4xl lg:text-5xl leading-[1.15] tracking-tight text-foreground">
                &ldquo;{activeTestimonial.quote}&rdquo;
              </p>
            </blockquote>

            {/* Author */}
            <div
              className={`mt-12 flex items-center gap-6 transition-all duration-400 delay-100 ${
                isAnimating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center relative overflow-hidden">
                <span className="font-display text-xl text-primary relative z-10">
                  {activeTestimonial.author.charAt(0)}
                </span>
                <div className="absolute inset-0 bg-primary/5 animate-shimmer" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">{activeTestimonial.author}</p>
                <p className="text-muted-foreground">
                  {activeTestimonial.role}, {activeTestimonial.company}
                </p>
              </div>
            </div>
          </div>

          {/* Metric Highlight */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <div
              className={`p-8 border border-foreground/10 rounded-lg relative overflow-hidden transition-all duration-400 ${
                isAnimating ? "opacity-0 scale-90 rotate-1" : "opacity-100 scale-100 rotate-0"
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-foreground/5">
                <div
                  className="h-full bg-primary/50 transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase block mb-4">
                Key Result
              </span>
              <p className="font-display text-4xl md:text-5xl text-primary font-bold">
                {activeTestimonial.metric}
              </p>
              <p className="text-sm text-muted-foreground mt-2">{activeTestimonial.metricLabel}</p>
            </div>

            {/* Navigation Dots with progress */}
            <div className="flex gap-3 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`h-2.5 rounded-full transition-all duration-500 relative overflow-hidden ${
                    idx === activeIndex
                      ? "w-12 bg-primary/20"
                      : "w-2.5 bg-foreground/15 hover:bg-foreground/30"
                  }`}
                >
                  {idx === activeIndex && (
                    <div
                      className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-100 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
