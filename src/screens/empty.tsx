import { useState } from "react";
import { api } from "../lib/api";
import { useRun } from "../lib/store";

export function EmptyScreen() {
  const [task, setTask] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resetRun = useRun((s) => s.resetRun);

  const submit = async () => {
    if (!task.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      resetRun();
      await api.run(task);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="canvas canvas-empty">
      <div className="masthead">
        <h1 className="masthead-title">§ pharos</h1>
        <p className="masthead-sub">v0.4 · a notebook for research agents</p>
      </div>

      <div className="role-strip">
        <div>— plans —</div>
        <div>— executes —</div>
        <div>— reviews · debates · re-plans —</div>
      </div>

      <div className="caps-label">§ I · give me a topic or a task</div>

      <textarea
        className="task-input"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
        placeholder="e.g. Research the role of sirtuins in aging and identify potential drug targets."
      />

      {error && <div className="error">{error}</div>}

      <div className="submit-row">
        <span className="mono-meta">⌘ + enter</span>
        <button className="btn" onClick={submit} disabled={!task.trim() || submitting}>
          {submitting ? "submitting…" : "execute →"}
        </button>
      </div>
    </div>
  );
}
