# Consuming the backend type bindings

The Pharos backend generates TypeScript types from its Rust source via [`ts-rs`](https://github.com/Aleph-Alpha/ts-rs). They live at `geno-lab/pharos:bindings/` and are CI-guarded against drift.

What's exported:

| file | what |
|---|---|
| `Event.ts` | full WebSocket event union (all `type` variants) |
| `NodeSpec.ts` | shape for task-graph nodes |
| `Verdict.ts` | `"GREEN" \| "YELLOW" \| "RED"` |
| `TokenUsage.ts` | `{ input_tokens, output_tokens }` |
| `EvidenceDelta.ts` | deltas reported by the evaluator |
| `AgentId.ts` | branded string |
| `AgentRole.ts` | `"commander" \| "worker" \| ...` |
| `GraphChange.ts`, `TaskGraphSnapshot.ts` | DAG mutation payloads |
| `SkillInfo.ts` | response shape of `GET /api/skills` |
| `RunStatus.ts` | response shape of `GET /api/status` |
| `serde_json/JsonValue.ts` | the escape hatch for `tool_started.args` etc. |

## Options for consumption

Pick one. All three work.

### Option A — git subtree (lowest infra, one command to update)

```sh
# first time
git subtree add --prefix=bindings \
  https://github.com/geno-lab/pharos.git main --squash \
  -- bindings

# later, when backend types change
git subtree pull --prefix=bindings \
  https://github.com/geno-lab/pharos.git main --squash \
  -- bindings
```

Then import:
```ts
import type { Event, SkillInfo } from "./bindings"
```

### Option B — CI copy at build time

Cheaper mentally; works if you don't want subtree history clutter:

```yaml
# .github/workflows/sync-bindings.yml
- uses: actions/checkout@v4
- run: |
    git clone --depth 1 https://github.com/geno-lab/pharos /tmp/pharos
    rm -rf src/bindings
    cp -r /tmp/pharos/bindings src/bindings
- name: Fail if bindings changed
  run: git diff --exit-code src/bindings || (echo "Update committed bindings" && exit 1)
```

### Option C — published npm package

Future move. Add a `package.json` under `pharos/bindings/` with `"name": "@geno-lab/pharos-bindings"` and publish on tag. Consumer then gets `npm install @geno-lab/pharos-bindings`. Not set up yet; do this once the types stabilize.

## Barrel file (nice-to-have)

The generated files are per-type and don't include a barrel. Drop a `bindings/index.ts` yourself (it won't conflict with ts-rs regeneration — ts-rs only overwrites the files it generates):

```ts
export type { Event } from "./Event"
export type { NodeSpec } from "./NodeSpec"
export type { Verdict } from "./Verdict"
export type { TokenUsage } from "./TokenUsage"
export type { EvidenceDelta } from "./EvidenceDelta"
export type { AgentId } from "./AgentId"
export type { AgentRole } from "./AgentRole"
export type { GraphChange } from "./GraphChange"
export type { TaskGraphSnapshot } from "./TaskGraphSnapshot"
export type { SkillInfo } from "./SkillInfo"
export type { RunStatus } from "./RunStatus"
```

Then `import { Event, SkillInfo } from "./bindings"` reads cleanly.

## Keeping in sync

Backend CI refuses to merge if `bindings/` drifts from the Rust source. So whatever's on `main` of the backend repo is authoritative. Whenever you pull, regenerate / copy.

Discriminating `Event` variants in TypeScript:

```ts
function on(event: Event) {
  switch (event.type) {
    case "llm_delta": /* event.text */ break;
    case "evaluation": /* event.status, event.feedback */ break;
    // TypeScript will complain if you miss a variant
  }
}
```
