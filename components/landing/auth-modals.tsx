"use client";

import { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MeshGradient } from "@paper-design/shaders-react";

// ─── Shared helpers ────────────────────────────────────────────────────────────

function PasswordInput({ id, label, name }: { id: string; label: string; name: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] font-mono font-normal text-white mb-2 tracking-[0.5px] uppercase">
        {label} *
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          id={id}
          name={name}
          className="w-full px-4 py-2.5 pr-10 rounded-lg bg-white/10 border-0 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-sm h-10"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
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

// ─── Sign In CTA ───────────────────────────────────────────────────────────────
// Amber theme — existing users

export function SignInCTA({ className }: { className?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isExpanded ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isExpanded]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsExpanded(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* ── Collapsed button ── */}
      <AnimatePresence initial={false}>
        {!isExpanded && (
          <motion.div className="inline-block relative">
            {/* This background div is what morphs */}
            <motion.div
              style={{ borderRadius: "100px" }}
              layout
              layoutId="signin-card"
              className="absolute inset-0 bg-[#A6631F] dark:bg-[#D68A3E] transform-gpu will-change-transform"
            />
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.15 }}
              layout={false}
              onClick={() => setIsExpanded(true)}
              className={`relative px-5 py-2 text-sm font-medium text-white tracking-[-0.01em] ${className ?? ""}`}
            >
              Sign in
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Expanded panel ── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              layoutId="signin-card"
              style={{ borderRadius: "24px" }}
              layout
              className="relative flex w-full max-w-md overflow-hidden bg-[#A6631F] dark:bg-[#A6631F] transform-gpu will-change-transform"
            >
              {/* Scrollable content */}
              <div className="w-full overflow-y-auto scrollbar-hide">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="relative z-10 p-8 sm:p-10"
                >
                  <h2 className="text-3xl sm:text-4xl font-medium text-white leading-none tracking-[-0.03em] mb-1">
                    Welcome back
                  </h2>
                  <p className="text-white/60 text-sm mb-8">Sign in to your LeadScale account</p>

                  <form className="space-y-4">
                    <div>
                      <label htmlFor="si-email" className="block text-[10px] font-mono font-normal text-white mb-2 tracking-[0.5px] uppercase">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="si-email"
                        name="email"
                        placeholder="you@company.com"
                        className="w-full px-4 py-2.5 rounded-lg bg-black/20 border-0 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-sm h-10"
                      />
                    </div>

                    <PasswordInput id="si-password" label="Password" name="password" />

                    <div className="flex justify-end">
                      <button type="button" className="text-xs text-white/60 hover:text-white transition-colors">
                        Forgot password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full px-8 py-2.5 rounded-full bg-white text-[#7A4510] font-medium hover:bg-white/90 active:scale-[0.98] transition-all tracking-[-0.02em] h-10"
                    >
                      Sign in
                    </button>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-white/20" />
                      <span className="text-xs text-white/40">or</span>
                      <div className="flex-1 h-px bg-white/20" />
                    </div>

                    <button
                      type="button"
                      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-full bg-black/20 border border-white/20 text-white text-sm font-medium hover:bg-black/30 active:scale-[0.98] transition-all h-10"
                    >
                      <GoogleIcon />
                      Continue with Google
                    </button>
                  </form>

                  <p className="text-center text-sm text-white/50 mt-6">
                    No account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsExpanded(false)}
                      className="text-white font-medium hover:underline"
                    >
                      Start free
                    </button>
                  </p>
                </motion.div>
              </div>

              {/* Animated mesh gradient background */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                layout={false}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ borderRadius: "24px" }}
              >
                <MeshGradient
                  speed={1}
                  colors={["#A6631F", "#7A3F0E", "#C47A2A", "#5C3010"]}
                  distortion={0.8}
                  swirl={0.1}
                  grainMixer={0}
                  grainOverlay={0}
                  className="inset-0 sticky top-0"
                  style={{ height: "100%", width: "100%" }}
                />
              </motion.div>

              {/* Close button */}
              <motion.button
                onClick={() => setIsExpanded(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center text-white bg-black/20 hover:bg-black/30 active:scale-95 rounded-full transition-all"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Start Free CTA ────────────────────────────────────────────────────────────
// Green theme — new users

export function StartFreeCTA({ className }: { className?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isExpanded ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isExpanded]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsExpanded(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* ── Collapsed button ── */}
      <AnimatePresence initial={false}>
        {!isExpanded && (
          <motion.div className="inline-block relative">
            {/* This background div is what morphs */}
            <motion.div
              style={{ borderRadius: "100px" }}
              layout
              layoutId="signup-card"
              className="absolute inset-0 bg-[#3D7A4E] transform-gpu will-change-transform"
            />
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.15 }}
              layout={false}
              onClick={() => setIsExpanded(true)}
              className={`relative px-5 py-2 text-sm font-medium text-white tracking-[-0.01em] ${className ?? ""}`}
            >
              Start free
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Expanded panel ── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              layoutId="signup-card"
              style={{ borderRadius: "24px" }}
              layout
              className="relative flex w-full max-w-md overflow-hidden bg-[#3D7A4E] transform-gpu will-change-transform"
            >
              {/* Scrollable content */}
              <div className="w-full overflow-y-auto scrollbar-hide">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="relative z-10 p-8 sm:p-10"
                >
                  <h2 className="text-3xl sm:text-4xl font-medium text-white leading-none tracking-[-0.03em] mb-1">
                    Start for free
                  </h2>
                  <p className="text-white/60 text-sm mb-8">Create your LeadScale account — no credit card needed</p>

                  <form className="space-y-4">
                    <div>
                      <label htmlFor="sf-name" className="block text-[10px] font-mono font-normal text-white mb-2 tracking-[0.5px] uppercase">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="sf-name"
                        name="name"
                        placeholder="Your name"
                        className="w-full px-4 py-2.5 rounded-lg bg-black/20 border-0 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-sm h-10"
                      />
                    </div>

                    <div>
                      <label htmlFor="sf-email" className="block text-[10px] font-mono font-normal text-white mb-2 tracking-[0.5px] uppercase">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        id="sf-email"
                        name="email"
                        placeholder="you@company.com"
                        className="w-full px-4 py-2.5 rounded-lg bg-black/20 border-0 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-sm h-10"
                      />
                    </div>

                    <PasswordInput id="sf-password" label="Password" name="password" />

                    <p className="text-xs text-white/40 leading-relaxed">
                      By signing up you agree to our{" "}
                      <a href="#" className="text-white/70 hover:text-white underline">Terms</a>
                      {" "}and{" "}
                      <a href="#" className="text-white/70 hover:text-white underline">Privacy Policy</a>.
                    </p>

                    <button
                      type="submit"
                      className="w-full px-8 py-2.5 rounded-full bg-white text-[#1E4D2F] font-medium hover:bg-white/90 active:scale-[0.98] transition-all tracking-[-0.02em] h-10"
                    >
                      Create account
                    </button>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-white/20" />
                      <span className="text-xs text-white/40">or</span>
                      <div className="flex-1 h-px bg-white/20" />
                    </div>

                    <button
                      type="button"
                      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-full bg-black/20 border border-white/20 text-white text-sm font-medium hover:bg-black/30 active:scale-[0.98] transition-all h-10"
                    >
                      <GoogleIcon />
                      Continue with Google
                    </button>
                  </form>

                  <p className="text-center text-sm text-white/50 mt-6">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsExpanded(false)}
                      className="text-white font-medium hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </motion.div>
              </div>

              {/* Animated mesh gradient background */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                layout={false}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ borderRadius: "24px" }}
              >
                <MeshGradient
                  speed={1}
                  colors={["#3D7A4E", "#1E4D2F", "#2E6040", "#163D25"]}
                  distortion={0.8}
                  swirl={0.1}
                  grainMixer={0}
                  grainOverlay={0}
                  className="inset-0 sticky top-0"
                  style={{ height: "100%", width: "100%" }}
                />
              </motion.div>

              {/* Close button */}
              <motion.button
                onClick={() => setIsExpanded(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center text-white bg-black/20 hover:bg-black/30 active:scale-95 rounded-full transition-all"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
