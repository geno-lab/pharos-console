# pharos-console

Frontend for [Pharos](https://github.com/geno-lab/pharos) — the open agent framework.

**Stack:** Vite + React 19 + TypeScript + Zustand + vanilla CSS (tokens).

## Status

- [x] Design received and archived under [`design/`](design/)
- [x] Backend API contract locked
- [x] Bindings consumed from `bindings/` (ts-rs export)
- [x] Shell + empty screen + live run screen (v1 scope)
- [ ] Clarify / plan-confirm / commander-decision (blocked on backend work)
- [ ] DAG SVG view
- [ ] Skills / runs / drafts drawer
- [ ] Article / LaTeX view

See [`docs/DESIGN.md`](docs/DESIGN.md) for the backend-gap map.

## Develop

Backend needs to run somewhere (locally or remote). Start pharosd on its default port:

```sh
# in the pharos backend repo
cargo run --release -- --web --port 3000
```

Then:

```sh
npm install
npm run dev
# → http://localhost:5173  (Vite proxies /api and /ws to :3000)
```

Edit `vite.config.ts` to point at a remote backend if you're not running pharosd locally.

## Build

```sh
npm run build
```

Output lands in `dist/`. The current production deploy lives at https://pharos.snaix.homes/ (mini_m2 + Cloudflare Tunnel) — see [`docs/DEPLOY.md`](docs/DEPLOY.md).

## Deploy

See [`docs/DEPLOY.md`](docs/DEPLOY.md).

## License

MIT.
