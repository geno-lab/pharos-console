// Empty state + Task submission
const { useState: useStateEmpty, useRef: useRefEmpty } = React;

function EmptyState({ onSubmit, onOpenDrawer }) {
  const [value, setValue] = useStateEmpty("");
  const [mode, setMode] = useStateEmpty("topic"); // "topic" | "task"
  const taRef = useRefEmpty(null);

  const submit = () => {
    if (!value.trim()) return;
    onSubmit({ text: value, mode });
  };

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      {/* Masthead */}
      <header className="empty-header" style={{
        padding: "36px 72px 28px",
        borderBottom: "2px solid var(--ink)",
        position: "relative",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
            <span className="section-mark" style={{ fontSize: "clamp(32px, 8vw, 44px)", lineHeight: 1 }}>§</span>
            <span className="display" style={{ fontSize: "clamp(32px, 8vw, 44px)" }}>pharos</span>
            <span className="mono hide-mobile" style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: 8 }}>
              v0.4 · a notebook for research agents
            </span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" onClick={onOpenDrawer}>
              <span className="section-mark" style={{ fontSize: 14 }}>§</span> notebook
            </button>
          </div>
        </div>
        <div className="mono hide-mobile" style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 10, display: "flex", gap: 22, flexWrap: "wrap" }}>
          <span>— plans —</span>
          <span>— executes —</span>
          <span>— reviews · debates · re-plans —</span>
          <span style={{ marginLeft: "auto" }}>localhost · pharosd idle</span>
        </div>
      </header>

      {/* Composer */}
      <div className="two-col col-1fr-320 empty-body" style={{ flex: 1, padding: "56px 72px" }}>
        <div>
          <div className="caps" style={{ color: "var(--ink-3)", marginBottom: 16 }}>
            § I · give me a topic or a task
          </div>

          {/* Mode toggle */}
          <div style={{
            display: "inline-flex", border: "1px solid var(--ink)",
            marginBottom: 20,
          }}>
            {[
              { id: "topic", label: "topic", hint: "I'll discover sub-tasks" },
              { id: "task", label: "task", hint: "I'll do exactly this" },
            ].map(o => (
              <button key={o.id} onClick={() => setMode(o.id)}
                style={{
                  padding: "10px 18px",
                  background: mode === o.id ? "var(--ink)" : "transparent",
                  color: mode === o.id ? "var(--paper)" : "var(--ink)",
                  border: 0,
                  borderRight: o.id === "topic" ? "1px solid var(--ink)" : 0,
                  cursor: "pointer",
                  fontFamily: "var(--f-sans)", fontSize: 13, fontWeight: 500,
                  display: "flex", alignItems: "baseline", gap: 10,
                }}>
                <span>{o.label}</span>
                <span className="mono" style={{ fontSize: 10, opacity: 0.7 }}>— {o.hint}</span>
              </button>
            ))}
          </div>

          <div style={{
            border: "1px solid var(--ink)", background: "var(--paper)",
            position: "relative",
          }}>
            <textarea
              ref={taRef}
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={mode === "topic"
                ? "e.g. ‘Investigate whether sparse attention can be replaced with a learned content-routing prior on long-context retrieval tasks, and quantify tradeoffs vs. standard full attention.’"
                : "e.g. ‘Replicate table 3 of arxiv:2401.xxxxx on a 7B base, then write the result up as a one-page memo.’"}
              rows={6}
              style={{
                width: "100%", border: 0, outline: 0,
                padding: "18px 20px",
                background: "transparent", color: "var(--ink)",
                fontFamily: "var(--f-display)", fontSize: 22, lineHeight: 1.4,
                fontStyle: "italic", fontWeight: 400,
                resize: "vertical", minHeight: 140,
              }}
            />
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px",
              borderTop: "1px solid var(--paper-edge)",
              fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-4)",
            }}>
              <div style={{ display: "flex", gap: 14 }}>
                <span>↵ submit</span>
                <span>⌘K skills</span>
                <span>{value.length} chars</span>
              </div>
              <button className="btn" onClick={submit}
                disabled={!value.trim()}
                style={{ opacity: value.trim() ? 1 : 0.35 }}>
                {mode === "topic" ? "discover →" : "execute →"}
              </button>
            </div>
          </div>

          {/* Suggestions */}
          <div style={{ marginTop: 32 }}>
            <div className="caps" style={{ color: "var(--ink-4)", marginBottom: 12 }}>or · resume something</div>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                "Sparse attention vs. content-routing prior",
                "Failure modes of DPO under length-biased preferences",
                "Stale-gradient effects in async PPO",
              ].map((s, i) => (
                <button key={i}
                  onClick={() => { setValue(s); setMode("topic"); taRef.current?.focus(); }}
                  style={{
                    textAlign: "left", background: "transparent",
                    border: 0, borderBottom: "1px solid var(--paper-edge)",
                    padding: "10px 2px", cursor: "pointer",
                    fontFamily: "var(--f-sans)", fontSize: 14, color: "var(--ink-2)",
                    display: "flex", alignItems: "baseline", gap: 12,
                  }}>
                  <span className="mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>r-10{42 - i}</span>
                  <span>{s}</span>
                  <span className="mono" style={{ marginLeft: "auto", fontSize: 10, color: "var(--ink-4)" }}>→</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Side rail — the "how it works" card */}
        <aside className="rail-col">
          <div className="taped tapedrop" style={{ padding: "24px 20px 20px" }}>
            <div className="caps" style={{ color: "var(--ink-4)", marginBottom: 10 }}>how the agent works</div>
            <ol style={{
              margin: 0, paddingLeft: 0, listStyle: "none",
              fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55,
              display: "grid", gap: 10,
            }}>
              {[
                { n: "I", role: "commander", t: "Drafts an initial task graph" },
                { n: "II", role: "worker", t: "Each node is executed—may spawn sub-tasks" },
                { n: "III", role: "supervisor", t: "Every node is reviewed live, not just at the end" },
                { n: "IV", role: "supervisor", t: "Reviewer and planner argue; the graph mutates" },
                { n: "V", role: "commander", t: "Once quiet, a decision: go deeper, or write" },
              ].map((s, i) => (
                <li key={i} style={{ display: "grid", gridTemplateColumns: "22px 18px 1fr", gap: 8, alignItems: "baseline" }}>
                  <span className="display" style={{ fontSize: 14, color: "var(--ink-3)" }}>{s.n}.</span>
                  <span style={{ paddingTop: 2 }}>
                    {s.role === "commander" && <Triangle size={11} />}
                    {s.role === "worker" && <Square size={11} />}
                    {s.role === "supervisor" && <Circle size={11} />}
                  </span>
                  <span>{s.t}</span>
                </li>
              ))}
            </ol>
          </div>

          <div style={{ marginTop: 20, fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-4)", lineHeight: 1.6 }}>
            <div className="caps" style={{ color: "var(--ink-3)", marginBottom: 6 }}>keys</div>
            <div>△ yellow · the planner</div>
            <div>■ red · the doer</div>
            <div>○ blue · the reviewer</div>
            <div style={{ marginTop: 10, color: "var(--ink-4)" }}>— roles, keyed by shape</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { EmptyState });
