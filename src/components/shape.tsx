import type { AgentRole, Verdict } from "../bindings";

interface ShapeProps {
  size?: number;
}

export function Triangle({ size = 14 }: ShapeProps) {
  const h = size * 0.88;
  return (
    <svg width={size} height={h} viewBox={`0 0 ${size} ${h}`} style={{ display: "block" }}>
      <polygon
        points={`${size / 2},1 ${size - 1},${h - 1} 1,${h - 1}`}
        fill="var(--k-yellow)"
        stroke="var(--ink)"
        strokeWidth="1"
      />
    </svg>
  );
}

export function Square({ size = 13 }: ShapeProps) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <rect x="0.5" y="0.5" width={size - 1} height={size - 1} fill="var(--k-red)" stroke="var(--ink)" strokeWidth="1" />
    </svg>
  );
}

export function Circle({ size = 13 }: ShapeProps) {
  const r = (size - 1) / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="var(--k-blue)" stroke="var(--ink)" strokeWidth="1" />
    </svg>
  );
}

interface StampProps {
  role: AgentRole;
  size?: number;
}

export function AgentStamp({ role, size = 13 }: StampProps) {
  switch (role) {
    case "commander":
      return <Triangle size={size} />;
    case "worker":
      return <Square size={size} />;
    case "tactical_evaluator":
    case "strategic_reviewer":
      return <Circle size={size} />;
    case "skill_scout":
      return (
        <span
          style={{
            width: size,
            height: size,
            border: "1px solid var(--ink)",
            background: "var(--paper)",
            display: "inline-block",
          }}
        />
      );
  }
}

interface VerdictPillProps {
  verdict: Verdict;
}

export function VerdictPill({ verdict }: VerdictPillProps) {
  const style = {
    GREEN: { bg: "transparent", fg: "var(--verdict-green)", mark: "●" },
    YELLOW: { bg: "var(--k-yellow)", fg: "var(--ink)", mark: "▲" },
    RED: { bg: "var(--k-red)", fg: "white", mark: "■" },
  }[verdict];

  return (
    <span
      className="verdict-pill"
      style={{ background: style.bg, color: style.fg, borderColor: "currentColor" }}
    >
      <span style={{ fontSize: 10 }}>{style.mark}</span>
      {verdict.toLowerCase()}
    </span>
  );
}
