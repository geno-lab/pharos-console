# Handoff: Pharos — a notebook UI for research agents

## Overview

**Pharos** is a human-facing console for running, monitoring, and collecting the output of long-running research agents. A user gives Pharos a topic or a task; a **commander** agent clarifies scope, plans a task graph, dispatches **workers** in parallel, collects **supervisor** verdicts on each result, decides whether to extend the graph or conclude, and finally calls a `latex.write` skill that produces a publishable article.

The UI is shaped as a **lab notebook** crossed with a **Swiss grid** — evidence cards taped onto a ruled paper canvas, margin numbering with `§` section marks, monospace metadata, constructivist diagonals on run headers, and Kandinsky-derived **△ ■ ○** shape stamps that identify agent roles (commander / worker / supervisor) and verdict colors (red / yellow / green).

The product has five primary states on a single canvas:

1. **empty** — give me a topic or a task
2. **clarify** — commander asks structured questions; the user's answers can open a branch
3. **plan** — commander proposes a task DAG; user confirms or revises
4. **run-live** — DAG executes, events stream in, supervisor verdicts appear inline
5. **article** — final compiled LaTeX article with figures panel and in-progress compile view

A left **drawer** holds three text-rich indices: **skills** (capabilities the commander can invoke), **runs** (historical + in-progress), **drafts** (saved articles).

---

## About the Design Files

The files bundled here are **HTML/JSX design references**, not production source. They run in a browser via Babel standalone for rapid prototyping — they are not how you should ship this UI.

Your task is to **recreate these designs in the target codebase's existing environment** (React, Vue, SwiftUI, etc.), using its established patterns, component library, state management, routing, and styling system. If there is no existing environment yet, choose an appropriate framework (Next.js + CSS modules + a real state store like Zustand or Redux Toolkit is a sensible baseline for an agent console of this complexity).

Critical rules during re-implementation:
- **Do not copy the mock data module** (`mock-data.jsx`) — wire the real event bus / agent backend.
- **Do not use the Babel-in-browser script tags** — use a proper bundler.
- **Do not import tokens.css verbatim** — translate the CSS custom properties into your design system's token layer (Tailwind config, Stitches theme, styled-components ThemeProvider, etc.).
- **Do port the visual language faithfully** — typography, color, shape-stamp grammar, Swiss-label pattern, taped evidence card, diagonal-band accent — these are the product's identity.

---

## Fidelity

**High fidelity.** Final colors, typography, spacing, motion, and interactions are all committed. Recreate pixel-perfectly. The only intentional placeholders are:

- Fonts fall back to Google's **Fraunces / Inter / JetBrains Mono** because the production faces (**GT Alpina Standard / Söhne / Söhne Mono**) require licensing. The `--f-display / --f-sans / --f-mono` variables are structured so you can swap the license the client holds.
- The compiled PDF article is a **typeset mockup** inside HTML. The production build must shell out to a real `pdflatex` worker and stream its compile log.
- Fourth-pane figures (`fig-1` … `fig-4`) are rendered as CSS-drawn placeholders (bar chart, heatmap grid, loss curve, block diagram). Production will receive real matplotlib/TikZ figures from the agent.

---

## Screens / Views

All screens render inside a common shell: a sticky **top rail** (drawer toggle · brand · state stepper · queue chip · new-task button), an optional slide-in **left drawer**, and a main canvas that paints the active screen.

### 0. Shell — top rail & drawer

- **Top rail** — 44px tall, `background: var(--paper)`, `border-bottom: 1px solid var(--paper-edge)`, `position: sticky; top: 0; z-index: 20`. Layout is flex, `nowrap`, `overflow: hidden`, with a `.spacer { flex: 1 }` pushing right-side actions to the edge.
    - Items (L→R): `§ notebook` toggle → `pharos` display italic + `r-{id} · active` mono → state stepper (`§01 §02 §03 §04`) → **spacer** → `QUEUE +2` dashed chip → `↺ new task` button.
    - Breakpoints: `≤1180px` drop queue chip · `≤1024px` drop stepper · `≤720px` drop brand label.
- **Drawer** — 320px wide, slides in from the left, pushes main content via `padding-left` transition (`340ms` `cubic-bezier(.2,.7,.2,1)`). On mobile it overlays at `min(360px, 100vw)`.
    - Three tabs: **skills** (with Kandinsky stamps per category), **runs** (list with R-id, topic, status dot), **drafts** (article titles + pp count).
    - `[ esc ]` dismiss pill in the top-left corner of the drawer.

### 1. Empty state (`empty`)

- Canvas: paper background, centered column `max-width: 960px`.
- **Masthead**: `§ pharos` at `clamp(56px, 8vw, 96px)`, italic Fraunces. Under it, `v0.4 · a notebook for research agents` in mono.
- **Role strip** beneath masthead (3 rows, mono, `--ink-4`): `— plans —` / `— executes —` / `— reviews · debates · re-plans —` with localhost status `· pharosd idle` at the end.
- **`§ I · GIVE ME A TOPIC OR A TASK`** caps label.
- **Mode tabs**: pair of segmented buttons — `topic — I'll discover sub-tasks` / `task — I'll do exactly this`. Active tab has `background: var(--ink)`, `color: var(--paper)`.
- **Textarea**: `min-height: 240px`, placeholder italic Fraunces example text, `border: 1px solid var(--ink)`, `padding: 28px 32px`, `background: var(--paper)`, no focus ring outline (use `border-color` change).
- **Submit**: full-width `.btn` at bottom-right of the textarea, label `discover →` or `execute →` depending on mode.

### 2. Clarify (`clarify`)

- **Run header** (reused across clarify / plan / live / article) — three-column grid `auto | 1fr | auto`:
    - Left: `RUN · R-1043` mono caps + `opened {time}` mono 10.5px
    - Center: `TOPIC` caps label + topic display italic `20px`, `textWrap: balance`
    - Right: `PHASE` caps label + phase value mono `whiteSpace: nowrap`
    - `≤760px` collapses to single-column stack; phase aligns left.
    - If a branch exists, `<div class="diagonal-band">` paints the constructivist diagonal stripe across the header, and a branch-switch lane appears at the bottom (`main` · `branch-long` buttons, mono, with a green/red dot).
- **Main column**: `§ II · CLARIFICATION` caps → italic Fraunces lede *"Narrowing the scope before the graph is drawn."*
- **Turns**: each clarification turn is a block:
    - **△ ASKS q{n}** with the yellow triangle stamp + caps label + mono q-number.
    - Question body in sans, 15–16px.
    - **Options** listed as `□ (a) label — regime note`, monospace prefix, sans label. Selected option shows a `DEFAULT` yellow pill at the right.
    - Small em-dash italic note: `— I'll default to (b) unless you say otherwise; (c) changes the eval harness.`
- **Sidebar** (280px right rail): `expected output` caps label + italic explanation + a mini `RunStatus.branches` binding schema (mono block).
- **Divergence rule**: if the user picks an option that contradicts the default, a **branch** is opened. The branch lane animates in under the run header.

### 3. Plan confirm (`plan`)

- Run header reused (phase = `plan · awaiting confirm`).
- **`.section-header-strip`**: `§ III · INITIAL TASK GRAPH` caps + mono stats (`8 nodes · 8 edges · 3 in parallel`) + two actions on the right: `← revise answers` and `execute graph →` (primary).
    - `≤760px` actions become full-width 1fr/1fr flex-children.
- **TaskGraphSVG** — a top-down DAG, ~900×420:
    - Nodes are squares (`.node`) sized to fit `N{id}` + title. Fill is `--paper`, stroke is `--ink`.
    - **Shape stamp** top-left of each node: △ yellow for commander nodes, ■ red for worker, ○ blue for supervisor gate.
    - **Verdict indicator** top-right dot: green/yellow/red/gray.
    - Edges are right-angle polylines, `stroke: var(--ink)`, `stroke-width: 1`, with a small arrowhead marker. Parallel workers under a supervisor are drawn as a fan.
    - Horizontal scrolls inside its container on narrow screens (don't try to scale the DAG — it becomes unreadable).
- Below the DAG, a two-column `col-1fr-320`:
    - Left: `△ notes` — italic Fraunces editorial paragraph from the commander.
    - Right sidebar (taped evidence card): `expected output` — what the final artifact is expected to be, with a `<VerdictPill verdict="RED">` inline explaining the fallback if the supervisor gate returns red.

### 4. Run live (`run-live`)

- Run header; phase = `executing` → `reviewing` → `extending` → `writing` → `done`.
- Main grid `col-1fr-440` (main 1fr + rail 440px):
    - **Main column top**: the live TaskGraphSVG with node states animating. Active nodes pulse, done nodes get green verdicts, failed nodes get red + dashed red borders on subsequently-extended nodes. Extension appends 3 deeper nodes when the commander decides to go deeper.
    - **Main column bottom**: `§ IV · EVENT STREAM` — a scrolling monospace feed of typed events. Each event is a `.paperfade`-animated row: timestamp · event-type · payload summary. Two density modes: **grouped** (collapse adjacent same-node events) and **firehose** (every event, no collapsing).
    - **Rail column**: context panel (seed, doer count, parallelism), a timeline summary, and when `phase === "reviewing"` a **commander decision** prompt: `extend graph` (adds 3 nodes) vs `write article` (jumps to writing).
- At the bottom of the main column, a **phase narrator** in italic Fraunces lede tells the user what's happening: *"Extending graph with 3 deeper nodes."* / *"Calling latex.write — compiling article."*

### 5. Article (`article` — writing or done)

- Run header; phase = `writing · in progress` or `done · article`.
- **`.article-toolbar`** flex row:
    - Left: `§ V · article` (or `§ V · writing`) caps label.
    - Middle: stats — `routing-prior.pdf · 6 pp · 342 kb · 4 figures` (or `pass {n}/5 · draft.revise → latex.write → bibtex → pdflatex × 2` during writing).
    - Right: `▸/▾ figures`, `↓ .tex`, `↓ .pdf`, `← run`.
    - `≤760px` stats drop to own row below, buttons become equal-flex row.
- **Figure strip** (collapsible): 4-column grid of figure thumbnails, each with id, label, status (`drawing` / `queued` / `done`). `≤900px` → 2 col, `≤520px` → 1 col.
- **PDF page** or **WritingProgress**:
    - When writing: a mock compile log panel with 5 passes, each step ticking from `queued` → `running…` → `ok`. Figures render progressively as they finish.
    - When done: an actual typeset article page — wide margins, two columns (`columnCount: 2`, `columnGap: 28px`), a title in bold display, authors in mono, abstract in italic with a hanging indent, body paragraphs, and the four rendered figures as `<figure>` elements with captions. Page paper has `box-shadow: 0 1px 0 var(--paper-edge), 0 20px 40px -20px rgba(0,0,0,0.15)`.

---

## Interactions & Behavior

### State machine

```
empty ──(submit topic)──▶ clarify
clarify ──(confirm answers)──▶ plan
clarify ──(pick alt option)──▶ clarify + branch
plan ──(revise)──▶ clarify
plan ──(execute)──▶ run-live (phase: executing)
run-live:executing ──(all nodes done)──▶ run-live:reviewing
run-live:reviewing ──(extend)──▶ run-live:extending ──▶ run-live:executing (with extended graph)
run-live:reviewing ──(write)──▶ run-live:writing ──▶ article
article ──(← run)──▶ run-live:done
```

### Transitions and timing

- Drawer slide: `transform: translateX(...)` + `padding-left` on main, `340ms cubic-bezier(.2, .7, .2, 1)`.
- Event stream entries: `.paperfade` — `from { opacity: 0; translateY(4px); } to { opacity: 1; translateY(0); }`, `260ms`.
- Taped evidence card entry: `.tapedrop` — `420ms` from `translateY(-6px) rotate(-0.6deg)` to `rotate(-0.2deg)`.
- Typewriter caret: `.caret::after` blinking block character (`▍`), `--k-red`, `1s steps(1, end) infinite`.
- Button hover: `translate(-1px, -1px) + box-shadow 3px 3px 0 --ink-5`, `140ms`.
- Mock event stream interval: **900ms** between events in live run.

### Keyboard

- `⌘K` / `Ctrl+K` opens the drawer (reserved — wire to command palette when the drawer grows one).
- `Esc` dismisses drawer.
- `←/→` navigate between adjacent state steps via the stepper buttons.

### Responsive

- **1180px**: queue chip hides.
- **1024px**: stepper hides from top rail; two-col layouts collapse to single column (rail moves below via `order: 2`); page padding shrinks to `28px 40px`.
- **900px**: figure strip goes 4 → 2 columns.
- **760px**: run header collapses to single-column stack; section header strip's actions go full-width flex-1.
- **720px**: top rail keeps only drawer toggle + new-task button; brand label hides; main page padding `20px 18px`.
- **520px**: figure strip goes 2 → 1 column.

### Tweaks (in-design controls)

Exposed via the Tweaks toolbar toggle. Not a user-facing feature — it's for the designer to explore variants:
- **theme**: `paper` / `dark`
- **progressStyle**: `minimal` (no progress bar) / `roman` (I · II · III · …) / `tree` (indented step tree)
- **eventDensity**: `grouped` / `firehose`
- **showDiagonal**: toggle the constructivist stripe on run headers
- **showBranch**: toggle the branching behavior (on pick of non-default option)
- **startState**: jump to any screen for review (do not expose in production)

---

## State Management

A real implementation should manage:

### Session-level (a single Pharos user)
- `runs: Run[]` — ongoing + historical runs
- `drafts: Draft[]` — saved articles
- `activeRunId: string | null`
- `drawerOpen: boolean`
- `drawerTab: 'skills' | 'runs' | 'drafts'`
- Theme preference

### Run-level (per active run)
- `runId`, `topic`, `openedAt`
- `state: 'clarify' | 'plan' | 'run-live' | 'article'`
- `phase: 'executing' | 'reviewing' | 'extending' | 'writing' | 'done'`
- `branches: Branch[]` (main always present; additional when user diverges during clarify)
- `activeBranch: string`
- `clarifyTurns: ClarifyTurn[]` — question, options, user's answer
- `graph: { nodes: Node[], edges: Edge[] }` — the task DAG
- `events: Event[]` — append-only stream from the agent backend
- `verdicts: Record<nodeId, 'green' | 'yellow' | 'red'>`
- `article: { tex, pdf, figures[], compileLog[] }` once writing begins

### Event stream types (from the agent backend)

Mirror the `Event` discriminated union in the binding spec (not shipped here — ask backend team for `BINDINGS.md`). Handle at minimum: `node_started`, `node_done`, `node_failed`, `supervisor_verdict`, `commander_decision`, `graph_extended`, `skill_invoked`, `compile_progress`.

---

## Design Tokens

All live in `tokens.css` and should be ported verbatim into your token system.

### Colors — paper theme (default)
| Token | Value | Use |
|---|---|---|
| `--paper` | `#F3EEE3` | Canvas background |
| `--paper-2` | `#EAE3D2` | Ruled-line tint; recessed panels |
| `--paper-edge` | `#D9D0BA` | Hairlines, input borders |
| `--ink` | `#0E0E0C` | Primary text, primary buttons |
| `--ink-2` | `#2A2823` | Secondary text |
| `--ink-3` | `#5A574E` | Tertiary text / caps labels |
| `--ink-4` | `#8A8679` | Metadata, timestamps |
| `--ink-5` | `#B6B2A3` | Disabled, scrollbar thumb |

### Colors — dark theme
| Token | Value |
|---|---|
| `--paper` | `#0E0E0C` |
| `--paper-2` | `#181714` |
| `--paper-edge` | `#262520` |
| `--ink` | `#EDE6D3` |

### Kandinsky (functional — agent roles and verdicts)
| Token | Value | Role |
|---|---|---|
| `--k-yellow` | `#F2C230` | △ commander stamp; `DEFAULT` pill; yellow verdict |
| `--k-red` | `#C8342B` | ■ worker stamp; red verdict; constructivist stripe |
| `--k-blue` | `#2E5FB8` | ○ supervisor stamp; focus ring |
| `--verdict-green` | `#1E5F3E` | Green verdict (dark ink, not Kandinsky-vivid) |

### Typography
| Token | Production face | Fallback shipped | Used for |
|---|---|---|---|
| `--f-display` | GT Alpina Standard Italic | Fraunces Italic | Mastheads, topic, lede, editorial |
| `--f-sans` | Söhne | Inter | Body, UI labels, buttons |
| `--f-mono` | Söhne Mono | JetBrains Mono | Metadata, IDs, timestamps, event stream, node labels |

### Scale
```
--fs-micro:   10.5px   (caps labels, mono metadata)
--fs-caption: 12px     (stats, secondary metadata)
--fs-body:    14px     (body, UI)
--fs-body-lg: 16px     (lede paragraphs)
--fs-title:   20px     (topic, section titles)
--fs-lede:    28px     (editorial italic narrators)
--fs-display: 44px     (page titles in article)
--fs-masthead: 72px    (empty-state masthead; uses clamp())
```

Line heights: `--lh-tight: 1.08 / --lh-snug: 1.3 / --lh-body: 1.5 / --lh-loose: 1.7`.

### Spacing / grid
- Grid column base: `--col: 96px`, `--gutter: 24px`, `--margin: 48px`.
- Baseline grid: `8px` (`--baseline`).
- Two-col layouts: `1fr + 320px` (`col-1fr-320`), `1fr + 280px` (`col-1fr-280`), `1fr + 440px` (`col-1fr-440`).
- Screen pad: `36px 72px 72px` default / `24px 48px 60px` tight (shrinks at breakpoints).

### Motion
- `--ease-paper: cubic-bezier(.2, .7, .2, 1)` — the one easing for everything.
- `--dur-fast: 140ms / --dur: 260ms / --dur-slow: 520ms`.

### Shape stamps (agent roles)
- Rendered as 18×18 `inline-flex` elements with a white mono letter inside the shape.
- △ (triangle) in `--k-yellow` — commander
- ■ (square) in `--k-red` — worker
- ○ (circle) in `--k-blue` — supervisor
- See `shapes.jsx` for the SVG geometry.

### Textures and decorations
- **Taped evidence card** (`.taped`): 1px border, tiny 2px/3px hard drop shadow, two yellow tape rectangles at top-left and top-right using `::before`/`::after` with opposite rotations.
- **Paper rule** (`.paper-rule`): `linear-gradient(var(--paper-2) 1px, transparent 1px)` with `background-size: 100% 32px`. Use only on surfaces that read as literal notebook paper.
- **Diagonal band** (`.diagonal-band`): `repeating-linear-gradient(-67deg, transparent 0 22px, var(--construct) 22px 24px, transparent 24px 46px)` at `opacity: 0.14`. Only use on run header when a branch exists (or via the `showDiagonal` tweak).
- **Swiss label** (`.swiss-label`): flex row with caps label on the left and mono meta on the right, separated from the content by a full-width 1px ink rule.

---

## Assets

No raster assets are bundled — every visual element is drawn in CSS/SVG:

- **Fonts**: loaded from Google Fonts (Fraunces / Inter / JetBrains Mono). Production swap to Söhne + GT Alpina requires licensing.
- **Icons**: mono glyphs (`§`, `△`, `■`, `○`, `▍`, `→`, `↺`, `↓`). No icon library.
- **Figures in article**: 4 placeholder figures rendered in CSS (`fig-1` bar chart with 4 bars, `fig-2` 8×8 heatmap grid with varying opacity, `fig-3` loss-curve SVG path, `fig-4` block diagram). Replace with real figures from the agent.
- **Logo**: none — the brand is the word *pharos* set in display italic.

---

## Files

```
design_handoff_pharos/
├── README.md                    ← you are here
├── pharos.html                  ← main shell; state machine, routing, top-rail, drawer mount, responsive style block
├── tokens.css                   ← design tokens + shell CSS utilities
├── shapes.jsx                   ← Kandinsky △/■/○ shape stamps + VerdictPill
├── mock-data.jsx                ← sample topic, graphs, events, clarify turns — REPLACE WITH BACKEND
├── progress-mark.jsx            ← § stepper with three render modes
├── event-stream.jsx             ← live monospace event feed + density modes
├── task-graph.jsx               ← TaskGraphSVG renderer (nodes, edges, stamps, verdicts)
├── drawer.jsx                   ← left drawer with skills / runs / drafts tabs
├── tweaks-panel.jsx             ← in-design tweak controls (remove in production)
└── screens/
    ├── empty.jsx                ← empty state / task submission
    ├── clarify.jsx              ← clarify screen + RunHeader (shared)
    ├── plan.jsx                 ← plan confirmation with initial DAG
    ├── live.jsx                 ← running view: DAG + event stream + commander decision
    └── article.jsx              ← article writing + compiled PDF view
```

### Build note

`pharos.html` contains an inline `<style>` block with responsive overrides that use `!important`. Those are there because during development `tokens.css` was sometimes served stale by the browser cache. In your production port, fold everything back into a single token/stylesheet pipeline and drop the `!important` flags.

---

## Open questions for the product team

1. **Skill palette**: the commander currently "knows" a fixed set of skills (literature search, code execution, plotting, LaTeX write). Are skills discoverable at runtime, or baked in?
2. **Branch semantics**: when a user picks a non-default clarify option and a branch opens, does the original `main` still run, or does the branch replace it?
3. **Compile worker**: who owns the `pdflatex` process — a sidecar on `pharosd` localhost, or a remote build service?
4. **Multi-run concurrency**: the top rail shows `QUEUE +2` hinting at queued runs. Is Pharos multi-tenant per user, or strictly one-at-a-time?
5. **Persistence of drafts**: when an article completes, where does the `.tex / .pdf` artifact land? Local filesystem? Cloud bucket? Inline in the notebook DB?
