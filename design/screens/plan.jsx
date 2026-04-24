// Plan confirm — commander proposes the initial task graph before execution.
function PlanConfirm({ topic, graph, onStart, onEdit, progressMode, branch, onSwitchBranch }) {
  return (
    <div className="screen-pad-tight">
      <RunHeader topic={topic} branch={branch} onSwitchBranch={onSwitchBranch} phase="plan · awaiting confirm" />

      <div style={{ marginTop: 28 }}>
        <div className="section-header-strip">
          <div className="caps" style={{ color: "var(--ink-3)" }}>§ III · initial task graph</div>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-4)" }}>
            {graph.nodes.length} nodes · {graph.edges.length} edges · 3 in parallel
          </div>
          <div className="section-header-actions">
            <button className="btn btn-ghost" onClick={onEdit}>← revise answers</button>
            <button className="btn" onClick={onStart}>execute graph →</button>
          </div>
        </div>

        <TaskGraphSVG nodes={graph.nodes} edges={graph.edges} />

        <div className="two-col col-1fr-320" style={{ marginTop: 32 }}>
          <div>
            <div className="caps" style={{ color: "var(--ink-4)", marginBottom: 10 }}>△ notes</div>
            <div style={{
              fontFamily: "var(--f-display)", fontStyle: "italic",
              fontSize: 19, lineHeight: 1.5, color: "var(--ink-2)",
            }}>
              The graph front-loads the eval harness; both baseline and proposed model consume it.
              Ablations sit downstream so the review only gates once the main comparison is clean.
              If the verdict is green, I’ll decide whether to go deeper or write.
            </div>
          </div>
          <aside className="rail-col taped tapedrop" style={{ padding: "22px 18px 18px" }}>
            <div className="caps" style={{ color: "var(--ink-4)", marginBottom: 10 }}>expected output</div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>
              A 6-page workshop-style paper, figures required. If the review returns <VerdictPill verdict="RED" />
              at the gate the scope drops to a memo.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PlanConfirm });
