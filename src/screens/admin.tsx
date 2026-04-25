import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import type { InviteCode } from "../lib/api";

export function AdminScreen() {
  const [invites, setInvites] = useState<InviteCode[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [note, setNote] = useState("");

  const load = async () => {
    try {
      const rows = await api.admin.listInvites();
      setInvites(rows);
    } catch (e) {
      setError(e instanceof ApiError ? e.body || e.message : String(e));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async () => {
    if (creating) return;
    setCreating(true);
    setError(null);
    try {
      await api.admin.createInvite(note.trim() || undefined);
      setNote("");
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.body || e.message : String(e));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="canvas canvas-runs">
      <header className="runs-header">
        <h1 className="masthead-title">§ admin</h1>
        <p className="masthead-sub">invite codes</p>
        <Link to="/" className="auth-link">
          ← home
        </Link>
      </header>

      <section className="auth-form">
        <label className="auth-field">
          <span className="caps-label">note (optional)</span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. for alice"
          />
        </label>
        <div className="submit-row">
          <span className="mono-meta">12-char single-use code</span>
          <button className="btn" onClick={create} disabled={creating}>
            {creating ? "generating…" : "+ new invite"}
          </button>
        </div>
      </section>

      {error && <div className="error">{error}</div>}

      {invites == null && !error && <div className="mono-meta">loading…</div>}

      {invites && invites.length === 0 && (
        <div className="mono-meta">no invites yet — generate one above.</div>
      )}

      {invites && invites.length > 0 && (
        <ul className="runs-list">
          {invites.map((inv) => (
            <li key={inv.code}>
              <div className="runs-row" style={{ cursor: "default" }}>
                <span className={`status-pill ${inv.used_at ? "status-completed" : "status-running"}`}>
                  {inv.used_at ? "used" : "open"}
                </span>
                <span className="runs-row-desc" style={{ fontFamily: "var(--f-mono)" }}>
                  {inv.code}
                  {inv.note && <span className="mono-meta"> · {inv.note}</span>}
                  {inv.used_by_email && (
                    <span className="mono-meta"> · used by {inv.used_by_email}</span>
                  )}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
