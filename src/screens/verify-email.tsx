import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";

export function VerifyEmailScreen() {
  const location = useLocation();
  const initialEmail = (location.state as { email?: string } | null)?.email ?? "";
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const navigate = useNavigate();

  const [email, setEmail] = useState(initialEmail || user?.email || "");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  // Don't park already-verified users on the verify form. Hook calls are above
  // this guard so the hook-order invariant holds across re-renders.
  if (user?.email_verified) {
    return <Navigate to="/" replace />;
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setInfo(null);
    try {
      const next = await api.verifyEmail(email, code);
      setUser(next);
      navigate("/", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 410) setError("code expired — request a new one");
        else setError("invalid code");
      } else {
        setError(String(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    if (resending || !email) return;
    setResending(true);
    setError(null);
    setInfo(null);
    try {
      await api.resendVerification(email);
      setInfo("if the email is registered and unverified, a new code is on its way");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="canvas canvas-auth">
      <header className="auth-header">
        <h1 className="masthead-title">§ verify</h1>
        <p className="masthead-sub">
          enter the 6-digit code we emailed you. didn't arrive within a minute?
          hit "resend" below.
        </p>
      </header>

      <form className="auth-form" onSubmit={submit}>
        <label className="auth-field">
          <span className="caps-label">email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            readOnly={!!initialEmail}
          />
        </label>

        <label className="auth-field">
          <span className="caps-label">code</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            autoComplete="one-time-code"
            autoFocus
            maxLength={6}
            required
          />
        </label>

        {error && <div className="error">{error}</div>}
        {info && <div className="mono-meta">{info}</div>}

        <div className="submit-row">
          <button type="button" className="auth-link" onClick={resend} disabled={resending || !email}>
            {resending ? "sending…" : "resend code"}
          </button>
          <button className="btn" type="submit" disabled={submitting || code.length !== 6}>
            {submitting ? "verifying…" : "verify →"}
          </button>
        </div>
      </form>
    </div>
  );
}
