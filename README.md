# Global Risk Atlas

© 2026 M. BARADHY

Interactive atlas of global risks (wars, energy, food, climate, cyber, health): dashboard, 3D globe, cause-and-effect network, scenario builder, live map (planes, ships, fires, internet outages), media attention, and a 14-day household reserve guide. French and English.

**Live site:** https://mbaradhy.github.io/globalrisk/

## What is in this repository

| Path | What it is |
|---|---|
| `index.html` | The whole app in one file. GitHub Pages serves it. |
| `worker/atlas-api-worker.js` | Data relay (Cloudflare Worker `atlas-api`): fetches public feeds that block browsers, caches them, counts visits and headlines. |
| `worker/wrangler.toml` | Optional config to deploy the relay from the command line. |
| `src/` | Source and build scripts that produce `index.html`. |

## Publishing

Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: `main`, folder `/ (root)` → Save.

The relay stays on Cloudflare (GitHub Pages only serves static files). The app calls it at `https://atlas-api.mbaradhy.workers.dev`.

## Relay secrets (Cloudflare → Workers → atlas-api → Settings → Variables and Secrets)

| Secret | Unlocks |
|---|---|
| `STATS_KEY` | Password for the visitor statistics page `/stats?key=…` |
| `OPENSKY_CLIENT_ID`, `OPENSKY_CLIENT_SECRET` | Worldwide air traffic (OpenSky Network account → API Client) |
| `AISSTREAM_KEY` | Ships (aisstream.io) |
| `FIRMS_KEY` | Fires and strikes (NASA FIRMS map key) |
| `CF_RADAR_TOKEN` | Internet outages (Cloudflare API token with Radar read) |

KV binding `STATS` stores visits and the hourly headline counts; add a Cron trigger `0 * * * *`.

## Disclaimer

Informational analysis, not official advice. In an emergency, follow the authorities.
