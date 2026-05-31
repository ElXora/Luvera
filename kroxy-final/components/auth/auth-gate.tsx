"use client";

import { useState, useEffect } from "react";
import { LoginScreen } from "./login-screen";
import { RegisterScreen } from "./register-screen";

export type AuthUser = {
  email: string;
  firstName: string;
  lastName: string;
};

function getUsers(): Record<string, { firstName: string; lastName: string; password: string }> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("kroxy_users") || "{}"); } catch { return {}; }
}
function saveUsers(u: ReturnType<typeof getUsers>) {
  localStorage.setItem("kroxy_users", JSON.stringify(u));
}
export function getSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("kroxy_session") || "null"); } catch { return null; }
}
function setSession(u: AuthUser) {
  localStorage.setItem("kroxy_session", JSON.stringify(u));
}
export function clearSession() {
  localStorage.removeItem("kroxy_session");
}

interface AuthGateProps {
  children: (user: AuthUser, onLogout: () => void) => React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [page, setPage] = useState<"login" | "register">("login");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (s) {
      const users = getUsers();
      if (users[s.email]) setUser(s);
      else clearSession();
    }
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  if (user) {
    return <>{children(user, () => { clearSession(); setUser(null); setPage("login"); })}</>;
  }

  function handleLogin(email: string, password: string): string | null {
    const users = getUsers();
    if (!users[email]) return "No account found with that email.";
    if (users[email].password !== btoa(password)) return "Incorrect password.";
    const u: AuthUser = { email, firstName: users[email].firstName, lastName: users[email].lastName };
    setSession(u);
    setUser(u);
    return null;
  }

  function handleRegister(firstName: string, lastName: string, email: string, password: string): string | null {
    if (!email.includes("@")) return "Enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    const users = getUsers();
    if (users[email]) return "An account with this email already exists.";
    users[email] = { firstName, lastName, password: btoa(password) };
    saveUsers(users);
    return null;
  }

  return page === "login"
    ? <LoginScreen onLogin={handleLogin} onGoRegister={() => setPage("register")} />
    : <RegisterScreen onRegister={handleRegister} onGoLogin={() => setPage("login")} />;
}
