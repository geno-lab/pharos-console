import type { RunStatus, SkillInfo } from "../bindings";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";
const WS_URL = import.meta.env.VITE_WS_URL ?? "/ws";

export function wsUrl(): string {
  if (/^wss?:\/\//.test(WS_URL)) return WS_URL;
  const proto = location.protocol === "https:" ? "wss" : "ws";
  const path = WS_URL.startsWith("/") ? WS_URL : `/${WS_URL}`;
  return `${proto}://${location.host}${path}`;
}

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    headers: { "content-type": "application/json" },
    ...init,
  });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json() as Promise<T>;
}

export const api = {
  skills: () => json<SkillInfo[]>("/skills"),
  status: () => json<RunStatus>("/status"),
  run: (task: string, supervisor?: string, commander?: string) =>
    json<{ status: string } | { error: string }>("/run", {
      method: "POST",
      body: JSON.stringify({ task, supervisor, commander }),
    }),
};
