import type { ReactNode } from "react";
import { useRun } from "../lib/store";
import { useTimeAgo } from "../lib/timeago";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  const phase = useRun((s) => s.phase);
  const connected = useRun((s) => s.connected);
  const lastEventAt = useRun((s) => s.lastEventAt);
  const ago = useTimeAgo(lastEventAt);
  const status = useAuth((s) => s.status);
  const user = useAuth((s) => s.user);
  const clear = useAuth((s) => s.clear);

  const stale = lastEventAt != null && Date.now() - lastEventAt > 30_000;
  const dotClass =
    phase === "running"
      ? stale
        ? "dot dot-stale"
        : "dot dot-live"
      : phase === "failed"
        ? "dot dot-fail"
        : phase === "completed"
          ? "dot dot-done"
          : "dot dot-idle";

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      clear();
      window.location.href = "/login";
    }
  };

  return (
    <div className="shell">
      <header className="top-rail">
        <span className="brand">
          <span className="sign">§</span>
          <span className="brand-name">pharos</span>
        </span>
        <span className="mono-meta">v0.4</span>
        <span className="status-chip" title={connected ? "ws connected" : "reconnecting"}>
          <span className={dotClass} />
          <span>{phase}</span>
          {ago && phase === "running" && <span className="status-ago"> · {ago}</span>}
        </span>
        <span className="spacer" />
        {status === "authed" && user && (
          <span className="user-chip">
            <span className="mono-meta">{user.email}</span>
            <button className="auth-link" onClick={logout}>
              logout
            </button>
          </span>
        )}
      </header>
      <main>{children}</main>
    </div>
  );
}
