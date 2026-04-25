import type { ReactNode } from "react";
import { useRun } from "../lib/store";
import { useTimeAgo } from "../lib/timeago";

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  const phase = useRun((s) => s.phase);
  const connected = useRun((s) => s.connected);
  const lastEventAt = useRun((s) => s.lastEventAt);
  const ago = useTimeAgo(lastEventAt);

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
      </header>
      <main>{children}</main>
    </div>
  );
}
