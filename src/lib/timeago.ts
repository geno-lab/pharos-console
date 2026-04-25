import { useEffect, useState } from "react";

export function useTimeAgo(timestamp?: number, tickMs = 1000): string | null {
  const [, force] = useState(0);
  useEffect(() => {
    if (timestamp == null) return;
    const id = window.setInterval(() => force((n) => n + 1), tickMs);
    return () => window.clearInterval(id);
  }, [timestamp, tickMs]);

  if (timestamp == null) return null;
  const elapsed = Math.max(0, Date.now() - timestamp);
  if (elapsed < 1000) return "just now";
  const s = Math.floor(elapsed / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s ago`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m ago`;
}
