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
    const attempt = () => api.me();
    try {
      const user = await attempt();
      set({ status: "authed", user });
      return;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        set({ status: "anon", user: null });
        return;
      }
      // Network or 5xx: try once more after a beat. A transient backend hiccup
      // shouldn't kick everyone to /login.
      await new Promise((r) => setTimeout(r, 1500));
    }
    try {
      const user = await attempt();
      set({ status: "authed", user });
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        set({ status: "anon", user: null });
      } else {
        // Still failing. Fall back to anon so the user sees /login and can
        // re-authenticate when the backend recovers, rather than spinning
        // on a forever-loading screen.
        set({ status: "anon", user: null });
      }
    }
  },

  setUser: (user) => set({ status: "authed", user }),
  clear: () => set({ status: "anon", user: null }),
}));
