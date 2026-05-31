"use client";

import { useState } from "react";
import { KroxyLogo } from "./kroxy-logo";

interface Props {
  onRegister: (firstName: string, lastName: string, email: string, password: string) => string | null;
  onGoLogin: () => void;
}

function strengthScore(val: string) {
  let s = 0;
  if (val.length >= 6) s++;
  if (val.length >= 10) s++;
  if (/[A-Z]/.test(val)) s++;
  if (/[0-9]/.test(val)) s++;
  if (/[^A-Za-z0-9]/.test(val)) s++;
  return s;
}
const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
const STRENGTH_COLORS = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];
const STRENGTH_PCTS   = ["0%", "20%", "40%", "65%", "85%", "100%"];

export function RegisterScreen({ onRegister, onGoLogin }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const score = strengthScore(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!firstName || !lastName || !email || !password || !confirm) { setError("Please fill in all fields."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const err = onRegister(firstName, lastName, email, password);
    setLoading(false);
    if (err) { setError(err); return; }
    setSuccess("Account created! Redirecting to login...");
    await new Promise(r => setTimeout(r, 1200));
    onGoLogin();
  }

  return (
    <div className="kroxy-auth-bg">
      <div className="kroxy-orb kroxy-orb-1" style={{ background: "#7c3aed" }} />
      <div className="kroxy-orb kroxy-orb-2" style={{ background: "#8b5cf6" }} />
      <div className="kroxy-orb kroxy-orb-3" style={{ background: "#6d28d9" }} />

      <div className="kroxy-card" style={{ margin: "0 16px", maxHeight: "95vh", overflowY: "auto" }}>
        <div className="flex flex-col items-center mb-6">
          <KroxyLogo size={44} className="mb-3" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Create account</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,.4)" }}>Join Kroxy AI — it&apos;s free</p>
        </div>

        {error && (
          <div className="mb-3 px-3 py-2.5 rounded-lg text-sm" style={{ background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5" }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="mb-3 px-3 py-2.5 rounded-lg text-sm" style={{ background: "rgba(34,197,94,.12)", border: "1px solid rgba(34,197,94,.3)", color: "#86efac" }}>
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: "rgba(255,255,255,.5)" }}>First Name</label>
              <input className="kroxy-input" type="text" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} autoComplete="given-name" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: "rgba(255,255,255,.5)" }}>Last Name</label>
              <input className="kroxy-input" type="text" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} autoComplete="family-name" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold" style={{ color: "rgba(255,255,255,.5)" }}>Email</label>
            <input className="kroxy-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold" style={{ color: "rgba(255,255,255,.5)" }}>Password</label>
            <div className="relative">
              <input className="kroxy-input pr-10" type={showPass ? "text" : "password"} placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
              <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: showPass ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.3)" }}>
                {showPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {password && (
              <>
                <div className="kroxy-strength-bar">
                  <div className="kroxy-strength-fill" style={{ width: STRENGTH_PCTS[score], background: STRENGTH_COLORS[score] }} />
                </div>
                <span className="text-xs font-semibold mt-0.5" style={{ color: STRENGTH_COLORS[score] }}>{STRENGTH_LABELS[score]}</span>
              </>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold" style={{ color: "rgba(255,255,255,.5)" }}>Confirm Password</label>
            <div className="relative">
              <input className="kroxy-input pr-10" type={showConf ? "text" : "password"} placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" />
              <button type="button" onClick={() => setShowConf(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: showConf ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.3)" }}>
                {showConf ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button type="submit" className="kroxy-btn mt-1" disabled={loading}>
            {loading ? <Spinner /> : null}
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,.08)" }} />
          <span className="text-xs" style={{ color: "rgba(255,255,255,.25)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,.08)" }} />
        </div>

        <p className="text-center text-sm" style={{ color: "rgba(255,255,255,.4)" }}>
          Already have an account?{" "}
          <button onClick={onGoLogin} className="font-semibold transition-colors" style={{ color: "#c4b5fd" }}>Sign in</button>
        </p>
      </div>
    </div>
  );
}

const EyeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>;
const Spinner = () => <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} />;
