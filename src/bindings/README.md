# bindings/

TypeScript types auto-generated from Rust wire types via [`ts-rs`](https://github.com/Aleph-Alpha/ts-rs).

**Do not edit these files by hand.** Regenerate with:

```sh
cargo test --release export_bindings
```

CI enforces that this directory is in sync with the Rust source — an out-of-sync PR fails the `bindings` job.

## Consumers

`pharos-console` and any future frontend clients consume this directory directly (git subtree / submodule / CI copy — choose per client). The Rust backend is the source of truth; the Rust source defines the wire format, the bindings follow.

## What's exported

- `Event.ts` — the full WebSocket event union
- `NodeSpec.ts`, `Verdict.ts`, `TokenUsage.ts`, `EvidenceDelta.ts`, `AgentId.ts`, `AgentRole.ts`, `GraphChange.ts`, `TaskGraphSnapshot.ts` — referenced types
