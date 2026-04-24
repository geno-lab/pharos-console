// Live run — streaming view: DAG (top), event stream (bottom-left), timeline rail (bottom-right).
// Also: pause / firehose toggle, extension state.

const { useState: useStateLive, useEffect: useEffectLive, useRef: useRefLive } = React;

function LiveRun({ topic, graph, extension, events, progressEl, branch, onSwitchBranch,
                   phase, onCommanderDecide, eventMode, onEventMode, extended, onExtend }) {
  const streamRef = useRefLive(null);

  useEffectLive(() => {
    const el = streamRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [events.length]);

  const mergedNodes = extended ? [...graph.nodes, ...extension.nodes] : graph.nodes;
  const mergedEdges = extended ? [...graph.edges, ...extension.edges] : graph.edges;
  const addedEdges = extended ? extension.edges : [];

  return (
    <div className="screen-pad-tight">
      <RunHeader topic={topic} branch={branch} onSwitchBranch={onSwitchBranch} phase={phase} progress={progressEl} />

      <div className="two-col col-1fr-440" style={{ marginTop: 20 }}>
        {/* Left column: graph + stream */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          <TaskGraphSVG nodes={mergedNodes} edges={mergedEdges} added={addedEdges} />

          <div style={{ border: "1px solid var(--ink)" }}>
            {/* Stream toolbar */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "8px 14px",
              borderBottom: "1px solid var(--ink)",
              background: "var(--paper-2)",
              fontFamily: "var(--f-mono)", fontSize: 11,
            }}>
              <span className="caps" style={{ color: "var(--ink-3)" }}>§ IV · stream</span>
              <div style={{ display: "flex", border: "1px solid var(--ink)", marginLeft: 10 }}>
                {["grouped", "firehose"].map(m => (
                  <button key={m} onClick={() => onEventMode(m)}
                    style={{
                      padding: "3px 10px",
                      background: eventMode === m ? "var(--ink)" : "transparent",
                      color: eventMode === m ? "var(--paper)" : "var(--ink)",
                      border: 0, cursor: "pointer",
                      fontFamily: "var(--f-mono)", fontSize: 10.5,
                    }}>{m}</button>
                ))}
              </div>
              <span style={{ color: "var(--ink-4)", marginLeft: "auto" }}>
                auto-scroll · {events.length} events
              </span>
            </div>
            <div ref={streamRef} style={{ maxHeight: 520, overflowY: "auto" }}>
              <EventStream events={events} mode={eventMode} live={phase === "executing"} />
            </div>
          </div>
        </div>

        {/* Right rail: supervisor + commander cards + timeline */}
        <aside className="rail-col" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SupervisorCard events={events} />
          <CommanderCard
            phase={phase}
            extended={extended}
            onDecide={onCommanderDecide}
            onExtend={onExtend}
          />
          <TimelineRail events={events} />
          <ContextRail branch={branch} />
        </aside>
      </div>
    </div>
  );
}

function SupervisorCard({ events }) {
  const evals = events.filter(e => e.type === "evaluation");
  const last = evals[evals.length - 1];
  return (
    <div style={{ border: "1px solid var(--ink)", background: "var(--paper)" }}>
      <div className="swiss-label" style={{ margin: 0, padding: "10px 14px 8px", borderBottom: "1px solid var(--ink)" }}>
        <span className="k">○ review · rubric</span>
        <span className="v">{evals.length} verdicts</span>
      </div>
      <div style={{ padding: "12px 14px" }}>
        {last ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Circle size={14} />
              <VerdictPill verdict={last.status} />
              <span className="mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>{last.t}</span>
            </div>
            <div style={{
              fontFamily: "var(--f-display)", fontStyle: "italic",
              fontSize: 14, lineHeight: 1.5, color: "var(--ink-2)",
            }}>“{last.feedback}”</div>
          </>
        ) : (
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-4)" }}>no verdicts yet</div>
        )}
        <div style={{ marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {evals.map((e, i) => (
            <VerdictPill key={i} verdict={e.status} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CommanderCard({ phase, extended, onDecide, onExtend }) {
  const canDecide = phase === "reviewing";
  return (
    <div style={{
      border: "1px solid var(--ink)",
      background: canDecide ? "var(--k-yellow)" : "var(--paper)",
      transition: "background 300ms var(--ease-paper)",
    }}>
      <div className="swiss-label" style={{
        margin: 0, padding: "10px 14px 8px",
        borderBottom: "1px solid var(--ink)",
      }}>
        <span className="k">△ awaiting decision</span>
        <span className="v">{phase}</span>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Triangle size={14} />
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)" }}>
            {phase === "executing" && "Watching execution. Will decide when graph completes."}
            {phase === "reviewing" && "Initial graph done. Deeper probe? Or write?"}
            {phase === "extending" && "Extending graph with 3 deeper nodes."}
            {phase === "writing" && "Calling latex.write — compiling article."}
            {phase === "done" && "Run complete. Article ready."}
          </span>
        </div>
        {canDecide && (
          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            <button className="btn" onClick={() => onExtend()}
              style={{ background: "var(--ink)", color: "var(--paper)" }}>
              go deeper — extend graph
            </button>
            <button className="btn btn-ghost" onClick={() => onDecide("write")}>
              sufficient — write article →
            </button>
          </div>
        )}
        {phase === "extending" && (
          <button className="btn" onClick={() => onDecide("write")}
            style={{ marginTop: 10, background: "var(--ink)", color: "var(--paper)", width: "100%" }}>
            extension complete — write article →
          </button>
        )}
      </div>
    </div>
  );
}

function TimelineRail({ events }) {
  return (
    <div style={{ border: "1px solid var(--ink)", background: "var(--paper)" }}>
      <div className="swiss-label" style={{ margin: 0, padding: "10px 14px 8px", borderBottom: "1px solid var(--ink)" }}>
        <span className="k">timeline · typeset</span>
        <span className="v">{events.length}</span>
      </div>
      <div style={{ padding: "12px 14px", fontFamily: "var(--f-mono)", fontSize: 10.5, lineHeight: 1.55, maxHeight: 180, overflowY: "auto" }}>
        {events.slice(-12).map((e, i) => (
          <div key={i} style={{ display: "flex", gap: 8, color: "var(--ink-3)" }}>
            <span style={{ color: "var(--ink-5)" }}>{e.t}</span>
            <span style={{ color: "var(--ink-2)" }}>
              {e.type === "evaluation" ? `verdict · ${e.status}` : e.type.replace(/_/g, " ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContextRail({ branch }) {
  return (
    <div style={{
      padding: "12px 14px",
      border: "1px dashed var(--paper-edge)",
      fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--ink-4)",
      lineHeight: 1.6,
    }}>
      <div className="caps" style={{ color: "var(--ink-3)", marginBottom: 6 }}>run context</div>
      <div>seed · 47</div>
      <div>■ doers · 3 · parallel</div>
      <div>○ review · rubric v0.6</div>
      <div>branches · {branch ? 2 : 1}</div>
      <div>tokens · 48.2k / 200k budget</div>
    </div>
  );
}

Object.assign(window, { LiveRun });
