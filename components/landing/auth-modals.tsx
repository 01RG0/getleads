"use client";

import { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ModalType = "signin" | "signup" | null;

interface AuthModalsProps {
  open: ModalType;
  onClose: () => void;
}

// Animated mesh gradient blob background — no external shader dep needed
function MeshBackground({ colors }: { colors: [string, string, string, string] }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: "inherit" }}>
      <div
        className="absolute inset-0"
        style={{ background: colors[0] }}
      />
      {/* Animated blobs */}
      <div
        className="absolute rounded-full opacity-60 blur-3xl animate-mesh-1"
        style={{
          width: "60%",
          height: "60%",
          top: "-10%",
          right: "-10%",
          background: colors[1],
        }}
      />
      <div
        className="absolute rounded-full opacity-50 blur-3xl animate-mesh-2"
        style={{
          width: "50%",
          height: "50%",
          bottom: "-5%",
          left: "-5%",
          background: colors[2],
        }}
      />
      <div
        className="absolute rounded-full opacity-40 blur-2xl animate-mesh-3"
        style={{
          width: "40%",
          height: "40%",
          top: "30%",
          left: "30%",
          background: colors[3],
        }}
      />
    </div>
  );
}

function PasswordInput({ id, label, name }: { id: string; label: string; name: string; inputClass?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] font-mono font-normal text-white mb-2 tracking-[0.5px] uppercase">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          id={id}
          name={name}
          className="w-full px-4 py-2.5 pr-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm h-10"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ─── Sign In Modal ─────────────────────────────────────────────────────────────
function SignInPanel({ onClose, onSwitchToSignUp }: { onClose: () => void; onSwitchToSignUp: () => void }) {
  return (
    <motion.div
      layoutId="signin-card"
      style={{ borderRadius: "24px" }}
      layout
      className="relative flex items-center justify-center w-full max-w-md overflow-hidden transform-gpu will-change-transform"
    >
      {/* Amber mesh background */}
      <MeshBackground colors={["#7A4510", "#A6631F", "#C47A2A", "#8B4F15"]} />

      <div className="relative z-10 w-full p-8 sm:p-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-3xl font-medium text-white leading-none tracking-[-0.03em] mb-2">Welcome back</h2>
          <p className="text-white/60 text-sm mb-8">Sign in to your LeadScale account</p>

          <form className="space-y-4">
            <div>
              <label htmlFor="signin-email" className="block text-[10px] font-mono font-normal text-white mb-2 tracking-[0.5px] uppercase">
                Email
              </label>
              <input
                type="email"
                id="signin-email"
                name="email"
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm h-10"
                placeholder="you@company.com"
              />
            </div>

            <PasswordInput id="signin-password" label="Password" name="password" />

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

            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-xs text-white/40">or</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 active:scale-[0.98] transition-all h-10"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          <p className="text-center text-sm text-white/50 mt-6">
            No account yet?{" "}
            <button onClick={onSwitchToSignUp} className="text-white hover:underline font-medium">
              Start free
            </button>
          </p>
        </motion.div>
      </div>

      <motion.button
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center text-white bg-white/10 hover:bg-white/20 active:scale-95 rounded-full transition-all"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
}

// ─── Sign Up Modal ─────────────────────────────────────────────────────────────
function SignUpPanel({ onClose, onSwitchToSignIn }: { onClose: () => void; onSwitchToSignIn: () => void }) {
  return (
    <motion.div
      layoutId="signup-card"
      style={{ borderRadius: "24px" }}
      layout
      className="relative flex items-center justify-center w-full max-w-md overflow-hidden transform-gpu will-change-transform"
    >
      {/* Green mesh background */}
      <MeshBackground colors={["#1E4D2F", "#3D7A4E", "#2E6040", "#1A3D25"]} />

      <div className="relative z-10 w-full p-8 sm:p-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-3xl font-medium text-white leading-none tracking-[-0.03em] mb-2">Start for free</h2>
          <p className="text-white/60 text-sm mb-8">Create your LeadScale account</p>

          <form className="space-y-4">
            <div>
              <label htmlFor="signup-name" className="block text-[10px] font-mono font-normal text-white mb-2 tracking-[0.5px] uppercase">
                Full Name
              </label>
              <input
                type="text"
                id="signup-name"
                name="name"
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm h-10"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-[10px] font-mono font-normal text-white mb-2 tracking-[0.5px] uppercase">
                Work Email
              </label>
              <input
                type="email"
                id="signup-email"
                name="email"
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm h-10"
                placeholder="you@company.com"
              />
            </div>

            <PasswordInput id="signup-password" label="Password" name="password" />

            <p className="text-xs text-white/40 leading-relaxed">
              By creating an account you agree to our{" "}
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

            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-xs text-white/40">or</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 active:scale-[0.98] transition-all h-10"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          <p className="text-center text-sm text-white/50 mt-6">
            Already have an account?{" "}
            <button onClick={onSwitchToSignIn} className="text-white hover:underline font-medium">
              Sign in
            </button>
          </p>
        </motion.div>
      </div>

      <motion.button
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center text-white bg-white/10 hover:bg-white/20 active:scale-95 rounded-full transition-all"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
}

// ─── Google Icon SVG ────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.67 3.67 0 0 1-1.59 2.41v2h2.57c1.5-1.38 2.4-3.41 2.4-5.87z" fill="#4285F4" />
      <path d="M8 16c2.16 0 3.97-.71 5.3-1.93l-2.58-2a4.8 4.8 0 0 1-7.18-2.52H.96v2.07A8 8 0 0 0 8 16z" fill="#34A853" />
      <path d="M3.54 9.55A4.8 4.8 0 0 1 3.3 8c0-.54.09-1.07.24-1.55V4.38H.96A8 8 0 0 0 0 8c0 1.29.31 2.51.96 3.62l2.58-2.07z" fill="#FBBC05" />
      <path d="M8 3.2a4.33 4.33 0 0 1 3.07 1.2l2.3-2.3A7.7 7.7 0 0 0 8 0 8 8 0 0 0 .96 4.38l2.58 2.07A4.77 4.77 0 0 1 8 3.2z" fill="#EA4335" />
    </svg>
  );
}

// ─── Main Export ────────────────────────────────────────────────────────────────
export function AuthModals({ open, onClose }: AuthModalsProps) {
  const [active, setActive] = useState<ModalType>(open);

  // Sync external open prop
  useEffect(() => {
    setActive(open);
  }, [open]);

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [active]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSwitch = (to: ModalType) => setActive(to);

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
              {active === "signin" && (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, scale: 0.92, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="w-full max-w-md"
                >
                  <SignInPanel
                    onClose={onClose}
                    onSwitchToSignUp={() => handleSwitch("signup")}
                  />
                </motion.div>
              )}

              {active === "signup" && (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, scale: 0.92, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="w-full max-w-md"
                >
                  <SignUpPanel
                    onClose={onClose}
                    onSwitchToSignIn={() => handleSwitch("signin")}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Trigger Buttons (drop-in replacements for nav) ────────────────────────────
export function SignInButton({
  className,
  children = "Sign in",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState<ModalType>(null);
  return (
    <>
      <motion.button
        layoutId="signin-card"
        onClick={() => setOpen("signin")}
        whileTap={{ scale: 0.97 }}
        className={className}
      >
        {children}
      </motion.button>
      <AuthModals open={open} onClose={() => setOpen(null)} />
    </>
  );
}

export function StartFreeButton({
  className,
  children = "Start free",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState<ModalType>(null);
  return (
    <>
      <motion.button
        layoutId="signup-card"
        onClick={() => setOpen("signup")}
        whileTap={{ scale: 0.97 }}
        className={className}
      >
        {children}
      </motion.button>
      <AuthModals open={open} onClose={() => setOpen(null)} />
    </>
  );
}
