# Deployment

Target environment: `mini_m2` — Mac mini M2 running macOS, Homebrew nginx as a reverse-proxy gateway on `:8080`, Cloudflare Tunnel (`cloudflared` LaunchDaemon) exposing the gateway to the public hostname.

## Layout chosen

- `/pharos/` on the nginx gateway serves the Vite static build.
- `/pharos/api/` and `/pharos/ws` reverse-proxy to pharosd on `127.0.0.1:3099`.
- Subpath matches the existing nginx convention on this gateway (`/ollama`, `/jellyfin/`, `/homeassistant/`, etc.).

## Frontend

Build with subpath env:

```sh
npm run build:pharos
```

Sync dist to the Mac mini:

```sh
rsync -a --delete dist/ mini_m2:~/sites/pharos-console/
```

## Backend (pharosd)

Clone + build on the target (M2 = aarch64, cross-compile from laptop works but same-arch local build is simpler):

```sh
ssh mini_m2
cd ~/apps
git clone git@github.com:geno-lab/pharos.git
cd pharos
cargo build --release
uv sync
```

Binary lands at `~/apps/pharos/target/release/pharos` (~2.7 MB).

### LaunchAgent (user-level, no sudo)

`~/Library/LaunchAgents/dev.pharos.server.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key><string>dev.pharos.server</string>
    <key>ProgramArguments</key>
    <array>
      <string>/Users/snaix/apps/pharos/target/release/pharos</string>
      <string>--web</string>
      <string>--port</string>
      <string>3099</string>
    </array>
    <key>WorkingDirectory</key><string>/Users/snaix/apps/pharos</string>
    <key>EnvironmentVariables</key>
    <dict>
      <key>PATH</key><string>/opt/homebrew/bin:/usr/bin:/bin:/Users/snaix/.cargo/bin</string>
      <!-- Fill in LLM provider envs here or in a dotenv beside the binary -->
    </dict>
    <key>RunAtLoad</key><true/>
    <key>KeepAlive</key>
    <dict><key>SuccessfulExit</key><false/></dict>
    <key>ThrottleInterval</key><integer>10</integer>
    <key>StandardOutPath</key><string>/Users/snaix/Library/Logs/pharos.out.log</string>
    <key>StandardErrorPath</key><string>/Users/snaix/Library/Logs/pharos.err.log</string>
  </dict>
</plist>
```

Load:

```sh
launchctl load ~/Library/LaunchAgents/dev.pharos.server.plist
```

### LLM provider env (this is the deployment gap)

pharosd refuses to start without a configured LLM provider. On this machine neither Ollama, Claude CLI, nor an API key was set up — pick one:

- **Ollama** — `brew install ollama`, `ollama pull qwen3:32b`, set `LLM_PROVIDER=ollama`, `OLLAMA_BASE_URL=http://127.0.0.1:11434`, `OLLAMA_TIER_1..5=qwen3:32b` in the plist's `EnvironmentVariables`.
- **Claude Code CLI** — `npm install -g @anthropic-ai/claude-code`, run `claude` once to log in, set `LLM_PROVIDER=anthropic` + `ANTHROPIC_TIER_1..5` to model names.
- **OpenAI-compat remote** — set `LLM_PROVIDER=openai`, `OPENAI_BASE_URL`, `OPENAI_API_KEY`, `OPENAI_TIER_1..5`.

Reload the agent after editing the plist:

```sh
launchctl unload ~/Library/LaunchAgents/dev.pharos.server.plist
launchctl load ~/Library/LaunchAgents/dev.pharos.server.plist
```

## Nginx

The existing `/opt/homebrew/etc/nginx/nginx.conf` has its single `server { listen 8080; ... }` block; this deploy inserts three location blocks before the catch-all `location /`:

```nginx
# ---- Pharos backend ----
# WS must come BEFORE /pharos/ so it doesn't fall through to the static handler.
location = /pharos/ws {
    proxy_pass http://127.0.0.1:3099/ws;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
    proxy_read_timeout 1h;
}

location /pharos/api/ {
    proxy_pass http://127.0.0.1:3099/api/;
    proxy_read_timeout 360s;
}

location /pharos/ {
    alias /Users/snaix/sites/pharos-console/;
    index index.html;
    try_files $uri $uri/ /pharos/index.html;
}
```

Syntax test + reload:

```sh
sudo nginx -t
sudo nginx -s reload
```

(Nginx is a system-level `LaunchDaemon`; reload needs root.)

## Cloudflare Tunnel

Already configured as a `LaunchDaemon` with a tunnel token pointing at the local gateway. Routes `<public-hostname>/pharos/*` → `http://127.0.0.1:8080/pharos/*` via the CF dashboard's ingress rules. No local config change needed if the ingress is already `http://127.0.0.1:8080` for the catch-all path.

## Rollback

- `/opt/homebrew/etc/nginx/nginx.conf.bak.<timestamp>` is created on every patch — restore with `cp` then `sudo nginx -s reload`.
- `rm -rf ~/sites/pharos-console` removes the static bundle.
- `launchctl unload ~/Library/LaunchAgents/dev.pharos.server.plist && rm ~/Library/LaunchAgents/dev.pharos.server.plist` removes the agent.

## Verifying

On the mini:

```sh
# frontend reachable via nginx (after reload)
curl -I http://127.0.0.1:8080/pharos/
# backend reachable directly (after LLM env is set and agent loaded)
curl http://127.0.0.1:3099/api/status
# backend reachable through nginx
curl http://127.0.0.1:8080/pharos/api/status
```

Via the public CF hostname:

```sh
curl -I https://<your-hostname>/pharos/
```

Browser: open `https://<hostname>/pharos/`, submit a task. The WS should connect within a second; the event stream fills as the task runs.
