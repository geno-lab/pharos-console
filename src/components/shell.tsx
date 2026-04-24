import type { ReactNode } from "react";
import { useRun } from "../lib/store";

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  const phase = useRun((s) => s.phase);
  const connected = useRun((s) => s.connected);

  return (
    <div className="shell">
      <header className="top-rail">
        <span className="brand">
          <span className="sign">§</span>
          <span className="brand-name">pharos</span>
        </span>
        <span className="mono-meta">
          v0.4 · {connected ? "connected" : "reconnecting"} · {phase}
        </span>
        <span className="spacer" />
      </header>
      <main>{children}</main>
    </div>
  );
}
