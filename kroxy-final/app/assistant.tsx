"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { AuthGate, AuthUser } from "@/components/auth/auth-gate";
import { KroxyLogo } from "@/components/auth/kroxy-logo";

export const Assistant = () => {
  return (
    <AuthGate>
      {(user, onLogout) => (
        <ChatApp user={user} onLogout={onLogout} />
      )}
    </AuthGate>
  );
};

function ChatApp({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const runtime = useChatRuntime({ api: "/api/chat" });
  const initials = (user.firstName[0] + (user.lastName[0] || "")).toUpperCase();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="grid h-dvh grid-cols-[240px_1fr]">

        {/* ── Sidebar ── */}
        <div className="flex flex-col border-r bg-sidebar overflow-hidden">
          {/* Brand */}
          <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
            <KroxyLogo size={30} />
          </div>

          {/* Thread list */}
          <div className="flex-1 overflow-y-auto px-2 py-3">
            <ThreadList />
          </div>

          {/* User footer */}
          <div className="border-t border-sidebar-border p-3">
            <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #5b21b6)" }}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <button
                onClick={onLogout}
                title="Sign out"
                className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors flex-shrink-0"
              >
                <LogoutIcon />
              </button>
            </div>
          </div>
        </div>

        {/* ── Chat area ── */}
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
  </svg>
);
