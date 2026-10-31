# Deploying Iris

Iris runs on the Ubuntu server next to EaseCampaign and Spine, at **https://iris.liv2code.in**.

```
Cloudflare (public HTTPS) ──► nginx on the server :443 ──┬── /ws/*   ──► iris_api  127.0.0.1:8122 (Java 21, WebSockets)
                              (systemd)                  ├── /api/*  ──► iris_api  127.0.0.1:8122
                                                         └── /*      ──► iris_web  127.0.0.1:8121 (static app)
                              iris_redis (private to Iris, no port on the server)
```

- **Manual:** deploys run only when you start them: **Actions → Deploy API → Run workflow** for the API, **Actions → Deploy web → Run workflow** for the web app. Pick the branch to deploy (usually `master`). Merging never deploys by itself.
- **What a deploy does:** builds a Docker image in GitHub Actions, pushes it to GitHub's container registry, then on the server (`/opt/iris/deploy.sh`) starts the new container, waits until it's healthy and **rolls back to the previous version if it isn't**.
- **Never automated:** the server's nginx. Iris's server block is changed once by hand (step 5).

## One-time setup

### 1. DNS (Cloudflare)
Already done: `iris` is an A record to the server, proxied.

### 2. Server folder and settings
On the server, as your usual user:
```bash
sudo mkdir -p /opt/iris && sudo chown "$USER": /opt/iris
```
Copy `deploy/iris.env.example` from this repo to `/opt/iris/iris.env`, fill it in (`YOUTUBE_API_KEY` as in the current setup), then `chmod 600 /opt/iris/iris.env`.

### 3. Let the server pull images
Already done if Spine deploys work (the server is logged in to `ghcr.io`). Otherwise create a GitHub personal access token (classic) with only **read:packages**, then on the server:
```bash
echo <token> | docker login ghcr.io -u <your-github-username> --password-stdin
```

### 4. GitHub settings (this repo)
*Settings → Secrets and variables → Actions → New repository secret*, the same three values as Spine:
- `DEPLOY_HOST`: the server's IP
- `DEPLOY_USER`: your server username
- `DEPLOY_SSH_KEY`: the contents of the private key `spine-deploy` (or make a separate `iris-deploy` key the same way and add its `.pub` to `~/.ssh/authorized_keys` on the server)

### 5. First deploy and switch-over from pm2
Iris currently runs under pm2. The containers can start alongside it, and nginx is switched over last, so the site stays up throughout.

1. Run **Actions → Deploy API → Run workflow**. It copies the Compose file and script to `/opt/iris` and starts Redis and the API.
2. Run **Actions → Deploy web → Run workflow**.
3. Check both are healthy: `cd /opt/iris && docker compose ps`.
4. Find the nginx file that holds the current Iris blocks:
   ```bash
   sudo grep -rln "iris.liv2code.in" /etc/nginx
   ```
   In that file, **replace the two existing Iris server blocks** (`# Iris HTTP` and `# Iris HTTPS`, the ones serving `/usr/share/nginx/html/iris` and proxying to `iris_backend`) with the contents of `deploy/nginx-iris.conf`. Keep a copy of the old blocks in case you need to switch back. Leave the `upstream iris_backend { … }` block in place for now. Then:
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```
   If `nginx -t` reports an error, nothing has changed yet; fix the file (or put the old blocks back) and run it again.
5. Open https://iris.liv2code.in, create an Echo, and check that search and playback work.
6. Retire the old setup once you're happy:
   - Stop the old process: `pm2 stop iris && pm2 delete iris && pm2 save`.
   - Remove the now-unused `upstream iris_backend { … }` block, then run `sudo nginx -t && sudo systemctl reload nginx` again.
   - The old static build in `/usr/share/nginx/html/iris` is no longer served and can be deleted.
   - The old pm2 Iris used the host's Redis; the containers use `iris_redis`, so nothing else needs to change.

Echoes and letters live in Redis and expire on their own (letters after 12 hours), so starting with a fresh `iris_redis` only drops whatever is open at the moment of the switch.

## Everyday

| Task | Command (on the server, in `/opt/iris`) |
| --- | --- |
| See what's running | `docker compose ps` |
| Follow logs | `docker logs -f iris_api` (or `iris_web`) |
| Roll back | `./deploy.sh api <older commit sha>` (or `web`) |
| Restart one service | `docker compose restart iris_api` |
| Change a setting | edit `iris.env`, then `docker compose up -d iris_api` |

## Notes
- **One API instance only:** Echo rooms and their WebSockets are held in the API's memory.
- **Ports:** `iris_web` and `iris_api` listen on `127.0.0.1:8121` and `127.0.0.1:8122` only, so they're reachable from the server's nginx but not the internet. EaseCampaign uses 8101/8102 and Spine 8111/8112.
- **Certificate:** Iris uses `origin.crt`, which works because Cloudflare's SSL mode for liv2code.in is "Full".
- **Independent of EaseCampaign:** Iris's containers only use their own Docker network, so they keep running whatever happens to the other apps.
- **Pressed letters** (on `feature/pressed-letters`) add Postgres. When that merges, add an `iris_postgres` service, its settings in `iris.env`, and a pre-deploy backup, as in Spine's `deploy/`.
