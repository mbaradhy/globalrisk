# atlas-api: setting the keys

The relay needs a few free keys. They are stored in Cloudflare as encrypted secrets, never in the code or this repo.

## Easiest: fill in one file and run one script
1. Install Node.js (LTS) from https://nodejs.org if you don't have it.
2. Double-click `set-secrets.cmd` (Windows) or run `./set-secrets.sh` (Mac/Linux).
   The first run creates `secrets.json` next to it.
3. Open `secrets.json`, paste your keys between the quotes, save.
4. Run the script again. The first time, a browser window asks you to log in to Cloudflare and allow Wrangler.
5. Reload the atlas.

Empty values are skipped, so you can add keys one at a time. `secrets.json` is ignored by git, so it is never uploaded.

| Name | Where to get it |
|---|---|
| `OPENSKY_CLIENT_ID`, `OPENSKY_CLIENT_SECRET` | opensky-network.org → Account → API Client → Create & Download Credential (clientId / clientSecret in the downloaded file) |
| `AISSTREAM_KEY` | aisstream.io → sign in with GitHub → API Keys → Create New API Key |
| `FIRMS_KEY` | firms.modaps.eosdis.nasa.gov/api/map_key → enter your email → key arrives by email |
| `CF_RADAR_TOKEN` | dash.cloudflare.com → My Profile → API Tokens → Create Custom Token → permission Account · Radar · Read |
| `RESOLVE_KEY` | any long password you make up; used to record question outcomes |
| `STATS_KEY` | any password you make up; opens the visitor statistics page |

## Without scripts
Cloudflare dashboard → Workers & Pages → atlas-api → Settings → Variables and Secrets → Add → Type: Secret, same names as above → Deploy.

## Recording an outcome (track record)
`https://atlas-api.mbaradhy.workers.dev/fc?id=QUESTION_ID&o=1&k=YOUR_RESOLVE_KEY` (o=1 yes, o=0 no; add `&del=1` to undo).
