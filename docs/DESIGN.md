# Design brief

This is what I need from you before implementation can start. Everything below maps to a decision that affects code structure.

## Aesthetic direction (stated)

- Bauhaus — geometric primitivism, function-first
- Kandinsky's 1923 Bauhaus questionnaire — yellow↔triangle, red↔square, blue↔circle (use as a rule, bend it deliberately if you want)
- Müller-Brockmann / Swiss grid — mathematical column system, ratio-based type scale, generous white
- Jan Tschichold's *The New Typography* — asymmetric composition, sans-serif, functional hierarchy
- Objective photography (Bernd & Hilla Becher vocabulary) — ordered grids, neutral context, repetition as content
- Russian constructivism — diagonal energy, bold colour blocks, propaganda-typography confidence

These are directions, not constraints. Contradictions among them (Müller-Brockmann's restraint vs constructivism's loudness) are yours to resolve.

## Decisions I need (to convert to code)

### 1. Type system
- Typeface: one sans-serif for UI, optionally a second for data (mono or serif). Name specific faces — Founders Grotesk / Neue Haas Grotesk / Inter / GT America / etc. Licensing matters: pick one with a web-embedding license you can afford.
- Type scale: give me 5–7 sizes with their line-heights. Modular scale ratio or hand-picked?
- Weight set: which weights ship? (regular + medium + bold is a common minimum)
- Use case mapping: `headline`, `title`, `body`, `caption`, `mono` → which size/weight combo each.

### 2. Colour tokens
- Palette: primary, secondary, neutral ramp, semantic (success / warning / danger / info). Specific hex values, not "red-ish".
- Shape↔colour rule: if you're applying Kandinsky's mapping, tell me where (e.g. verdict badges? agent-role indicators? node shapes in the DAG?). If you're deliberately breaking it, tell me where.
- Dark mode: yes/no. If yes, paired palette.

### 3. Grid & spacing
- Column count at each breakpoint (4 / 6 / 12 columns typical). Mobile first or desktop first?
- Gutter, margin, and baseline grid. Müller-Brockmann commonly uses 4px or 8px baselines.
- Breakpoints: specific pixel or rem values, not "md / lg / xl".

### 4. Components I'll need styling decisions on
- Task submission form (textarea + run button + mode selectors)
- DAG view: node shape, edge style, live state colouring — this is the marquee view and deserves the most attention
- Event stream: LLM token deltas, tool calls, evaluations. A typographic feed, not a chat bubble tradition.
- Skills directory: grid or list? Card structure?
- Navigation: header, sidebar, or diagonal (constructivist)?
- Empty / loading / error states

### 5. Motion
- Is this a thing? Müller-Brockmann is still, Tschichold is still, constructivism can have kinetic energy. Decide whether motion serves the content (event stream arrivals, node state transitions) or is decoration (skip if the latter).

### 6. Iconography
- Geometric primitives only (consistent with Bauhaus / Kandinsky)? Or imported set (Phosphor / Lucide)?
- Stroke weight, corner rule, size scale.

### 7. Photography / imagery
- Any imagery at all? For an ops dashboard, usually no. If yes (landing page, empty states): direction.

### 8. Voice / tone
- Copy is part of design. What's the product voice? Clinical, playful, declarative?

## Deliverables format

Whatever ships to me. Preferred in decreasing order:

1. Figma file with components + tokens extractable via Tokens Studio or Variables
2. Plain markdown spec + a small reference repo of HTML/CSS snippets
3. Image mocks + a written token list

Token definitions in a machine-readable format (JSON / CSS variables / Tokens Studio export) save the most implementation time.

## Out of scope for this doc

- Tech stack (Astro, React, Svelte, whatever — pick at implementation time)
- Data flow architecture
- Backend changes — if the design implies an API you don't have yet, open an issue at geno-lab/pharos

## Sitemap (draft — overwrite freely)

```
/             → task submission + live run (single page, two states)
/skills       → skills directory
/runs         → run history (once backend supports it)
/runs/:id     → single run replay
/about        → optional; framework context
```

Decide: single-page with state-driven views, or multi-page with router? Affects code layout.

## What I'll do once this is filled in

1. Wire up the tech stack
2. Import tokens → CSS variables or Tailwind config or equivalent
3. Build out components per your inventory
4. Consume `bindings/` types for every wire shape
5. Connect to a locally-running `pharosd`, verify flows
6. Deploy to Cloudflare Pages / similar, verify CORS + WS behind proxy

Ping me in a PR when the brief is ready.
