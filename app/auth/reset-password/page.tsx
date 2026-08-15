"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => { window.location.href = "/dashboard"; }, 2000);
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#0E0A06] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-white tracking-[-0.03em]">Set new password</h1>
          <p className="text-sm text-white/50 mt-1">Choose a strong password for your account.</p>
        </div>

        {success ? (
          <div className="text-green-300 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
            Password updated. Redirecting to dashboard…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="new-password" className="block text-[10px] font-mono text-white/60 mb-2 tracking-[0.5px] uppercase">
                New password *
              </label>
              <input
                type="password"
                id="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20 text-sm h-10"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-[10px] font-mono text-white/60 mb-2 tracking-[0.5px] uppercase">
                Confirm password *
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20 text-sm h-10"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full px-8 py-2.5 rounded-full bg-[#A6631F] text-white font-medium hover:bg-[#B8722A] transition-colors h-10 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Update password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
