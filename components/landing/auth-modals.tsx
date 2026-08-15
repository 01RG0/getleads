"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MeshGradient } from "@paper-design/shaders-react";

function PasswordInput({ id, label, name }: { id: string; label: string; name: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] font-mono text-white/70 mb-2 tracking-[0.5px] uppercase">
        {label} *
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          id={id}
          name={name}
          className="w-full px-4 py-2.5 rounded-lg bg-[#00000033] border-0 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 text-sm h-10"
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.67 3.67 0 0 1-1.59 2.41v2h2.57C14.78 13.67 15.68 11.64 15.68 9.18z" fill="#4285F4" />
      <path d="M8 16c2.16 0 3.97-.71 5.3-1.93l-2.58-2a4.8 4.8 0 0 1-7.18-2.52H.96v2.07A8 8 0 0 0 8 16z" fill="#34A853" />
      <path d="M3.54 9.55A4.8 4.8 0 0 1 3.3 8c0-.54.09-1.07.24-1.55V4.38H.96A8 8 0 0 0 0 8c0 1.29.31 2.51.96 3.62l2.58-2.07z" fill="#FBBC05" />
      <path d="M8 3.2a4.33 4.33 0 0 1 3.07 1.2l2.3-2.3A7.7 7.7 0 0 0 8 0 8 8 0 0 0 .96 4.38l2.58 2.07A4.77 4.77 0 0 1 8 3.2z" fill="#EA4335" />
    </svg>
  );
}

// ─── Sign In ───────────────────────────────────────────────────────────────────

export function SignInCTA({ scrolled }: { scrolled?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    document.body.style.overflow = isExpanded ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isExpanded]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setIsExpanded(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  // Panel — portalled to body, matches template exactly
  const panel = (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-2">
          <motion.div
            layoutId="signin-bg"
            style={{ borderRadius: "24px" }}
            layout
            className="relative flex h-full w-full overflow-hidden bg-[#1C1712] transform-gpu will-change-transform"
          >
            <div className="h-full w-full overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative py-8 z-10 min-h-full flex flex-col lg:flex-row w-full max-w-[1100px] mx-auto items-center p-6 sm:p-10 lg:p-16 gap-8 lg:gap-16"
              >
                <div className="flex-1 flex flex-col justify-center space-y-3 w-full">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white leading-none tracking-[-0.03em]">
                    Welcome back
                  </h2>
                  <div className="space-y-4 pt-4">
                    {[
                      { d: "M5 13l4 4L19 7", text: "Pick up right where you left off — leads, lists, and enrichment history waiting." },
                      { d: "M13 10V3L4 14h7v7l9-11h-7z", text: "Real-time enrichment and waterfall accuracy — always running in the background." },
                    ].map(({ d, text }, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
                          </svg>
                        </div>
                        <p className="text-sm sm:text-base text-white/80 leading-[150%] self-center">{text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 mt-6 border-t border-white/20">
                    <p className="text-lg sm:text-xl text-white leading-[150%] mb-4">
                      LeadScale cut our bounce rate from 18% to under 2% in the first week.
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-semibold">MK</div>
                      <div>
                        <p className="text-base text-white">Marcus Kim</p>
                        <p className="text-sm text-white/60">Head of Growth, Velocity</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <form className="space-y-4 sm:space-y-5">
                    <div>
                      <label htmlFor="si-email" className="block text-[10px] font-mono text-white/70 mb-2 tracking-[0.5px] uppercase">Email *</label>
                      <input type="email" id="si-email" name="email" placeholder="you@company.com"
                        className="w-full px-4 py-2.5 rounded-lg bg-white/10 border-0 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 text-sm h-10" />
                    </div>
                    <PasswordInput id="si-password" label="Password" name="password" />
                    <div className="flex justify-end">
                      <button type="button" className="text-xs text-white/50 hover:text-white transition-colors">Forgot password?</button>
                    </div>
                    <button type="submit" className="w-full px-8 py-2.5 rounded-full bg-white text-[#1C1712] font-medium hover:bg-white/90 transition-colors h-10">
                      Sign in
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-white/20" />
                      <span className="text-xs text-white/40">or</span>
                      <div className="flex-1 h-px bg-white/20" />
                    </div>
                    <button type="button" className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors h-10">
                      <GoogleIcon /> Continue with Google
                    </button>
                    <p className="text-center text-sm text-white/50 pt-2">
                      No account?{" "}
                      <button type="button" onClick={() => setIsExpanded(false)} className="text-white font-medium hover:underline">Start free</button>
                    </p>
                  </form>
                </div>
              </motion.div>
            </div>

            {/* Mesh gradient — behind content */}
            <motion.div
              initial={{ opacity: 0, scale: 2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              layout={false}
              transition={{ duration: 0.15, delay: 0.05 }}
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ borderRadius: "24px" }}
            >
              <MeshGradient speed={1} colors={["#2A1F15", "#1C1410", "#332518", "#0E0A06"]}
                distortion={0.8} swirl={0.1} grainMixer={0} grainOverlay={0}
                style={{ height: "100%", width: "100%" }} />
            </motion.div>

            <motion.button onClick={() => setIsExpanded(false)}
              className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close">
              <X className="h-5 w-5" />
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Button — only rendered when NOT expanded, exact template pattern */}
      <AnimatePresence initial={false}>
        {!isExpanded && (
          <motion.div className="inline-block relative cursor-pointer" onClick={() => setIsExpanded(true)}>
            {/* This inner div carries layoutId — it morphs into the panel */}
            <motion.div
              layoutId="signin-bg"
              style={{ borderRadius: "100px" }}
              layout
              className="absolute inset-0 bg-[#1C1712] transform-gpu will-change-transform"
            />
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.15 }}
              layout={false}
              className={`relative text-[#FAF8F5] font-medium tracking-[-0.01em] select-none ${scrolled ? "text-xs px-4 py-1.5" : "text-sm px-5 py-2"}`}
            >
              Sign in
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {mounted && createPortal(panel, document.body)}
    </>
  );
}

// ─── Start Free ────────────────────────────────────────────────────────────────

export function StartFreeCTA({ scrolled }: { scrolled?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    document.body.style.overflow = isExpanded ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isExpanded]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setIsExpanded(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const panel = (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-2">
          <motion.div
            layoutId="signup-bg"
            style={{ borderRadius: "24px" }}
            layout
            className="relative flex h-full w-full overflow-hidden bg-[#A6631F] transform-gpu will-change-transform"
          >
            <div className="h-full w-full overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative py-8 z-10 min-h-full flex flex-col lg:flex-row w-full max-w-[1100px] mx-auto items-center p-6 sm:p-10 lg:p-16 gap-8 lg:gap-16"
              >
                <div className="flex-1 flex flex-col justify-center space-y-3 w-full">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white leading-none tracking-[-0.03em]">
                    Start for free
                  </h2>
                  <div className="space-y-4 pt-4">
                    {[
                      { d: "M5 13l4 4L19 7", text: "Free plan — 100 enrichments/month, no credit card required to get started." },
                      { d: "M13 10V3L4 14h7v7l9-11h-7z", text: "Waterfall enrichment across 10+ providers with <1.8% bounce rate guarantee." },
                    ].map(({ d, text }, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
                          </svg>
                        </div>
                        <p className="text-sm sm:text-base text-white/80 leading-[150%] self-center">{text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 mt-6 border-t border-white/20">
                    <p className="text-lg sm:text-xl text-white leading-[150%] mb-4">
                      We went from 400 cold emails a week to 4,000 — with better reply rates.
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-semibold">SR</div>
                      <div>
                        <p className="text-base text-white">Sara Reyes</p>
                        <p className="text-sm text-white/60">Founder, PipeStack</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <form className="space-y-4 sm:space-y-5">
                    <div>
                      <label htmlFor="sf-name" className="block text-[10px] font-mono text-white/70 mb-2 tracking-[0.5px] uppercase">Full Name *</label>
                      <input type="text" id="sf-name" name="name"
                        className="w-full px-4 py-2.5 rounded-lg bg-[#00000033] border-0 text-white focus:outline-none focus:ring-2 focus:ring-white/20 text-sm h-10" />
                    </div>
                    <div>
                      <label htmlFor="sf-email" className="block text-[10px] font-mono text-white/70 mb-2 tracking-[0.5px] uppercase">Work Email *</label>
                      <input type="email" id="sf-email" name="email"
                        className="w-full px-4 py-2.5 rounded-lg bg-[#00000033] border-0 text-white focus:outline-none focus:ring-2 focus:ring-white/20 text-sm h-10" />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label htmlFor="sf-company" className="block text-[10px] font-mono text-white/70 mb-2 tracking-[0.5px] uppercase">Company</label>
                        <input type="text" id="sf-company" name="company"
                          className="w-full px-4 py-2.5 rounded-lg bg-[#00000033] border-0 text-white focus:outline-none focus:ring-2 focus:ring-white/20 text-sm h-10" />
                      </div>
                      <div className="sm:w-32 w-full">
                        <label htmlFor="sf-size" className="block text-[10px] font-mono text-white/70 mb-2 tracking-[0.5px] uppercase">Team Size</label>
                        <select id="sf-size" name="size"
                          className="w-full px-4 py-2.5 rounded-lg bg-[#00000033] border-0 text-white focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none cursor-pointer text-sm h-10"
                          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center", backgroundSize: "1rem" }}>
                          <option value="1-10">1-10</option>
                          <option value="11-50">11-50</option>
                          <option value="51-200">51-200</option>
                          <option value="201-500">201-500</option>
                          <option value="501+">501+</option>
                        </select>
                      </div>
                    </div>
                    <PasswordInput id="sf-password" label="Password" name="password" />
                    <button type="submit" className="w-full px-8 py-2.5 rounded-full bg-white text-[#7A3F0E] font-medium hover:bg-white/90 transition-colors h-10">
                      Create account
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-white/20" />
                      <span className="text-xs text-white/40">or</span>
                      <div className="flex-1 h-px bg-white/20" />
                    </div>
                    <button type="button" className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-full bg-[#00000033] text-white text-sm font-medium hover:bg-[#00000050] transition-colors h-10">
                      <GoogleIcon /> Continue with Google
                    </button>
                    <p className="text-center text-sm text-white/50 pt-2">
                      Already have an account?{" "}
                      <button type="button" onClick={() => setIsExpanded(false)} className="text-white font-medium hover:underline">Sign in</button>
                    </p>
                  </form>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              layout={false}
              transition={{ duration: 0.15, delay: 0.05 }}
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ borderRadius: "24px" }}
            >
              <MeshGradient speed={1} colors={["#C47A2A", "#7A3F0E", "#A6631F", "#5C2E08"]}
                distortion={0.8} swirl={0.1} grainMixer={0} grainOverlay={0}
                style={{ height: "100%", width: "100%" }} />
            </motion.div>

            <motion.button onClick={() => setIsExpanded(false)}
              className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close">
              <X className="h-5 w-5" />
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Button — only rendered when NOT expanded, exact template pattern */}
      <AnimatePresence initial={false}>
        {!isExpanded && (
          <motion.div className="inline-block relative cursor-pointer" onClick={() => setIsExpanded(true)}>
            <motion.div
              layoutId="signup-bg"
              style={{ borderRadius: "100px" }}
              layout
              className="absolute inset-0 bg-[#A6631F] transform-gpu will-change-transform"
            />
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.15 }}
              layout={false}
              className={`relative text-white font-medium tracking-[-0.01em] select-none ${scrolled ? "text-xs px-4 py-1.5" : "text-sm px-5 py-2"}`}
            >
              Start free
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {mounted && createPortal(panel, document.body)}
    </>
  );
}
