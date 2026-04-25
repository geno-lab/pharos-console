import type { RunStatus, SkillInfo } from "../bindings";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";
const WS_URL = import.meta.env.VITE_WS_URL ?? "/ws";

export interface AuthUser {
  id: string;
  email: string;
  email_verified: boolean;
}

export class ApiError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string) {
    super(`${status}: ${body}`);
    this.status = status;
    this.body = body;
  }
}

export function wsUrl(): string {
  if (/^wss?:\/\//.test(WS_URL)) return WS_URL;
  const proto = location.protocol === "https:" ? "wss" : "ws";
  const path = WS_URL.startsWith("/") ? WS_URL : `/${WS_URL}`;
  return `${proto}://${location.host}${path}`;
}

async function send<T>(
  path: string,
  init?: RequestInit,
  parse: "json" | "none" = "json",
): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "content-type": "application/json" },
    ...init,
  });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new ApiError(r.status, body);
  }
  if (parse === "none" || r.status === 204) return undefined as T;
  return r.json() as Promise<T>;
}

export const api = {
  skills: () => send<SkillInfo[]>("/skills"),
  status: () => send<RunStatus>("/status"),
  run: (task: string, supervisor?: string, commander?: string) =>
    send<{ status: string }>("/run", {
      method: "POST",
      body: JSON.stringify({ task, supervisor, commander }),
    }),
  cancel: () => send<{ status: string }>("/run", { method: "DELETE" }),

  signup: (email: string, password: string) =>
    send<AuthUser>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    send<AuthUser>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () =>
    send<void>("/auth/logout", { method: "POST" }, "none"),
  me: () => send<AuthUser>("/auth/me"),
  verifyEmail: (email: string, code: string) =>
    send<AuthUser>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    }),
  resendVerification: (email: string) =>
    send<void>(
      "/auth/resend-verification",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
      "none",
    ),
};
