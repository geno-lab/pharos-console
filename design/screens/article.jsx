// Article — full-width PDF-style view. Renamed stage: "writing" (not "compile").
// Figure workbench becomes a small collapsible inline strip, not a sidebar.

const { useState: useStateArt, useEffect: useEffectArt } = React;

function ArticleScreen({ topic, phase, onBack, branch }) {
  const writing = phase === "writing";
  const [step, setStep] = useStateArt(0);
  const [figuresOpen, setFiguresOpen] = useStateArt(true);

  useEffectArt(() => {
    if (!writing) return;
    const id = setInterval(() => setStep(s => Math.min(5, s + 1)), 700);
    return () => clearInterval(id);
  }, [writing]);

  return (
    <div className="screen-pad-tight">
      <RunHeader topic={topic} branch={branch}
        phase={writing ? "writing · in progress" : "done · article"} />

      {/* Toolbar */}
      <div className="article-toolbar" style={{
        marginTop: 18,
        padding: "10px 16px",
        border: "1px solid var(--ink)",
        background: "var(--paper-2)",
        fontFamily: "var(--f-mono)", fontSize: 11,
      }}>
        <span className="caps" style={{ color: "var(--ink-3)", whiteSpace: "nowrap" }}>
          {writing ? "§ V · writing" : "§ V · article"}
        </span>
        <span className="article-toolbar-stats" style={{ color: "var(--ink-4)" }}>
          {writing ? `pass ${Math.min(step, 5)} / 5 · draft.revise → latex.write → bibtex → pdflatex × 2` : "routing-prior.pdf · 6 pp · 342 kb · 4 figures"}
        </span>
        <div className="article-toolbar-actions">
          <button onClick={() => setFiguresOpen(v => !v)}
            className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }}>
            {figuresOpen ? "▾" : "▸"} figures
          </button>
          {!writing && (
            <>
              <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }}>↓ .tex</button>
              <button className="btn" style={{ padding: "4px 10px", fontSize: 11 }}>↓ .pdf</button>
            </>
          )}
          <button onClick={onBack} className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }}>
            ← run
          </button>
        </div>
      </div>

      {/* Collapsible figure strip — small thumbnails, inline */}
      {figuresOpen && <FigureStrip writing={writing} />}

      {/* Full-width PDF canvas */}
      <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
        {writing ? <WritingProgress step={step} /> : <PDFPage />}
      </div>
    </div>
  );
}

function FigureStrip({ writing }) {
  const figs = [
    { id: "fig-1", label: "4-pane bar", state: writing ? "drawing" : "done" },
    { id: "fig-2", label: "heatmap", state: writing ? "drawing" : "done" },
    { id: "fig-3", label: "loss curves", state: writing ? "queued" : "done" },
    { id: "fig-4", label: "schematic", state: writing ? "drawing" : "done" },
  ];
  return (
    <div style={{
      borderLeft: "1px solid var(--ink)", borderRight: "1px solid var(--ink)",
      borderBottom: "1px solid var(--ink)",
      display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
      background: "var(--paper-2)",
    }} className="article-figstrip">
      {figs.map((f, i) => (
        <div key={f.id} style={{
          padding: 10,
          borderRight: i < 3 ? "1px solid var(--paper-edge)" : 0,
          display: "flex", gap: 12, alignItems: "center",
        }}>
          <div style={{ width: 72, height: 44, background: "var(--paper)", border: "1px solid var(--paper-edge)", flex: "none" }}>
            <svg viewBox="0 0 100 60" width="100%" height="100%" preserveAspectRatio="none">
              {f.id === "fig-1" && [0,1,2,3].map(i => <rect key={i} x={i*22+8} y={60-(20+i*6)} width="10" height={20+i*6} fill="var(--ink)" />)}
              {f.id === "fig-2" && Array.from({length: 20}).map((_, i) => (
                <rect key={i} x={(i%5)*18+5} y={Math.floor(i/5)*12+4} width="16" height="10"
                  fill={`rgba(200,52,43,${(i%5)*0.22})`} />
              ))}
              {f.id === "fig-3" && <polyline points="2,50 20,36 40,28 60,22 80,20 98,19" fill="none" stroke="var(--k-red)" strokeWidth="1.4" />}
              {f.id === "fig-4" && (
                <>
                  <rect x="8" y="18" width="20" height="20" fill="var(--k-yellow)" stroke="var(--ink)" />
                  <circle cx="55" cy="28" r="10" fill="var(--k-blue)" stroke="var(--ink)" />
                  <polygon points="78,40 94,40 86,18" fill="var(--k-red)" stroke="var(--ink)" />
                </>
              )}
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="mono" style={{ fontSize: 11, fontWeight: 600 }}>{f.id}</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>{f.label}</div>
            <div className="mono" style={{ fontSize: 9.5,
              color: f.state === "done" ? "var(--verdict-green)" :
                     f.state === "queued" ? "var(--ink-4)" : "var(--k-red)",
              marginTop: 2,
            }}>{f.state}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function WritingProgress({ step }) {
  const steps = [
    { t: "00:00.02", label: "draft.revise — prose cleanup" },
    { t: "00:03.41", label: "latex.write — assemble document" },
    { t: "00:06.12", label: "bibtex — resolve 14 references" },
    { t: "00:08.70", label: "pdflatex — pass 1 of 3" },
    { t: "00:12.04", label: "pdflatex — pass 2 & 3 of 3" },
  ];
  return (
    <div style={{
      width: "100%", maxWidth: 920, minHeight: 600,
      border: "1px solid var(--ink)",
      background: "var(--paper)",
      padding: "clamp(32px, 5vw, 56px) clamp(22px, 5vw, 72px)",
    }}>
      <div className="display" style={{ fontSize: 32, lineHeight: 1.2, color: "var(--ink)", marginBottom: 8 }}>
        The paper is being written.<span className="caret" />
      </div>
      <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 18, color: "var(--ink-3)", marginBottom: 40 }}>
        PDF is not live — it will appear here when the last pass completes.
      </div>

      <div style={{ display: "grid", gap: 12, marginBottom: 40 }}>
        {steps.map((s, i) => {
          const state = i < step ? "done" : i === step ? "active" : "pending";
          return (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "76px 14px 1fr auto", gap: 14,
              padding: "10px 0",
              borderBottom: "1px dashed var(--paper-edge)",
              fontFamily: "var(--f-mono)", fontSize: 13,
              opacity: state === "pending" ? 0.35 : 1,
              transition: "opacity 300ms var(--ease-paper)",
            }}>
              <span style={{ color: "var(--ink-4)", fontSize: 11 }}>{s.t}</span>
              <span style={{ color: state === "active" ? "var(--k-red)" : "var(--ink)" }}>
                {state === "done" ? "✓" : state === "active" ? "▸" : "·"}
              </span>
              <span style={{ color: state === "active" ? "var(--k-red)" : "var(--ink)" }}>{s.label}</span>
              <span style={{ color: "var(--ink-4)", fontSize: 11 }}>
                {state === "done" ? "ok" : state === "active" ? "running…" : "queued"}
              </span>
            </div>
          );
        })}
      </div>

      <pre style={{
        margin: 0, padding: 16,
        background: "var(--paper-2)", border: "1px solid var(--paper-edge)",
        fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ink-3)",
        whiteSpace: "pre-wrap", lineHeight: 1.5,
      }}>
{`> This is pdfTeX, Version 3.141592653-2.6-1.40.26
> (./paper.tex LaTeX2e <2023-11-01>)
> [1] [2] [3] [4] [5] [6]
> Output: paper.pdf, 6 pages, 342kB.`}
      </pre>
    </div>
  );
}

// Full-width PDF simulation
function PDFPage() {
  return (
    <div style={{
      width: "100%", maxWidth: 920,
      background: "var(--paper)",
      border: "1px solid var(--ink)",
      boxShadow: "4px 4px 0 var(--paper-edge)",
      padding: "clamp(28px, 6vw, 72px) clamp(20px, 6vw, 88px) clamp(32px, 6vw, 88px)",
      fontFamily: "Georgia, 'EB Garamond', serif",
      color: "var(--ink)",
      lineHeight: 1.55,
    }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.3 }}>
          A Content-Routing Prior as a Standalone Baseline<br/>
          for Long-Context Attention
        </div>
        <div style={{ fontSize: 12, marginTop: 12, fontStyle: "italic", color: "var(--ink-3)" }}>
          Pharos Agent · r-1043 · April 2026
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, color: "var(--ink-3)" }}>Abstract</div>
      <div style={{ fontSize: 12.5, fontStyle: "italic", color: "var(--ink-2)", marginBottom: 26, maxWidth: 620, margin: "0 auto 26px" }}>
        We ask whether a learned content-routing prior, introduced as a soft mixing weight over standard
        softmax attention, can substitute for top-<i>k</i> sparse attention in the 32–128k context regime.
        We construct an isolated baseline and evaluate on a six-task retrieval suite. The prior matches
        sparse attention on needle-in-haystack and variable-tracking, trails by 3.4 points on multi-hop,
        and surpasses it by 6.1 on distractor-dense aggregation.
      </div>

      <div style={{ columnCount: "auto", columnWidth: 260, columnGap: 28, fontSize: 12, textAlign: "justify" }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, breakAfter: "avoid" }}>1 &nbsp; Setup</div>
        <p style={{ marginTop: 0 }}>
          Let <i>q<sub>i</sub></i> ∈ ℝ<sup>d</sup> be the query at position <i>i</i>. We define the content
          prior π(j | q<sub>i</sub>) = softmax(⟨W<sub>π</sub> q<sub>i</sub>, φ(k<sub>j</sub>)⟩ / τ) and
          mix (1−λ)·π + λ·softmax(qk/√d) per head. Temperature τ is annealed linearly from 2.0 to 0.5 over
          the first 20% of training; λ is learned from step 0.
        </p>

        <div style={{ fontSize: 14, fontWeight: 700, margin: "12px 0 8px", breakAfter: "avoid" }}>2 &nbsp; Evaluation</div>
        <p>
          The harness covers needle-in-haystack, variable-tracking, multi-hop retrieval, aggregation, code-span
          lookup, and a distractor-density stress task. Seeds are fixed at {"{11, 23, 47}"} for all reported
          runs. Context lengths are 32k and 128k.
        </p>

        <div style={{ breakInside: "avoid-column", margin: "14px 0" }}>
          <div style={{ border: "1px solid var(--ink)" }}>
            <svg viewBox="0 0 200 90" width="100%" height="100" preserveAspectRatio="none">
              {[0,1,2,3].map(g => (
                <g key={g} transform={`translate(${g*50}, 0)`}>
                  <rect x={12} y={90 - (38 + (g===3 ? 10 : g===2 ? -6 : 0))} width="10" height={38 + (g===3 ? 10 : g===2 ? -6 : 0)} fill="var(--ink)" />
                  <rect x={25} y={90 - (32 + (g===3 ? 16 : g===2 ? -10 : 0))} width="10" height={32 + (g===3 ? 16 : g===2 ? -10 : 0)} fill="var(--k-red)" />
                </g>
              ))}
              <line x1="0" y1="89" x2="200" y2="89" stroke="var(--ink)" strokeWidth="0.6" />
            </svg>
          </div>
          <div style={{ fontSize: 10.5, fontStyle: "italic", color: "var(--ink-3)", padding: "4px 0" }}>
            Figure 1. Accuracy by task (a)–(d). Black = top-<i>k</i> sparse, red = routing prior.
          </div>
        </div>

        <div style={{ fontSize: 14, fontWeight: 700, margin: "12px 0 8px", breakAfter: "avoid" }}>3 &nbsp; Results</div>
        <p>
          Figure 1 plots accuracy across the six-task retrieval suite at 32k and 128k contexts. The routing
          prior is within noise of top-<i>k</i> sparse on four tasks, below on multi-hop, and materially
          above on distractor-dense aggregation.
        </p>
        <p>
          We interpret the gap on multi-hop as the prior's inability to chain across retrieved spans without
          an explicit iteration mechanism. The distractor-dense win is consistent with the prior acting as
          a learned denoiser over irrelevant positions.
        </p>

        <div style={{ fontSize: 14, fontWeight: 700, margin: "12px 0 8px", breakAfter: "avoid" }}>4 &nbsp; Discussion</div>
        <p>
          The prior is cheap — one small matrix per head — and composable with either softmax or top-<i>k</i>
          attention. In practice we recommend pairing it with top-<i>k</i> at retrieval tasks where chains of
          reasoning matter, and using it standalone where distractor density dominates error.
        </p>
      </div>

      <div style={{ marginTop: 32, borderTop: "1px solid var(--paper-edge)", paddingTop: 10, fontSize: 10, fontFamily: "var(--f-mono)", color: "var(--ink-4)", display: "flex", justifyContent: "space-between" }}>
        <span>routing-prior.pdf</span>
        <span>page 1 of 6</span>
      </div>
    </div>
  );
}

Object.assign(window, { ArticleScreen });
