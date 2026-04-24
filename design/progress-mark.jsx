// § Progress — three modes (minimal / roman / tree), exposed via Tweaks.
// Handles the "pretext-style text animation" vibe: steps arrive via monospace typewriter.

const { useEffect: useEffectProg, useState: useStateProg, useRef: useRefProg } = React;

const ROMAN = ["0","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX"];
const romanOf = (n) => ROMAN[n] || String(n);

function useTypewriter(text, speed = 18, active = true) {
  const [out, setOut] = useStateProg("");
  const ref = useRefProg(null);
  useEffectProg(() => {
    if (!active) { setOut(text); return; }
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    ref.current = id;
    return () => clearInterval(id);
  }, [text, active, speed]);
  return out;
}

function ProgressMark({ mode = "minimal", current = 0, total = 0, steps = [], currentTitle = "" }) {
  if (mode === "minimal") {
    return (
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, fontFamily: "var(--f-mono)", fontSize: 11 }}>
        <span className="section-mark" style={{ fontSize: 18, lineHeight: 1, transform: "translateY(2px)" }}>§</span>
        <span className="num">{String(current).padStart(2, "0")} <span style={{ color: "var(--ink-4)" }}>/</span> {String(total).padStart(2, "0")}</span>
        <div style={{
          position: "relative", width: 140, height: 2, background: "var(--ink-5)",
          marginLeft: 6,
        }}>
          <div style={{
            position: "absolute", inset: 0, width: `${total ? (current / total) * 100 : 0}%`,
            background: "var(--ink)", transition: "width 320ms var(--ease-paper)",
          }} />
        </div>
        {currentTitle && <span style={{ color: "var(--ink-3)", fontFamily: "var(--f-sans)" }}>— {currentTitle}</span>}
      </div>
    );
  }

  if (mode === "roman") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span className="section-mark" style={{ fontSize: 22, lineHeight: 1 }}>§</span>
        <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 20 }}>
          {romanOf(current)}
        </span>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-4)" }}>
          · of · {romanOf(total)}
        </span>
        <div style={{ display: "flex", gap: 3, marginLeft: 8 }}>
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} style={{
              width: 14, height: 2,
              background: i < current ? "var(--ink)" : i === current ? "var(--k-red)" : "var(--ink-5)",
            }} />
          ))}
        </div>
        {currentTitle && <span style={{ color: "var(--ink-3)", fontSize: 13 }}>— {currentTitle}</span>}
      </div>
    );
  }

  // tree
  return (
    <div style={{ fontFamily: "var(--f-mono)", fontSize: 11.5, lineHeight: 1.6 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
        <span className="section-mark" style={{ fontSize: 16, lineHeight: 1 }}>§</span>
        <span style={{ color: "var(--ink-3)" }}>progress · tree</span>
      </div>
      {steps.map((s, i) => {
        const state = i < current ? "done" : i === current ? "active" : "pending";
        const mark = state === "done" ? "✓" : state === "active" ? "▸" : "·";
        const color = state === "done" ? "var(--ink)" : state === "active" ? "var(--k-red)" : "var(--ink-4)";
        return (
          <div key={s.id || i} style={{ color, paddingLeft: (s.depth || 0) * 16 }}>
            <span style={{ opacity: 0.5 }}>{String(i + 1).padStart(2, "0")}</span>
            {" "}{mark}{" "}
            <span style={{ textDecoration: state === "done" ? "line-through" : "none", textDecorationThickness: 1 }}>
              {s.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { ProgressMark, useTypewriter, romanOf });
