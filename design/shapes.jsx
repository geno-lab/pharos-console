// Kandinsky agent shapes: yellow △ commander, red ■ worker, blue ○ supervisor.
// Exported globally for other Babel scripts.

const { useMemo } = React;

function Triangle({ size = 16, fill = "var(--k-yellow)", stroke = "var(--ink)" }) {
  const h = size * 0.88;
  return (
    <svg width={size} height={h} viewBox={`0 0 ${size} ${h}`} style={{ display: "block" }}>
      <polygon
        points={`${size / 2},1 ${size - 1},${h - 1} 1,${h - 1}`}
        fill={fill} stroke={stroke} strokeWidth="1"
      />
    </svg>
  );
}

function Square({ size = 14, fill = "var(--k-red)", stroke = "var(--ink)" }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <rect x="0.5" y="0.5" width={size - 1} height={size - 1}
        fill={fill} stroke={stroke} strokeWidth="1" />
    </svg>
  );
}

function Circle({ size = 14, fill = "var(--k-blue)", stroke = "var(--ink)" }) {
  const r = (size - 1) / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill={fill} stroke={stroke} strokeWidth="1" />
    </svg>
  );
}

// Public-facing labels — internal role names (commander/worker/supervisor) are not surfaced.
function AgentStamp({ role, size, label }) {
  const spec = {
    commander:  { Shape: Triangle, color: "var(--k-yellow)", name: "planner" },
    worker:     { Shape: Square,   color: "var(--k-red)",    name: "agent" },
    supervisor: { Shape: Circle,   color: "var(--k-blue)",   name: "reviewer" },
    user:       { Shape: null,     color: "var(--ink)",      name: "you" },
  }[role] || { Shape: Square, color: "var(--ink)", name: "agent" };

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      {spec.Shape ? <spec.Shape size={size || 14} fill={spec.color} /> :
        <span style={{
          width: size || 14, height: size || 14, border: "1px solid var(--ink)",
          background: "var(--paper)", display: "inline-block"
        }} />}
      {label && <span className="caps" style={{ color: "var(--ink-3)" }}>{spec.name}</span>}
    </span>
  );
}

// Verdict pill — uses Kandinsky palette on verdicts.
function VerdictPill({ verdict }) {
  const map = {
    GREEN:  { bg: "transparent", fg: "var(--verdict-green)", label: "green", mark: "●" },
    YELLOW: { bg: "var(--k-yellow)", fg: "var(--ink)", label: "yellow", mark: "▲" },
    RED:    { bg: "var(--k-red)", fg: "white", label: "red", mark: "■" },
  }[verdict] || { bg: "transparent", fg: "var(--ink-3)", label: verdict, mark: "·" };

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "2px 8px",
      background: map.bg,
      color: map.fg,
      border: "1px solid currentColor",
      fontFamily: "var(--f-mono)", fontSize: 10.5,
      textTransform: "uppercase", letterSpacing: "0.12em",
      lineHeight: 1.4,
    }}>
      <span style={{ fontSize: 10 }}>{map.mark}</span>{map.label}
    </span>
  );
}

Object.assign(window, { Triangle, Square, Circle, AgentStamp, VerdictPill });
