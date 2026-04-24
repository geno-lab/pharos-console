// Clarification turns — commander asks, user picks. Divergent answers create a branch.
// Branching decision: footnote-in-margin by default; if user picks alt on a previous turn,
// a git lane appears in the run header.

const { useState: useStateClar } = React;

function Clarify({ topic, qs, answers, onAnswer, onConfirm, branch, onSwitchBranch }) {
  return (
    <div className="screen-pad" style={{ maxWidth: 1200 }}>
      {/* Run header w/ branches */}
      <RunHeader topic={topic} branch={branch} onSwitchBranch={onSwitchBranch} />

      <div className="two-col col-1fr-280" style={{ marginTop: 28 }}>
        <main>
          <div className="caps" style={{ color: "var(--ink-3)", marginBottom: 14 }}>§ II · clarification</div>
          <div className="display" style={{ fontSize: 24, marginBottom: 24, color: "var(--ink-2)" }}>
            Narrowing the scope before the graph is drawn.
          </div>

          {qs.map((q, qi) => (
            <ClarifyTurn
              key={q.id}
              q={q}
              answer={answers[q.id]}
              onAnswer={(optId, isDivergent) => onAnswer(q.id, optId, isDivergent)}
              branched={branch && branch.divergedAt === q.id}
            />
          ))}

          {Object.keys(answers).length === qs.length && (
            <div style={{ marginTop: 32, borderTop: "1px solid var(--ink)", paddingTop: 20 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                <span className="caps" style={{ color: "var(--verdict-green)" }}>· ready</span>
                <span style={{ color: "var(--ink-2)", fontSize: 14 }}>
                  Enough signal. A task graph can be drafted now.
                </span>
                <button className="btn" onClick={onConfirm} style={{ marginLeft: "auto" }}>
                  draw the graph →
                </button>
              </div>
            </div>
          )}
        </main>

        <aside className="rail-col">
          <div className="caps" style={{ color: "var(--ink-4)", marginBottom: 10 }}>margin</div>
          <div style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: 15, color: "var(--ink-3)", lineHeight: 1.55,
          }}>
            Every answer that differs from the default{" "}
            <span style={{ background: "var(--k-yellow)", padding: "0 4px", color: "var(--ink)" }}>
              opens a branch
            </span>
            . Switch between them in the header; the graph rewinds.
          </div>

          <hr className="rule" style={{ margin: "18px 0" }} />

          <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-4)", lineHeight: 1.6 }}>
            <div className="caps" style={{ color: "var(--ink-3)", marginBottom: 6 }}>from bindings</div>
            <div>→ ClarifyEvent</div>
            <div>→ GraphChange[]</div>
            <div>→ RunStatus.branches</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ClarifyTurn({ q, answer, onAnswer, branched }) {
  return (
    <section style={{
      marginBottom: 36,
      paddingLeft: 20, borderLeft: "1px solid var(--paper-edge)",
      position: "relative",
    }}>
      {/* Question */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
        <span style={{ marginLeft: -29 }}><Triangle size={14} /></span>
        <span className="caps" style={{ color: "var(--ink-4)" }}>△ asks</span>
        <span className="mono" style={{ fontSize: 10, color: "var(--ink-5)" }}>{q.id}</span>
      </div>
      <div style={{ fontSize: 18, color: "var(--ink)", marginBottom: 14, fontFamily: "var(--f-sans)" }}>
        {q.text}
      </div>

      {/* Options */}
      <div style={{ display: "grid", gap: 6 }}>
        {q.options.map(o => {
          const picked = answer === o.id;
          const isDefault = o.chosen;
          return (
            <button key={o.id}
              onClick={() => onAnswer(picked ? null : o.id, !o.chosen)}
              style={{
                textAlign: "left",
                padding: "10px 14px",
                background: picked ? "var(--ink)" : "transparent",
                color: picked ? "var(--paper)" : "var(--ink)",
                border: "1px solid " + (picked ? "var(--ink)" : "var(--paper-edge)"),
                cursor: "pointer",
                fontFamily: "var(--f-sans)", fontSize: 14,
                display: "flex", alignItems: "center", gap: 12,
                transition: "all 180ms var(--ease-paper)",
              }}>
              <span className="mono" style={{ fontSize: 10, opacity: 0.6 }}>
                {picked ? "▣" : "□"}
              </span>
              <span style={{ flex: 1 }}>{o.label}</span>
              {isDefault && (
                <span className="caps" style={{
                  fontSize: 9.5,
                  padding: "2px 6px",
                  background: picked ? "transparent" : "var(--k-yellow)",
                  border: "1px solid " + (picked ? "var(--paper)" : "var(--ink)"),
                  color: picked ? "var(--paper)" : "var(--ink)",
                }}>
                  default
                </span>
              )}
            </button>
          );
        })}
      </div>

      {q.note && (
        <div style={{
          marginTop: 10, paddingLeft: 10,
          fontFamily: "var(--f-display)", fontStyle: "italic",
          fontSize: 13, color: "var(--ink-3)",
        }}>
          — {q.note}
        </div>
      )}

      {/* Branch footnote */}
      {branched && (
        <div className="tapedrop" style={{
          marginTop: 14,
          display: "flex", alignItems: "center", gap: 12,
          padding: "8px 12px",
          background: "var(--paper-2)",
          borderLeft: "3px solid var(--k-red)",
          fontFamily: "var(--f-mono)", fontSize: 11,
        }}>
          <span style={{ color: "var(--k-red)" }}>↰ branched</span>
          <span style={{ color: "var(--ink-2)" }}>
            you took a non-default path · <b>branch-long</b> opened
          </span>
          <span style={{ color: "var(--ink-4)", marginLeft: "auto" }}>switch in header ↑</span>
        </div>
      )}
    </section>
  );
}

// Run header — w/ git lanes when >1 branch exists.
function RunHeader({ topic, runId = "r-1043", branch, onSwitchBranch, progress, phase }) {
  const branches = branch ? ["main", branch.id] : ["main"];
  const current = branch && branch.active ? branch.id : "main";

  return (
    <div style={{
      position: "relative",
      border: "1px solid var(--ink)",
      background: "var(--paper)",
    }}>
      {branches.length > 1 && <div className="diagonal-band run-header-diag" />}

      <div className="run-header-grid" style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--paper-edge)",
        position: "relative",
      }}>
        <div className="run-header-meta">
          <div className="mono caps" style={{ color: "var(--ink-4)" }}>run · {runId}</div>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-5)", marginTop: 2 }}>
            opened just now
          </div>
        </div>

        <div className="run-header-topic">
          <div className="caps" style={{ color: "var(--ink-4)" }}>topic</div>
          <div className="display" style={{ fontSize: 20, lineHeight: 1.25, color: "var(--ink)", marginTop: 4, textWrap: "balance" }}>
            {topic}
          </div>
        </div>

        <div className="run-header-phase">
          <div className="caps" style={{ color: "var(--ink-4)" }}>phase</div>
          <div className="mono" style={{ fontSize: 12, color: "var(--ink)", marginTop: 4, whiteSpace: "nowrap" }}>
            {phase || "clarifying"}
          </div>
        </div>
      </div>

      {/* Branches lane */}
      {branches.length > 1 && (
        <div style={{
          padding: "10px 20px",
          borderTop: "1px dashed var(--paper-edge)",
          display: "flex", alignItems: "center", gap: 14,
          fontFamily: "var(--f-mono)", fontSize: 11,
          background: "var(--paper-2)",
        }}>
          <span className="caps" style={{ color: "var(--ink-4)" }}>branches</span>
          {branches.map((b, i) => (
            <button key={b}
              onClick={() => onSwitchBranch && onSwitchBranch(b)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "4px 10px",
                background: current === b ? "var(--ink)" : "transparent",
                color: current === b ? "var(--paper)" : "var(--ink)",
                border: "1px solid var(--ink)",
                cursor: "pointer",
                fontFamily: "var(--f-mono)", fontSize: 11,
              }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: b === "main" ? "var(--verdict-green)" : "var(--k-red)",
              }} />
              <span>{b}</span>
              {b !== "main" && branch && <span style={{ opacity: 0.6 }}>· {branch.commits} commits</span>}
            </button>
          ))}
          <span style={{ marginLeft: "auto", color: "var(--ink-4)" }}>
            {current !== "main" ? `diverged at ${branch.divergedAt}` : "no divergence"}
          </span>
        </div>
      )}

      {progress && (
        <div style={{
          padding: "10px 20px",
          borderTop: "1px solid var(--paper-edge)",
          background: "var(--paper)",
        }}>
          {progress}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Clarify, RunHeader });
