// Task Graph DAG — node shape encodes role (Kandinsky),
// layout is a hand-packed column grid (Swiss), edges are orthogonal.

const { useMemo: useMemoGraph } = React;

// Layout: positional columns by depth, rows hand-assigned for readability.
// Keeps it deterministic and Swiss — not a force-directed blob.
const NODE_W = 168;
const NODE_H = 54;
const COL_W = 220;
const ROW_H = 86;

function layoutNodes(nodes, edges) {
  // Longest-path layering
  const idTo = {};
  nodes.forEach(n => idTo[n.id] = { ...n, in: [], out: [], layer: 0 });
  edges.forEach(([a, b]) => {
    if (idTo[a] && idTo[b]) {
      idTo[a].out.push(b);
      idTo[b].in.push(a);
    }
  });

  // Assign layers by longest path from any root
  const order = [];
  const visited = new Set();
  function visit(id) {
    if (visited.has(id)) return;
    visited.add(id);
    for (const p of idTo[id].in) visit(p);
    const maxIn = idTo[id].in.reduce((m, p) => Math.max(m, idTo[p].layer + 1), 0);
    idTo[id].layer = maxIn;
    order.push(id);
  }
  nodes.forEach(n => visit(n.id));

  // Group by layer
  const layers = {};
  Object.values(idTo).forEach(n => {
    layers[n.layer] = layers[n.layer] || [];
    layers[n.layer].push(n);
  });

  const placed = [];
  Object.keys(layers).sort((a, b) => +a - +b).forEach(L => {
    const arr = layers[L];
    arr.forEach((n, i) => {
      placed.push({
        ...n,
        x: +L * COL_W + 20,
        y: i * ROW_H + 20 + (+L % 2 === 0 ? 0 : ROW_H / 2 - 6), // slight offset per column
      });
    });
  });

  const idToPlaced = {};
  placed.forEach(n => idToPlaced[n.id] = n);

  const width = Math.max(...placed.map(n => n.x + NODE_W)) + 20;
  const height = Math.max(...placed.map(n => n.y + NODE_H)) + 20;

  return { placed, idToPlaced, width, height };
}

function NodeShape({ role, size = 20 }) {
  if (role === "commander") return <Triangle size={size} fill="var(--k-yellow)" />;
  if (role === "supervisor") return <Circle size={size} fill="var(--k-blue)" />;
  return <Square size={size} fill="var(--k-red)" />;
}

function GraphNode({ n, highlight }) {
  const active = n.status === "active";
  const done = n.status === "done";
  const added = n.added;
  return (
    <g transform={`translate(${n.x}, ${n.y})`}>
      {added && (
        <rect x={-6} y={-6} width={NODE_W + 12} height={NODE_H + 12}
          fill="none" stroke="var(--k-red)" strokeWidth="1" strokeDasharray="2 3" />
      )}
      <rect
        x={0} y={0} width={NODE_W} height={NODE_H}
        fill={done ? "var(--paper-2)" : "var(--paper)"}
        stroke={active ? "var(--ink)" : "var(--ink-4)"}
        strokeWidth={active ? 2 : 1}
      />
      {active && (
        <rect x={0} y={NODE_H - 3} width={NODE_W} height={3} fill="var(--k-red)">
          <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite" />
        </rect>
      )}
      <foreignObject x={10} y={8} width={NODE_W - 20} height={NODE_H - 16}>
        <div xmlns="http://www.w3.org/1999/xhtml" style={{
          display: "flex", flexDirection: "column", gap: 4,
          fontFamily: "var(--f-sans)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <NodeShape role={n.role} size={12} />
            <span className="mono" style={{ fontSize: 9.5, color: "var(--ink-4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {n.id}
            </span>
            <span style={{ marginLeft: "auto" }}>
              <NodeStatusDot status={n.status} />
            </span>
          </div>
          <div style={{
            fontSize: 11.5, color: done ? "var(--ink-3)" : "var(--ink)",
            lineHeight: 1.25,
            textDecoration: done ? "line-through" : "none",
            textDecorationThickness: 1,
          }}>
            {n.title}
          </div>
        </div>
      </foreignObject>
    </g>
  );
}

function NodeStatusDot({ status }) {
  const color =
    status === "active" ? "var(--k-red)" :
    status === "done" ? "var(--verdict-green)" :
    status === "blocked" ? "var(--k-yellow)" :
    "var(--ink-5)";
  return <span style={{
    display: "inline-block", width: 7, height: 7, borderRadius: "50%",
    background: color, boxShadow: status === "active" ? "0 0 0 3px rgba(200,52,43,0.18)" : "none",
  }} />;
}

function orthoPath(a, b) {
  const x1 = a.x + NODE_W, y1 = a.y + NODE_H / 2;
  const x2 = b.x,          y2 = b.y + NODE_H / 2;
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} L ${mx} ${y1} L ${mx} ${y2} L ${x2} ${y2}`;
}

function TaskGraphSVG({ nodes, edges, title, added = [] }) {
  const { placed, idToPlaced, width, height } = useMemoGraph(() => layoutNodes(nodes, edges), [nodes, edges]);

  return (
    <div style={{ position: "relative", overflow: "auto", background: "var(--paper)", border: "1px solid var(--ink)" }}>
      <div className="swiss-label" style={{ margin: 0, padding: "10px 16px", borderBottom: "1px solid var(--ink)", borderTop: 0 }}>
        <span className="k">task graph · live</span>
        <span className="v">{nodes.length} nodes · {edges.length} edges</span>
      </div>
      <svg width={Math.max(width, 800)} height={Math.max(height, 360)} style={{ display: "block", background: "var(--paper)" }}>
        {/* Baseline grid */}
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="0" cy="0" r="0.6" fill="var(--ink-5)" />
          </pattern>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink-3)" />
          </marker>
          <marker id="arrow-added" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--k-red)" />
          </marker>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.6" />

        {/* Edges */}
        {edges.map(([a, b], i) => {
          const A = idToPlaced[a], B = idToPlaced[b];
          if (!A || !B) return null;
          const isAdded = added.some(([x, y]) => x === a && y === b);
          return (
            <path key={i}
              d={orthoPath(A, B)}
              fill="none"
              stroke={isAdded ? "var(--k-red)" : "var(--ink-3)"}
              strokeWidth={isAdded ? 1.5 : 1}
              strokeDasharray={isAdded ? "3 3" : "0"}
              markerEnd={isAdded ? "url(#arrow-added)" : "url(#arrow)"}
            />
          );
        })}

        {/* Nodes */}
        {placed.map(n => <GraphNode key={n.id} n={n} />)}
      </svg>

      {/* Legend */}
      <div style={{
        display: "flex", gap: 18, alignItems: "center",
        padding: "8px 16px",
        borderTop: "1px solid var(--paper-edge)",
        fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ink-3)",
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Triangle size={10} /> planner
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Square size={10} /> doer
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Circle size={10} /> reviewer
        </span>
        <span style={{ marginLeft: "auto" }}>— roles</span>
      </div>
    </div>
  );
}

Object.assign(window, { TaskGraphSVG });
