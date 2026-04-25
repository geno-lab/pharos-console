import type { RunStatus, SkillInfo } from "../bindings";
import type { RunSummary } from "../bindings/RunSummary";
import type { RunDetail } from "../bindings/RunDetail";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";
const WS_URL = import.meta.env.VITE_WS_URL ?? "/ws";

export interface AuthUser {
  id: string;
  email: string;
  email_verified: boolean;
  is_admin: boolean;
}

export interface InviteCode {
  code: string;
  created_at: number;
  used_at: number | null;
  used_by_email: string | null;
  note: string | null;
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
    send<{ status: string; run_id?: string; position?: number }>("/run", {
      method: "POST",
      body: JSON.stringify({ task, supervisor, commander }),
    }),
  cancel: () => send<{ status: string }>("/run", { method: "DELETE" }),

  signup: (email: string, password: string, invite_code?: string) =>
    send<AuthUser>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, invite_code }),
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

  runs: {
    list: (limit = 50) => send<RunSummary[]>(`/runs?limit=${limit}`),
    detail: (id: string) => send<RunDetail>(`/runs/${encodeURIComponent(id)}`),
  },

  admin: {
    listInvites: () => send<InviteCode[]>("/admin/invites"),
    createInvite: (note?: string) =>
      send<{ code: string }>("/admin/invites", {
        method: "POST",
        body: JSON.stringify({ note }),
      }),
  },
};
