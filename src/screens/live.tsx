import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRun } from "../lib/store";
import type { Event as PharosEvent } from "../bindings";
import { AgentStamp, VerdictPill } from "../components/shape";
import { api } from "../lib/api";
import { useTimeAgo } from "../lib/timeago";

export function LiveScreen() {
  const events = useRun((s) => s.events);
  const phase = useRun((s) => s.phase);
  const position = useRun((s) => s.position);
  const result = useRun((s) => s.result);
  const error = useRun((s) => s.error);
  const lastEventAt = useRun((s) => s.lastEventAt);
  const resetRun = useRun((s) => s.resetRun);
  const streamRef = useRef<HTMLDivElement>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const ago = useTimeAgo(lastEventAt);
  const stale = lastEventAt != null && Date.now() - lastEventAt > 30_000;

  useEffect(() => {
    const el = streamRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [events.length]);

  const cancel = async () => {
    if (cancelling) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await api.cancel();
    } catch (e) {
      setCancelError(e instanceof Error ? e.message : String(e));
    } finally {
      setCancelling(false);
    }
  };

  const latestPhaseEvent = [...events].reverse().find((e) => e.type === "phase_changed");
  const phaseLabel =
    latestPhaseEvent && latestPhaseEvent.type === "phase_changed"
      ? latestPhaseEvent.phase
      : phase;

  return (
    <div className="canvas canvas-live">
      <header className="run-header">
        <div>
          <div className="caps-label">run</div>
          <div className="mono-meta">active</div>
        </div>
        <div className="run-header-center">
          <div className="caps-label">task</div>
          <div className="topic-display">
            {firstTask(events) ?? <span className="mono-meta">(waiting)</span>}
          </div>
        </div>
        <div className="run-header-right">
          <div className="caps-label">phase</div>
          <div className="mono-meta phase-value">{phaseLabel}</div>
          {(phase === "running" || phase === "queued") && (
            <button className="btn btn-cancel" onClick={cancel} disabled={cancelling}>
              {cancelling ? "cancelling…" : phase === "queued" ? "× leave queue" : "× interrupt"}
            </button>
          )}
        </div>
      </header>

      {phase === "queued" && (
        <div className="activity-bar">
          <span className="dot dot-stale" />
          <span className="mono-meta">
            queued · #{position ?? "?"} in line · waiting for the worker
          </span>
        </div>
      )}

      {phase === "running" && (
        <div className={stale ? "activity-bar activity-bar-stale" : "activity-bar"}>
          <span className={stale ? "dot dot-stale" : "dot dot-live"} />
          <span className="mono-meta">
            {stale ? "no events" : "live"}
            {ago && ` · last event ${ago}`}
            {events.length > 0 && ` · ${events.length} total`}
          </span>
        </div>
      )}

      {cancelError && <div className="error">{cancelError}</div>}

      <section className="stream-panel">
        <div className="stream-toolbar">
          <span className="caps-label">§ ii · event stream</span>
          <span className="mono-meta">{events.length} events</span>
        </div>
        <div ref={streamRef} className="stream-body">
          {events.length === 0 ? (
            <div className="stream-empty mono-meta">
              waiting for the first event…
            </div>
          ) : (
            events.map((e, i) => <EventRow key={i} event={e} />)
          )}
        </div>
      </section>

      {(phase === "completed" || phase === "failed") && (
        <section className="result-panel">
          <div className="caps-label">
            §{" "}
            {phase === "completed" ? "III · result" : "III · failed"}
          </div>
          {phase === "completed" && result && <pre className="result-body">{result}</pre>}
          {phase === "failed" && <div className="error">{error ?? "task failed"}</div>}
          <button className="btn" onClick={resetRun}>
            ↺ new task
          </button>
        </section>
      )}
    </div>
  );
}

function firstTask(events: PharosEvent[]): string | undefined {
  const submitted = events.find((e) => e.type === "task_submitted");
  return submitted && submitted.type === "task_submitted" ? submitted.description : undefined;
}

function EventRow({ event }: { event: PharosEvent }) {
  return (
    <div className="event-row">
      <span className="event-type">{event.type}</span>
      <span className="event-body">{summarize(event)}</span>
    </div>
  );
}

function summarize(e: PharosEvent): ReactNode {
  switch (e.type) {
    case "task_submitted":
      return e.description;
    case "agent_spawned":
      return (
        <>
          <AgentStamp role={e.role} size={10} />
          <span style={{ marginLeft: 6 }}>
            {e.role} · tier {e.tier} · {e.id}
          </span>
        </>
      );
    case "agent_completed":
      return <span>{e.id} · {truncate(e.output_summary, 80)}</span>;
    case "agent_cancelled":
      return <span>{e.id} cancelled</span>;
    case "llm_request_started":
      return <span>{e.agent_id} → {e.model}</span>;
    case "llm_delta":
      return <span className="llm-delta">{truncate(e.text, 140)}</span>;
    case "llm_response_completed":
      return (
        <span>
          {e.agent_id} · in {e.usage.input_tokens} · out {e.usage.output_tokens}
        </span>
      );
    case "tool_started":
      return <span>{e.agent_id} → {e.tool}</span>;
    case "tool_completed":
      return (
        <span>
          {e.tool} · {e.success ? "ok" : "fail"} · {truncate(e.result, 80)}
        </span>
      );
    case "evaluation":
      return (
        <>
          <VerdictPill verdict={e.status} />
          <span style={{ marginLeft: 8 }}>{e.node_id} · {truncate(e.feedback, 80)}</span>
        </>
      );
    case "strategic_insight":
      return <span className="italic">{truncate(e.insight, 120)}</span>;
    case "tier_escalation":
      return <span>{e.node_id} · T{e.from} → T{e.to}</span>;
    case "phase_changed":
      return <span className="phase-change">{e.phase}</span>;
    case "error":
      return <span className="error-line">[{e.source}] {e.message}</span>;
    case "graph_built":
    case "graph_modified":
      return <span className="mono-meta">(graph)</span>;
  }
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}
