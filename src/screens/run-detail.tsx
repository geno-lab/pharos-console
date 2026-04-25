import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import type { RunDetail } from "../bindings/RunDetail";

export function RunDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<RunDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    api
      .runs.detail(id)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((e) => {
        if (!cancelled) {
          if (e instanceof ApiError && e.status === 404) setError("run not found");
          else setError(e instanceof ApiError ? e.body || e.message : String(e));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="canvas canvas-run-detail">
      <header className="runs-header">
        <Link to="/runs" className="auth-link">
          ← all runs
        </Link>
        {detail && <span className={`status-pill status-${detail.status}`}>{detail.status}</span>}
      </header>

      {error && <div className="error">{error}</div>}
      {!detail && !error && <div className="mono-meta">loading…</div>}

      {detail && (
        <>
          <section className="run-detail-task">
            <div className="caps-label">§ task</div>
            <div className="topic-display">{detail.description}</div>
          </section>

          {detail.result && (
            <section className="result-panel">
              <div className="caps-label">§ result</div>
              <pre className="result-body">{detail.result}</pre>
            </section>
          )}

          {detail.error && (
            <section className="result-panel">
              <div className="caps-label">§ failed</div>
              <div className="error">{detail.error}</div>
            </section>
          )}

          <section className="stream-panel">
            <div className="stream-toolbar">
              <span className="caps-label">§ event log</span>
              <span className="mono-meta">{detail.events.length} events</span>
            </div>
            <div className="stream-body">
              {detail.events.map((ev, i) => (
                <div key={i} className="event-row">
                  <span className="event-type">
                    {(ev as { type?: string }).type ?? "unknown"}
                  </span>
                  <span className="event-body">
                    {JSON.stringify(ev).slice(0, 240)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
