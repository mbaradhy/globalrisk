// Sends the keys in secrets.json to the Cloudflare Worker "atlas-api" as encrypted secrets.
// Empty values are skipped, so you can fill in one key at a time and run this again.
const fs = require("fs"), path = require("path"), { spawnSync } = require("child_process");
const dir = __dirname, src = path.join(dir, "secrets.json"), tmp = path.join(dir, ".secrets.tmp.json");
if (!fs.existsSync(src)) {
  fs.copyFileSync(path.join(dir, "secrets.template.json"), src);
  console.log("Created secrets.json. Fill in your keys, save it, then run this again.");
  process.exit(0);
}
let all;
try { all = JSON.parse(fs.readFileSync(src, "utf8")); }
catch (e) { console.error("secrets.json is not valid JSON: " + e.message + "\nCheck the quotes and commas."); process.exit(1); }
const keep = {};
for (const [k, v] of Object.entries(all)) if (typeof v === "string" && v.trim()) keep[k] = v.trim();
const names = Object.keys(keep);
if (!names.length) { console.log("secrets.json has no values yet. Fill in at least one key."); process.exit(0); }
console.log("Sending " + names.length + " secret(s) to atlas-api: " + names.join(", "));
console.log("(A browser window may open the first time to log in to Cloudflare.)");
fs.writeFileSync(tmp, JSON.stringify(keep));
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const r = spawnSync(npx, ["--yes", "wrangler@4", "secret", "bulk", tmp, "--name", "atlas-api"], { stdio: "inherit", shell: process.platform === "win32" });
fs.unlinkSync(tmp);
if (r.status === 0) console.log("\nDone. Reload the atlas: the Sources panel turns green within a minute.");
else console.log("\nSomething went wrong (see above). If it is a login problem, run:  npx wrangler@4 login");
process.exit(r.status || 0);
