import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const setUser = useAuth((s) => s.setUser);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? "/";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const user = await api.login(email, password);
      setUser(user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? "invalid email or password" : err.body || err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="canvas canvas-auth">
      <header className="auth-header">
        <h1 className="masthead-title">§ enter</h1>
        <p className="masthead-sub">log in to pharos</p>
      </header>

      <form className="auth-form" onSubmit={submit}>
        <label className="auth-field">
          <span className="caps-label">email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
            required
          />
        </label>

        <label className="auth-field">
          <span className="caps-label">password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <div className="error">{error}</div>}

        <div className="submit-row">
          <Link to="/signup" className="auth-link">
            no account? sign up →
          </Link>
          <button className="btn" type="submit" disabled={submitting || !email || !password}>
            {submitting ? "logging in…" : "log in →"}
          </button>
        </div>
      </form>
    </div>
  );
}
