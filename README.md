# pharos-console

Frontend for [Pharos](https://github.com/geno-lab/pharos) — the open agent framework.

This repo is deliberately empty. It holds the design brief, API contract, and type-binding instructions; the tech stack and implementation are up to the maintainer.

## What goes here

A single-page (or multi-page) app that:

1. Lets a user submit a research task (`POST /api/run`)
2. Renders the live task graph and event stream over WebSocket (`/ws`)
3. Browses the available skills (`GET /api/skills`)
4. Restores state on refresh via `GET /api/status` + (eventually) a run-history endpoint

It deploys independently of the backend: static output goes to Cloudflare Pages / similar, the backend (`pharosd`) lives elsewhere behind whatever reverse proxy you pick.

## Backend dependency

Pharos `>= 0b40c73` (post-Phase-2). The backend exposes:

- REST: `POST /api/run`, `GET /api/skills`, `GET /api/status`
- WebSocket: `/ws` — typed `Event` stream, ping every 30s

Full contract: [`geno-lab/pharos/docs/API.md`](https://github.com/geno-lab/pharos/blob/main/docs/API.md)

TypeScript types: [`geno-lab/pharos/bindings/`](https://github.com/geno-lab/pharos/tree/main/bindings) — see [`docs/BINDINGS.md`](docs/BINDINGS.md) for consumption options.

## Design direction

Being defined. Aesthetic reference points (Bauhaus, Kandinsky's shape↔colour mapping, Müller-Brockmann grid, Tschichold's New Typography, objective photography, Russian constructivism) are what the project is aiming for. See [`docs/DESIGN.md`](docs/DESIGN.md) for the specific decisions that need making before implementation — that doc doubles as the design brief you hand the designer (or yourself).

## Status

- [ ] Tech stack chosen
- [ ] Design tokens defined
- [ ] Bindings consumption wired in
- [ ] Task submission form
- [ ] Live run view (DAG + event stream)
- [ ] Skills directory page
- [ ] Cross-origin deploy verified against a hosted pharosd

## License

MIT — matches the upstream backend.
