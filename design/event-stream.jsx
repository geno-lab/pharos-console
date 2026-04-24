// Event stream — Two-mode: grouped (llm_delta bursts collapsed into a streaming paragraph per node)
// vs firehose (every event visible). Laboratory-notebook formatting with timestamp gutter.

const { useMemo: useMemoStream } = React;

function groupEvents(events) {
  // Coalesce consecutive llm_delta events from the same agent into a single paragraph block.
  const out = [];
  for (const e of events) {
    const last = out[out.length - 1];
    if (e.type === "llm_delta" && last && last.type === "llm_delta_group" && last.from === e.from) {
      last.text += " " + e.text;
      last.tEnd = e.t;
    } else if (e.type === "llm_delta") {
      out.push({ ...e, type: "llm_delta_group", tEnd: e.t });
    } else {
      out.push(e);
    }
  }
  return out;
}

function EventStream({ events, mode = "grouped", live = false }) {
  const display = useMemoStream(() => mode === "firehose" ? events : groupEvents(events), [events, mode]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div className="swiss-label" style={{ margin: 0, padding: "10px 16px 8px", borderBottom: "1px solid var(--ink)" }}>
        <span className="k">event stream · {mode}</span>
        <span className="v">{events.length} events{live ? " · LIVE" : ""}</span>
      </div>

      <div style={{
        fontFamily: "var(--f-mono)", fontSize: 12, lineHeight: 1.55,
        padding: "10px 16px 24px",
      }}>
        {display.map((e, i) => <EventRow key={i} e={e} index={i} last={i === display.length - 1 && live} />)}
      </div>
    </div>
  );
}

function EventRow({ e, index, last }) {
  const G = { gridTemplateColumns: "64px 18px 1fr", gap: 10 };
  const tsStyle = { color: "var(--ink-4)", fontSize: 10.5, paddingTop: 2, textAlign: "right" };

  const stampFor = (agent) => {
    if (agent === "commander") return <Triangle size={10} />;
    if (agent === "worker") return <Square size={10} />;
    if (agent === "supervisor") return <Circle size={10} />;
    return <span style={{ display: "inline-block", width: 10, height: 10, border: "1px solid var(--ink)", background: "var(--paper)" }} />;
  };

  const row = (content) => (
    <div className="paperfade" style={{
      display: "grid", ...G, padding: "4px 0",
      borderTop: index === 0 ? "0" : "1px dashed var(--paper-edge)",
    }}>
      <span style={tsStyle} className="mono num">{e.t}</span>
      <span style={{ paddingTop: 4 }}>{stampFor(e.from)}</span>
      <div>{content}{last && <span className="caret" />}</div>
    </div>
  );

  if (e.type === "graph_init") {
    return row(<>
      <span className="caps" style={{ color: "var(--k-red)" }}>§ graph initialized</span>
      <div style={{ color: "var(--ink-2)", marginTop: 2 }}>{e.text}</div>
    </>);
  }
  if (e.type === "agent_spawn") {
    return row(<>
      <span className="caps" style={{ color: "var(--ink-4)" }}>spawn</span>
      <span style={{ color: "var(--ink-2)", marginLeft: 8 }}>{e.text}</span>
    </>);
  }
  if (e.type === "tool_started") {
    return row(<>
      <span className="caps" style={{ color: "var(--ink-4)" }}>tool · {e.tool}</span>
      <div style={{ color: "var(--ink-3)", marginTop: 2, fontSize: 11 }}>
        args <span style={{ color: "var(--ink-2)" }}>{JSON.stringify(e.args)}</span>
      </div>
    </>);
  }
  if (e.type === "tool_ok") {
    return row(<>
      <span className="caps" style={{ color: "var(--verdict-green)" }}>tool ok · {e.tool}</span>
      <div style={{ color: "var(--ink-2)", marginTop: 2 }}>{e.summary}</div>
    </>);
  }
  if (e.type === "llm_delta" || e.type === "llm_delta_group") {
    return row(<>
      <span className="caps" style={{ color: "var(--ink-4)" }}>draft</span>
      <div style={{
        marginTop: 4, color: "var(--ink)",
        fontFamily: "var(--f-sans)", fontSize: 13, lineHeight: 1.55,
        borderLeft: "2px solid var(--paper-edge)", paddingLeft: 10,
      }}>
        {e.text}
      </div>
    </>);
  }
  if (e.type === "evaluation") {
    return row(<>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <span className="caps" style={{ color: "var(--ink-4)" }}>verdict</span>
        <VerdictPill verdict={e.status} />
      </span>
      <div style={{
        marginTop: 4,
        fontFamily: "var(--f-sans)", fontSize: 13,
        color: "var(--ink)",
      }}>
        “{e.feedback}”
      </div>
    </>);
  }
  if (e.type === "debate") {
    const isPlanner = e.from === "commander";
    return row(<>
      <span className="caps" style={{ color: isPlanner ? "var(--k-yellow)" : "var(--k-blue)" }}>
        {isPlanner ? "▲ rebuts" : "○ insists"}
      </span>
      <div style={{
        marginTop: 4,
        fontFamily: "var(--f-display)", fontStyle: "italic",
        fontSize: 13.5, lineHeight: 1.5, color: "var(--ink-2)",
        paddingLeft: 10, borderLeft: "2px solid " + (isPlanner ? "var(--k-yellow)" : "var(--k-blue)"),
      }}>
        “{e.text}”
      </div>
    </>);
  }
  if (e.type === "graph_change") {
    return row(<>
      <span className="caps" style={{ color: "var(--k-red)" }}>graph · change</span>
      <div style={{ color: "var(--ink-2)", marginTop: 2 }}>{e.text}</div>
    </>);
  }
  if (e.type === "node_done") {
    return row(<>
      <span className="caps" style={{ color: "var(--verdict-green)" }}>node · done</span>
      <span style={{ color: "var(--ink-3)", marginLeft: 8 }}>{e.nodeId}</span>
    </>);
  }
  return row(<span>{e.type}</span>);
}

Object.assign(window, { EventStream });
