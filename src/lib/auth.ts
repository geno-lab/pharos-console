import { create } from "zustand";
import type { AuthUser } from "./api";
import { api, ApiError } from "./api";

type AuthStatus = "loading" | "authed" | "anon";

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;

  refresh: () => Promise<void>;
  setUser: (user: AuthUser) => void;
  clear: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  status: "loading",
  user: null,

  refresh: async () => {
    try {
      const user = await api.me();
      set({ status: "authed", user });
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        set({ status: "anon", user: null });
      } else {
        // Network error or 5xx — treat as unknown but don't kick the user out;
        // they may already have a valid cookie that the server can't verify
        // right now (e.g. transient DB issue).
        set({ status: "anon", user: null });
      }
    }
  },

  setUser: (user) => set({ status: "authed", user }),
  clear: () => set({ status: "anon", user: null }),
}));
