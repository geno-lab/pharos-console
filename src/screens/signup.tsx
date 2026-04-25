import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";

export function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const setUser = useAuth((s) => s.setUser);
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (password !== confirm) {
      setError("passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("password must be at least 8 characters");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const user = await api.signup(email, password, inviteCode.trim() || undefined);
      setUser(user);
      navigate("/verify-email", { replace: true, state: { email: user.email } });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) setError("email already registered");
        else if (err.status === 403) setError("invite code is invalid, expired, or already used");
        else if (err.status === 400 && err.body?.includes("invite")) setError("invite code required");
        else setError(err.body || err.message);
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
        <h1 className="masthead-title">§ join</h1>
        <p className="masthead-sub">create a pharos account</p>
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
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        <label className="auth-field">
          <span className="caps-label">confirm password</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        <label className="auth-field">
          <span className="caps-label">invite code</span>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            autoComplete="off"
            placeholder="ask the admin"
          />
        </label>

        {error && <div className="error">{error}</div>}

        <div className="submit-row">
          <Link to="/login" className="auth-link">
            already have one? log in →
          </Link>
          <button
            className="btn"
            type="submit"
            disabled={submitting || !email || !password || !confirm}
          >
            {submitting ? "creating…" : "create account →"}
          </button>
        </div>

        <div className="oauth-divider">
          <span>or</span>
        </div>

        <a className="btn btn-oauth" href="/api/auth/oauth/github/start">
          ⊕ continue with github
        </a>
      </form>
    </div>
  );
}
