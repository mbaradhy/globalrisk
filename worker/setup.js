// One-click setup for the Global Risk Atlas relay:
//  1. fills in missing passwords in secrets.json   2. deploys the relay code (atlas-api-worker.js + wrangler.toml)
//  3. stores the keys as Cloudflare secrets        4. stores the OpenSky keys as GitHub secrets
//  5. runs the OpenSky bridge once and checks that the relay received the planes
const fs = require("fs"), path = require("path"), crypto = require("crypto"), { spawnSync } = require("child_process");
const REPO = "mbaradhy/globalrisk", RELAY = "https://atlas-api.mbaradhy.workers.dev", WIN = process.platform === "win32";
const dir = __dirname, src = path.join(dir, "secrets.json"), tmp = path.join(dir, ".secrets.tmp.json");
const say = (n, t) => console.log("\n[" + n + "/5] " + t);
const run = (cmd, args, opt) => spawnSync(cmd, args, { stdio: opt && opt.input != null ? ["pipe", "inherit", "inherit"] : "inherit", shell: WIN, cwd: dir, ...(opt || {}) });
const out = (cmd, args) => { const r = spawnSync(cmd, args, { encoding: "utf8", shell: WIN, cwd: dir }); return r.status === 0 ? (r.stdout || "").trim() : null; };
const stop = m => { console.error("\n✖ " + m); process.exit(1); };

// 1 · secrets.json
say(1, "Checking secrets.json");
if (!fs.existsSync(src)) { fs.copyFileSync(path.join(dir, "secrets.template.json"), src); stop("Created secrets.json. Paste your OpenSky, aisstream, FIRMS and Cloudflare Radar keys into it, save, and run setup again."); }
let S; try { S = JSON.parse(fs.readFileSync(src, "utf8")); } catch (e) { stop("secrets.json is not valid JSON (" + e.message + "). Check quotes and commas."); }
let made = [];
for (const k of ["OSK_PUSH_KEY", "RESOLVE_KEY", "STATS_KEY"]) if (!S[k] || !String(S[k]).trim()) { S[k] = crypto.randomBytes(18).toString("base64url").replace(/[-_]/g, "x"); made.push(k); }
if (made.length) { fs.writeFileSync(src, JSON.stringify(S, null, 2)); console.log("  Made up passwords for " + made.join(", ") + " and saved them in secrets.json (keep that file)."); }
if (!S.OPENSKY_CLIENT_ID || !S.OPENSKY_CLIENT_SECRET) console.log("  Note: no OpenSky keys in secrets.json, so the OpenSky steps will be skipped.");

// 2 · deploy the relay code
say(2, "Deploying the relay code to Cloudflare (a browser may open to log in; answer Y if Wrangler asks to overwrite dashboard settings)");
let r = run(WIN ? "npx.cmd" : "npx", ["--yes", "wrangler@4", "deploy"]);
if (r.status !== 0) stop("Deploy failed (see above). If it is a login problem, run:  npx wrangler@4 login");

// 3 · Cloudflare secrets
say(3, "Storing the keys in Cloudflare");
const keep = {}; for (const [k, v] of Object.entries(S)) if (typeof v === "string" && v.trim()) keep[k] = v.trim();
fs.writeFileSync(tmp, JSON.stringify(keep));
r = run(WIN ? "npx.cmd" : "npx", ["--yes", "wrangler@4", "secret", "bulk", tmp, "--name", "atlas-api"]);
fs.unlinkSync(tmp);
if (r.status !== 0) stop("Could not store the Cloudflare secrets (see above).");

if (!S.OPENSKY_CLIENT_ID || !S.OPENSKY_CLIENT_SECRET) { console.log("\n✔ Done (OpenSky skipped). Reload the atlas."); process.exit(0); }

// 4 · GitHub secrets (GitHub CLI)
say(4, "Storing the OpenSky keys in GitHub");
if (out("gh", ["--version"]) == null) {
  if (WIN) { console.log("  GitHub CLI not found: installing it with winget…"); run("winget", ["install", "--id", "GitHub.cli", "-e", "--accept-source-agreements", "--accept-package-agreements"]); }
  stop("GitHub CLI " + (WIN ? "was just installed. Close this window and double-click setup.cmd again." : "is needed: https://cli.github.com, then run setup again."));
}
if (out("gh", ["auth", "status"]) == null) { console.log("  Logging in to GitHub (a browser window opens)…"); r = run("gh", ["auth", "login", "--web", "-h", "github.com", "-p", "https"]); if (r.status !== 0) stop("GitHub login failed."); }
for (const k of ["OPENSKY_CLIENT_ID", "OPENSKY_CLIENT_SECRET", "OSK_PUSH_KEY"]) {
  r = run("gh", ["secret", "set", k, "--repo", REPO], { input: S[k].trim() });
  if (r.status !== 0) stop("Could not store " + k + " in GitHub.");
}

// 5 · first OpenSky run
say(5, "Running the OpenSky bridge once (about a minute)");
const before = out("gh", ["run", "list", "--workflow", "opensky.yml", "--repo", REPO, "--limit", "1", "--json", "databaseId", "-q", ".[0].databaseId"]);
r = run("gh", ["workflow", "run", "opensky.yml", "--repo", REPO]);
if (r.status !== 0) stop("Could not start the GitHub job. Check github.com/" + REPO + "/actions (Actions must be enabled).");
let id = null;
for (let i = 0; i < 20 && !id; i++) { spawnSync(WIN ? "timeout" : "sleep", WIN ? ["/t", "3", "/nobreak"] : ["3"], { shell: WIN, stdio: "ignore" }); const x = out("gh", ["run", "list", "--workflow", "opensky.yml", "--repo", REPO, "--limit", "1", "--json", "databaseId", "-q", ".[0].databaseId"]); if (x && x !== before) id = x; }
if (!id) stop("The job did not start in time. Look at github.com/" + REPO + "/actions");
r = run("gh", ["run", "watch", id, "--repo", REPO, "--exit-status"]);
if (r.status !== 0) { run("gh", ["run", "view", id, "--repo", REPO, "--log-failed"]); stop("The OpenSky job failed: the lines above say why (OpenSky, keys or relay)."); }
(async () => {
  try { const j = await (await fetch(RELAY + "/osk")).json(); console.log("\n✔ Done. The relay holds " + (j.n || (j.states || []).length) + " aircraft from OpenSky. Reload the atlas."); }
  catch (e) { console.log("\n✔ GitHub job succeeded. Reload the atlas in a minute."); }
})();
