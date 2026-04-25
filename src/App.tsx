import { useEffect, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Shell } from "./components/shell";
import { EmptyScreen } from "./screens/empty";
import { LiveScreen } from "./screens/live";
import { LoginScreen } from "./screens/login";
import { SignupScreen } from "./screens/signup";
import { VerifyEmailScreen } from "./screens/verify-email";
import { RunsListScreen } from "./screens/runs";
import { RunDetailScreen } from "./screens/run-detail";
import { AdminScreen } from "./screens/admin";
import { useEventStream } from "./lib/ws";
import { api, ApiError } from "./lib/api";
import { useRun } from "./lib/store";
import { useAuth } from "./lib/auth";

export function App() {
  return (
    <BrowserRouter>
      <AuthGate>
        <Routes>
          <Route path="/login" element={<PublicShell><LoginScreen /></PublicShell>} />
          <Route path="/signup" element={<PublicShell><SignupScreen /></PublicShell>} />
          <Route path="/verify-email" element={<PublicShell><VerifyEmailScreen /></PublicShell>} />
          <Route
            path="/"
            element={
              <Protected>
                <AppHome />
              </Protected>
            }
          />
          <Route
            path="/runs"
            element={
              <Protected>
                <Shell>
                  <RunsListScreen />
                </Shell>
              </Protected>
            }
          />
          <Route
            path="/runs/:id"
            element={
              <Protected>
                <Shell>
                  <RunDetailScreen />
                </Shell>
              </Protected>
            }
          />
          <Route
            path="/admin"
            element={
              <Protected>
                <Shell>
                  <AdminScreen />
                </Shell>
              </Protected>
            }
          />
        </Routes>
      </AuthGate>
    </BrowserRouter>
  );
}

function AuthGate({ children }: { children: ReactNode }) {
  const status = useAuth((s) => s.status);
  const refresh = useAuth((s) => s.refresh);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (status === "loading") {
    return (
      <div className="boot-veil mono-meta">
        <span>§ pharos · loading…</span>
      </div>
    );
  }
  return <>{children}</>;
}

function Protected({ children }: { children: ReactNode }) {
  const status = useAuth((s) => s.status);
  const user = useAuth((s) => s.user);
  const location = useLocation();

  if (status !== "authed") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (user && !user.email_verified) {
    return <Navigate to="/verify-email" replace />;
  }
  return <>{children}</>;
}

function PublicShell({ children }: { children: ReactNode }) {
  return <Shell>{children}</Shell>;
}

function AppHome() {
  useEventStream();

  const phase = useRun((s) => s.phase);
  const events = useRun((s) => s.events);
  const setSkills = useRun((s) => s.setSkills);

  useEffect(() => {
    let cancelled = false;
    api
      .skills()
      .then((skills) => {
        if (!cancelled) setSkills(skills);
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) {
          void useAuth.getState().refresh();
        }
      });
    return () => {
      cancelled = true;
    };
  }, [setSkills]);

  const runActive =
    phase === "running" || events.length > 0 || phase === "completed" || phase === "failed";

  return <Shell>{runActive ? <LiveScreen /> : <EmptyScreen />}</Shell>;
}
