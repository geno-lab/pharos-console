// Left drawer — hidden by default, pushes main content.
// Contains: Skills, Runs, Drafts. Text-rich (pretext-style), not icon-heavy.

const { useState: useStateDrawer, useEffect: useEffectDrawer } = React;

const MOCK_SKILLS = [
  { id: "sk-latex", name: "latex.write", kind: "output", bindings: "SkillInfo", version: "0.4.2", desc: "Compile a run into a LaTeX draft. Supports TikZ, pgfplots, and multi-pane figure layouts.", calls: 138, avg: "18.4s" },
  { id: "sk-websearch", name: "web.search", kind: "tool", bindings: "SkillInfo", version: "1.2.0", desc: "Broad web retrieval with dedup, domain-weighted ranking, and abstract extraction.", calls: 4821, avg: "2.1s" },
  { id: "sk-arxiv", name: "arxiv.fetch", kind: "tool", bindings: "SkillInfo", version: "0.9.1", desc: "Pulls abstract, BibTeX, and inline figure captions for a given arXiv ID.", calls: 902, avg: "0.8s" },
  { id: "sk-fswrite", name: "fs.write", kind: "tool", bindings: "SkillInfo", version: "1.0.0", desc: "Write to scratch filesystem. Scoped to run.", calls: 12034, avg: "40ms" },
  { id: "sk-pyexec", name: "py.exec", kind: "tool", bindings: "SkillInfo", version: "1.1.3", desc: "Execute Python in a sandboxed kernel. Plot output is captured as PNG + data URL.", calls: 3401, avg: "1.4s" },
  { id: "sk-eval-rubric", name: "eval.rubric", kind: "eval", bindings: "SkillInfo", version: "0.6.0", desc: "Supervisor rubric eval — produces GREEN/YELLOW/RED with per-axis feedback.", calls: 2208, avg: "3.0s" },
  { id: "sk-draftrevise", name: "draft.revise", kind: "output", bindings: "SkillInfo", version: "0.3.0", desc: "Take a notebook draft and produce a clean prose version for the final article.", calls: 214, avg: "11.2s" },
];

const MOCK_RUNS = [
  { id: "r-1043", title: "Sparse attention vs. content-routing prior", when: "now", status: "active", nodes: 11, verdict: "—" },
  { id: "r-1042", title: "Failure modes of DPO under length-biased preferences", when: "yesterday · 18:22", status: "done", nodes: 14, verdict: "GREEN" },
  { id: "r-1041", title: "Whether speculative decoding saturates on code", when: "yesterday · 11:04", status: "done", nodes: 9, verdict: "YELLOW" },
  { id: "r-1040", title: "Stale-gradient effects in async PPO", when: "2d ago", status: "done", nodes: 17, verdict: "GREEN" },
  { id: "r-1039", title: "Retrieval-shaped tokenization for long code", when: "2d ago", status: "red", nodes: 6, verdict: "RED" },
  { id: "r-1038", title: "Does RoPE extrapolation survive interpolation?", when: "4d ago", status: "done", nodes: 12, verdict: "GREEN" },
];

const MOCK_DRAFTS = [
  { id: "d-88", title: "routing-prior.tex", run: "r-1043", pages: 6, figs: 4, state: "compiling" },
  { id: "d-87", title: "dpo-length-bias.tex", run: "r-1042", pages: 8, figs: 5, state: "compiled" },
  { id: "d-85", title: "specdec-code.tex", run: "r-1041", pages: 4, figs: 2, state: "compiled" },
];

function Drawer({ open, onClose, onGoState }) {
  const [tab, setTab] = useStateDrawer("queue");

  return (
    <>
      {/* Main content wrapper receives padding-left when open — handled by parent.
          The drawer itself is position:sticky + width transition. */}
      <aside
        aria-hidden={!open}
        className="pharos-drawer"
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0,
          width: open ? "min(360px, 100vw)" : 0,
          overflow: "hidden",
          background: "var(--paper)",
          borderRight: open ? "1px solid var(--ink)" : "1px solid transparent",
          transition: "width 340ms var(--ease-paper), border-color 340ms var(--ease-paper)",
          zIndex: 40,
          boxShadow: open ? "2px 0 0 var(--paper-edge)" : "none",
        }}
      >
        <div style={{ width: "min(360px, 100vw)", height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid var(--ink)" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span className="section-mark" style={{ fontSize: 22 }}>§</span>
                <span className="display" style={{ fontSize: 22 }}>notebook</span>
              </div>
              <button onClick={onClose}
                aria-label="Close drawer"
                style={{
                  background: "transparent", border: 0, cursor: "pointer",
                  fontFamily: "var(--f-mono)", fontSize: 11,
                  color: "var(--ink-3)", padding: 4,
                }}>[ esc ]</button>
            </div>
            <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 4 }}>
              a drawer of skills, runs and drafts
            </div>
          </div>

          {/* Tabs as text */}
          <nav style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            borderBottom: "1px solid var(--paper-edge)",
          }}>
            {[
              { id: "queue", label: "queue", count: 3 },
              { id: "skills", label: "skills", count: MOCK_SKILLS.length },
              { id: "runs", label: "runs", count: MOCK_RUNS.length },
              { id: "drafts", label: "drafts", count: MOCK_DRAFTS.length },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{
                  background: tab === t.id ? "var(--ink)" : "transparent",
                  color: tab === t.id ? "var(--paper)" : "var(--ink)",
                  border: 0, padding: "12px 14px",
                  fontFamily: "var(--f-sans)", fontSize: 13, fontWeight: 500,
                  cursor: "pointer", textAlign: "left",
                  transition: "background var(--dur-fast)",
                  borderRight: "1px solid var(--paper-edge)",
                  display: "flex", alignItems: "baseline", gap: 8,
                }}>
                <span>{t.label}</span>
                <span className="mono" style={{ fontSize: 10, opacity: 0.6 }}>{t.count}</span>
              </button>
            ))}
          </nav>

          <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
            {tab === "queue" && <QueueList />}
            {tab === "skills" && <SkillsList skills={MOCK_SKILLS} />}
            {tab === "runs" && <RunsList runs={MOCK_RUNS} onGoState={onGoState} />}
            {tab === "drafts" && <DraftsList drafts={MOCK_DRAFTS} onGoState={onGoState} />}
          </div>

          <div style={{
            padding: "10px 20px", borderTop: "1px solid var(--paper-edge)",
            fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-4)",
            display: "flex", justifyContent: "space-between",
          }}>
            <span>pharosd · local</span>
            <span>bindings@drift-ok</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function SkillsList({ skills }) {
  return (
    <div>
      <div style={{ padding: "12px 20px 8px", borderBottom: "1px solid var(--paper-edge)" }}>
        <div className="caps" style={{ color: "var(--ink-4)" }}>installed · loaded at boot</div>
      </div>
      {skills.map((sk, i) => (
        <div key={sk.id} style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--paper-edge)",
          display: "grid", gridTemplateColumns: "auto 1fr", gap: 12,
        }}>
          <div style={{
            width: 28, height: 28, flex: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid var(--ink)",
            fontFamily: "var(--f-mono)", fontSize: 10, fontWeight: 600,
            background: sk.kind === "output" ? "var(--k-yellow)" : sk.kind === "eval" ? "transparent" : "var(--paper)",
            color: "var(--ink)",
          }}>
            {sk.kind === "output" ? "◆" : sk.kind === "eval" ? "○" : "▢"}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{sk.name}</span>
              <span className="mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>v{sk.version}</span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 3, lineHeight: 1.45 }}>
              {sk.desc}
            </div>
            <div className="mono" style={{ fontSize: 10, color: "var(--ink-4)", marginTop: 6, display: "flex", gap: 12 }}>
              <span>{sk.calls.toLocaleString()} calls</span>
              <span>avg {sk.avg}</span>
              <span>{sk.kind}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RunsList({ runs, onGoState }) {
  return (
    <div>
      <div style={{ padding: "12px 20px 8px", borderBottom: "1px solid var(--paper-edge)" }}>
        <div className="caps" style={{ color: "var(--ink-4)" }}>history · most recent first</div>
      </div>
      {runs.map((r) => {
        const verdictColor = r.verdict === "GREEN" ? "var(--verdict-green)"
          : r.verdict === "YELLOW" ? "var(--k-yellow)"
          : r.verdict === "RED" ? "var(--k-red)" : "var(--ink-4)";
        return (
          <button key={r.id}
            onClick={() => onGoState && r.status === "active" && onGoState("run-live")}
            style={{
              display: "block", width: "100%", textAlign: "left",
              padding: "14px 20px",
              borderBottom: "1px solid var(--paper-edge)",
              background: r.status === "active" ? "var(--paper-2)" : "transparent",
              border: 0, borderBottom: "1px solid var(--paper-edge)",
              cursor: r.status === "active" ? "pointer" : "default",
              fontFamily: "inherit", color: "inherit",
            }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
              <span className="mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>{r.id}</span>
              <span className="mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>{r.when}</span>
            </div>
            <div style={{ fontSize: 13.5, color: "var(--ink)", marginTop: 4, lineHeight: 1.35 }}>
              {r.title}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
              {r.status === "active" && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontFamily: "var(--f-mono)", fontSize: 10,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--k-red)", animation: "caret 1.2s steps(1,end) infinite" }} />
                  LIVE
                </span>
              )}
              <span className="mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>{r.nodes} nodes</span>
              <span className="mono" style={{ fontSize: 10, color: verdictColor }}>· {r.verdict}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function DraftsList({ drafts, onGoState }) {
  return (
    <div>
      <div style={{ padding: "12px 20px 8px", borderBottom: "1px solid var(--paper-edge)" }}>
        <div className="caps" style={{ color: "var(--ink-4)" }}>latex artifacts</div>
      </div>
      {drafts.map(d => (
        <button key={d.id}
          onClick={() => onGoState && onGoState("article")}
          style={{
            display: "block", width: "100%", textAlign: "left",
            padding: "14px 20px",
            border: 0, borderBottom: "1px solid var(--paper-edge)",
            background: "transparent", cursor: "pointer",
            fontFamily: "inherit", color: "inherit",
          }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{d.title}</span>
            {d.state === "compiling" && (
              <span className="mono" style={{ fontSize: 10, color: "var(--k-red)" }}>compiling…</span>
            )}
          </div>
          <div className="mono" style={{ fontSize: 10, color: "var(--ink-4)", marginTop: 6, display: "flex", gap: 12 }}>
            <span>{d.pages} pp</span>
            <span>{d.figs} figures</span>
            <span>from {d.run}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

Object.assign(window, { Drawer });

function QueueList() {
  const queue = [
    { id: "r-1043", title: "Sparse attention vs. content-routing prior", state: "active", phase: "executing · node 3 / 8", topic: "attention · long-context" },
    { id: "r-1044", title: "FlashAttention-3 comparison on 7B code-gen", state: "queued", phase: "waiting · starts after r-1043", topic: "attention · kernels" },
    { id: "r-1045", title: "DPO length-bias replication", state: "queued", phase: "waiting · queued 2 ahead", topic: "alignment · dpo" },
  ];
  return (
    <div>
      <div style={{ padding: "12px 20px 8px", borderBottom: "1px solid var(--paper-edge)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="caps" style={{ color: "var(--ink-4)" }}>task queue · fifo</div>
        <button className="mono" style={{ fontSize: 10, background: "transparent", border: "1px solid var(--ink)", padding: "3px 8px", cursor: "pointer", color: "var(--ink)" }}>+ new task</button>
      </div>
      {queue.map((t, i) => (
        <div key={t.id} style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--paper-edge)",
          background: t.state === "active" ? "var(--paper-2)" : "transparent",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span className="mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>{String(i + 1).padStart(2, "0")}</span>
            <span className="mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>{t.id}</span>
            {t.state === "active" && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--f-mono)", fontSize: 10, marginLeft: "auto" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--k-red)", animation: "caret 1.2s steps(1,end) infinite" }} />
                LIVE
              </span>
            )}
            {t.state === "queued" && (
              <span className="mono" style={{ fontSize: 10, color: "var(--ink-4)", marginLeft: "auto" }}>waiting</span>
            )}
          </div>
          <div style={{ fontSize: 13.5, color: "var(--ink)", marginTop: 4, lineHeight: 1.35 }}>{t.title}</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--ink-4)", marginTop: 6 }}>
            {t.phase} · {t.topic}
          </div>
        </div>
      ))}
      <div style={{ padding: "16px 20px", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>
        Tasks run in submission order. Once the active task finishes, the queue advances automatically.
      </div>
    </div>
  );
}

Object.assign(window, { QueueList });
