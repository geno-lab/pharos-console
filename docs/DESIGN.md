# Design

Design is delivered and archived under [`design/`](../design/). That bundle is the source of truth — README inside it is 329 lines of spec, with a working HTML reference, all tokens, and all five screens.

## Product concept

A notebook-style console for research agents. Paper background × Swiss grid × Kandinsky's shape↔colour grammar × Tschichold asymmetric typography × Russian constructivist accent stripe. Fraunces / Inter / JetBrains Mono (shipped) → GT Alpina / Söhne / Söhne Mono (production, when licensed).

Five primary states on one canvas:

1. `empty` — submit a topic or task
2. `clarify` — commander asks structured questions, user can branch
3. `plan` — DAG preview, user revises or confirms
4. `run-live` — DAG executes, events stream, supervisor verdicts inline
5. `article` — LaTeX compile + final PDF

See [`design/README.md`](../design/README.md) for full spec.

## Agent-role stamps

Map directly to backend `AgentRole` (ts-rs export at `bindings/AgentRole.ts`):

| design stamp | design label | backend role |
|---|---|---|
| △ yellow | commander / planner | `commander` |
| ■ red | worker / agent | `worker` |
| ○ blue | supervisor / reviewer | `tactical_evaluator`, `strategic_reviewer` |
| — | (skill selector) | `skill_scout` |

## Verdict pill

`VerdictPill verdict={GREEN|YELLOW|RED}` — exact match to `bindings/Verdict.ts`.

## Backend gap map

The design assumes some backend capabilities that aren't built yet. When implementation starts, pick a strategy per gap:

| design expects | backend today | suggested approach |
|---|---|---|
| `empty` topic-vs-task mode toggle | `POST /api/run` takes `task` only | add `mode: "topic" \| "task"` to the request body; backend can use it to pick a planning preset |
| `clarify` — Q&A turns | no clarify phase | two options: (a) implement backend-side clarify agent that emits new `ClarifyTurn` events before planning; (b) fake it in the frontend for v1 (front-end collects answers and concatenates into the task description) |
| branches | no branch concept in task_graph | v1: skip, default branch only. Add multi-branch support when there's a real use case |
| `plan` confirm step | backend auto-executes post-planning | add `POST /api/run/{id}/confirm` and a `plan_ready` event that pauses the runtime — requires runtime state machine change |
| run-live DAG rendering | `graph_built` + `graph_modified` events carry the DAG | ✓ works today; map each `agent_spawned` to a node highlight |
| supervisor verdict inline | `evaluation { node_id, status: Verdict, feedback }` event | ✓ direct |
| commander decision (extend vs write) | expansion is currently autonomous | add `commander_decision_needed` event + `POST /api/decision` — runtime pause point |
| LaTeX compile progress | `latex.write` skill exists but emits generic `tool_*` events | add structured `compile_progress { pass, step, status }` events either from Rust side or from the skill itself |
| figures panel | no figure-typed events | backend emits `figure_ready { id, caption, uri }` when the skill produces one |
| run queue `+2` | single-task runtime | Phase 4 territory — deprioritize until hosted mode |
| drawer: skills tab | `GET /api/skills` returns `SkillInfo[]` | ✓ works today |
| drawer: runs tab | no history endpoint | `GET /api/runs` + `GET /api/runs/:id` returning replayable event log |
| drawer: drafts tab | no draft persistence endpoint | once article is compiled, `GET /api/drafts` returns list; artifacts already persist to disk via `src/artifacts.rs` |

## Event mapping

Design's event-type vocabulary (in `design/README.md`) vs this project's:

| design name | backend `Event` variant |
|---|---|
| `node_started` | `agent_spawned` |
| `node_done` | `agent_completed` |
| `node_failed` | `agent_cancelled` + following `evaluation` with `RED` |
| `supervisor_verdict` | `evaluation` |
| `commander_decision` | *new — not emitted yet* |
| `graph_extended` | `graph_modified` with `change.kind = "expansion"` |
| `skill_invoked` | `tool_started` |
| `compile_progress` | *new — not emitted yet* |

The frontend should alias / adapt on ingress; renaming the backend event set to match design vocabulary is also an option if the design names are clearer (they are).

## Token implementation

`design/tokens.css` maps 1:1 onto CSS custom properties. Do not `@import` the file verbatim in production — translate:

- Into Tailwind 4 `@theme` blocks if Tailwind is chosen
- Into stitches / styled-components theme object if styled-approach
- Into a plain `:root { --... }` + utility class sheet if vanilla CSS

Tokens in scope: paper/dark colors, Kandinsky functional, verdicts, typography (3 face stacks), size scale (8 steps), line-heights (4), motion (1 easing + 3 durations), grid (96px col / 24px gutter / 48px margin / 8px baseline).

## What I need from you before implementation

Nothing — the handoff is complete. What implementation needs to decide (internal):

- Framework: Next.js / Astro-islands / Remix / vanilla React-SPA — pick one based on deploy target
- Styling: Tailwind 4 vs vanilla CSS + tokens file vs CSS-in-JS — tokens are expressive enough for any of these
- State: Zustand vs TanStack Query vs nothing (for an ops dashboard with live WS, a tiny Zustand store + a `useEvents()` hook is usually enough)
- Bindings consumption: pick an option from `docs/BINDINGS.md`
