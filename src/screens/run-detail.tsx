import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import type { RunDetail } from "../bindings/RunDetail";

export function RunDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<RunDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);

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

  if (error) {
    return (
      <div className="canvas canvas-runs">
        <header className="runs-header">
          <Link to="/runs" className="auth-link">← all runs</Link>
        </header>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="canvas canvas-runs">
        <header className="runs-header">
          <Link to="/runs" className="auth-link">← all runs</Link>
        </header>
        <div className="mono-meta">loading…</div>
      </div>
    );
  }

  // If the run has a compiled PDF, render the article view (PDF embed +
  // .tex / .pdf download). Otherwise fall back to the raw event log + text
  // result panel for older runs or compile failures.
  if (detail.has_pdf && id) {
    return (
      <div className="canvas canvas-article">
        <header className="article-toolbar">
          <Link to="/runs" className="auth-link">← all runs</Link>
          <span className="caps-label">§ V · article</span>
          <span className={`status-pill status-${detail.status}`}>{detail.status}</span>
          <span className="spacer" />
          <button className="auth-link" onClick={() => setShowSource((v) => !v)}>
            {showSource ? "▾ pdf" : "▸ .tex source"}
          </button>
          {detail.has_tex && (
            <a className="btn btn-ghost" href={`/api/runs/${encodeURIComponent(id)}/tex`} download>
              ↓ .tex
            </a>
          )}
          <a className="btn" href={`/api/runs/${encodeURIComponent(id)}/pdf`} download>
            ↓ .pdf
          </a>
        </header>

        <section className="run-detail-task">
          <div className="caps-label">§ task</div>
          <div className="topic-display">{detail.description}</div>
        </section>

        <div className="article-canvas">
          {showSource ? (
            <TexSource id={id} />
          ) : (
            <iframe
              className="article-pdf"
              src={`/api/runs/${encodeURIComponent(id)}/pdf`}
              title="Pharos report PDF"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="canvas canvas-run-detail">
      <header className="runs-header">
        <Link to="/runs" className="auth-link">← all runs</Link>
        <span className={`status-pill status-${detail.status}`}>{detail.status}</span>
      </header>

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
              <span className="event-body">{JSON.stringify(ev).slice(0, 240)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function TexSource({ id }: { id: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/api/runs/${encodeURIComponent(id)}/tex`, { credentials: "include" })
      .then((r) => (r.ok ? r.text() : Promise.reject(`${r.status}`)))
      .then(setSrc)
      .catch(() => setSrc("(failed to load .tex)"));
  }, [id]);
  return <pre className="article-source">{src ?? "loading .tex…"}</pre>;
}
