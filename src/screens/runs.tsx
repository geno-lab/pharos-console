import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { useTimeAgo } from "../lib/timeago";
import type { RunSummary } from "../bindings/RunSummary";

export function RunsListScreen() {
  const [runs, setRuns] = useState<RunSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .runs.list()
      .then((rows) => {
        if (!cancelled) setRuns(rows);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.body || e.message : String(e));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="canvas canvas-runs">
      <header className="runs-header">
        <h1 className="masthead-title">§ history</h1>
        <p className="masthead-sub">your past runs</p>
        <Link to="/" className="auth-link">
          ← new task
        </Link>
      </header>

      {error && <div className="error">{error}</div>}

      {runs == null && !error && <div className="mono-meta">loading…</div>}

      {runs && runs.length === 0 && (
        <div className="mono-meta">no runs yet — submit a task from the home screen.</div>
      )}

      {runs && runs.length > 0 && (
        <ul className="runs-list">
          {runs.map((r) => (
            <li key={r.id}>
              <RunRow run={r} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RunRow({ run }: { run: RunSummary }) {
  const startedMs = Number(run.started_at) * 1000;
  const ago = useTimeAgo(startedMs);
  return (
    <Link to={`/runs/${encodeURIComponent(run.id)}`} className="runs-row">
      <span className={`status-pill status-${run.status}`}>{run.status}</span>
      <span className="runs-row-desc">{run.description}</span>
      <span className="runs-row-when mono-meta">{ago}</span>
    </Link>
  );
}
