"use client";

import { useState } from "react";
import { KroxyLogo } from "./kroxy-logo";

interface Props {
  onLogin: (email: string, password: string) => string | null;
  onGoRegister: () => void;
}

export function LoginScreen({ onLogin, onGoRegister }: Props) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass]  = useState(false);
  const [error, setError]        = useState("");
  const [loading, setLoading]    = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const err = onLogin(email, password);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <div className="kroxy-auth-bg">
      <div className="kroxy-orb kroxy-orb-1" />
      <div className="kroxy-orb kroxy-orb-2" />
      <div className="kroxy-orb kroxy-orb-3" />

      <div className="kroxy-card" style={{ margin: "0 16px" }}>
        <div className="flex flex-col items-center mb-7">
          <KroxyLogo size={48} className="mb-3" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,.4)" }}>Sign in to continue to Kroxy AI</p>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-lg text-sm" style={{ background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5" }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold" style={{ color: "rgba(255,255,255,.5)" }}>Email</label>
            <input
              className="kroxy-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold" style={{ color: "rgba(255,255,255,.5)" }}>Password</label>
            <div className="relative">
              <input
                className="kroxy-input pr-10"
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity"
                style={{ color: showPass ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.3)" }}
              >
                {showPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button type="submit" className="kroxy-btn mt-1" disabled={loading}>
            {loading ? <Spinner /> : null}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,.08)" }} />
          <span className="text-xs" style={{ color: "rgba(255,255,255,.25)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,.08)" }} />
        </div>

        <p className="text-center text-sm" style={{ color: "rgba(255,255,255,.4)" }}>
          Don't have an account?{" "}
          <button onClick={onGoRegister} className="font-semibold transition-colors" style={{ color: "#c4b5fd" }}>
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}

const EyeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>;
const Spinner = () => <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} />;
