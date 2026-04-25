# Deployment

Target environment: `mini_m2` — Mac mini M2 running macOS, Homebrew nginx as a reverse-proxy gateway on `:8080`, Cloudflare Tunnel (`cloudflared` LaunchDaemon) exposing the gateway to the public hostname.

## Layout chosen

`pharos.snaix.homes` (subdomain) routes through the CF tunnel into nginx on `:8080`. A dedicated nginx server block matches `server_name pharos.snaix.homes` and serves:

- `/` — Vite static build from `~/sites/pharos-console/`
- `/api/*` — reverse-proxy to pharosd on `127.0.0.1:3099`
- `/ws` — reverse-proxy WebSocket to pharosd

LLM inference is on **A100_j** (`100.73.132.43:11434`, Tailscale), running Ollama with `qwen3:32b`. pharosd is configured to point at it for all five tiers.

## Frontend

Build (root deploy — no subpath since we use a dedicated subdomain):

```sh
npm run build
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

### LLM provider env

pharosd refuses to start without a configured LLM provider. The `EnvironmentVariables` block in the deployed plist points at A100_j Ollama:

```xml
<key>LLM_PROVIDER</key><string>ollama</string>
<key>OLLAMA_BASE_URL</key><string>http://100.73.132.43:11434</string>
<key>OLLAMA_TIER_1</key><string>qwen3:32b</string>
<key>OLLAMA_TIER_2</key><string>qwen3:32b</string>
<key>OLLAMA_TIER_3</key><string>qwen3:32b</string>
<key>OLLAMA_TIER_4</key><string>qwen3:32b</string>
<key>OLLAMA_TIER_5</key><string>qwen3:32b</string>
```

Other supported providers (`LLM_PROVIDER=anthropic` with `ANTHROPIC_TIER_1..5`; `LLM_PROVIDER=openai` with `OPENAI_BASE_URL`/`OPENAI_API_KEY`/`OPENAI_TIER_1..5`) are configurable the same way.

Reload the agent after editing the plist:

```sh
launchctl unload ~/Library/LaunchAgents/dev.pharos.server.plist
launchctl load ~/Library/LaunchAgents/dev.pharos.server.plist
```

## Nginx

The existing `/opt/homebrew/etc/nginx/nginx.conf` has its catch-all `server { listen 8080; ... }` block (no `server_name`). The deploy:

1. Adds `include mime.types; default_type application/octet-stream;` at the top of the `http {}` block so static assets get the correct Content-Type (without this, all .js/.css files served as `text/plain` and the browser refuses to execute them).
2. Adds a dedicated server block for `pharos.snaix.homes`:

```nginx
server {
    listen 8080;
    server_name pharos.snaix.homes;

    location = /ws {
        proxy_pass http://127.0.0.1:3099/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_read_timeout 1h;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3099/api/;
        proxy_read_timeout 360s;
    }

    location / {
        root /Users/snaix/sites/pharos-console;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

Syntax test + reload:

```sh
sudo nginx -t
sudo nginx -s reload
```

(Nginx is a system-level `LaunchDaemon`; reload needs root.)

## Cloudflare Tunnel

Token-based tunnel (LaunchDaemon `com.cloudflare.cloudflared`) — ingress routes are managed remotely via the CF Zero Trust dashboard. Add:

- **Public hostname:** `pharos.snaix.homes` → `HTTP` → `localhost:8080`

cloudflared forwards the original `Host: pharos.snaix.homes`, which nginx matches on `server_name`. No HTTP host header override needed.

## Rollback

- `/opt/homebrew/etc/nginx/nginx.conf.bak.<timestamp>` is created on every patch — restore with `cp` then `sudo nginx -s reload`.
- `rm -rf ~/sites/pharos-console` removes the static bundle.
- `launchctl unload ~/Library/LaunchAgents/dev.pharos.server.plist && rm ~/Library/LaunchAgents/dev.pharos.server.plist` removes the agent.

## Verifying

On the mini:

```sh
# static reachable through nginx with correct Host
curl -I -H "Host: pharos.snaix.homes" http://127.0.0.1:8080/
# backend reachable directly
curl http://127.0.0.1:3099/api/status
# backend reachable through nginx
curl -H "Host: pharos.snaix.homes" http://127.0.0.1:8080/api/status
# WS upgrade
curl -o /dev/null -w "%{http_code}\n" -H "Host: pharos.snaix.homes" \
    -H "Connection: Upgrade" -H "Upgrade: websocket" \
    -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
    http://127.0.0.1:8080/ws
```

Via the public CF hostname:

```sh
curl -I https://pharos.snaix.homes/
curl https://pharos.snaix.homes/api/status
```

Browser: open `https://pharos.snaix.homes/`, submit a task. The WS should connect within a second; the event stream fills as the task runs.
