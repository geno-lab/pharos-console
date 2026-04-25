import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";

export function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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
      const user = await api.signup(email, password);
      setUser(user);
      navigate("/verify-email", { replace: true, state: { email: user.email } });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) setError("email already registered");
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
      </form>
    </div>
  );
}
