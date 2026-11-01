// Runs in the GitHub job next to the OpenSky bridge: reads GDELT's 15-minute event files, keeps protest events
// (CAMEO root code 14), groups them by place, day, theme and kind, and hands the result to the atlas-api relay.
// Sends at most every 20 minutes (the relay's store allows 1,000 writes a day on the free plan).
import { execFileSync } from "node:child_process";
const KEY = process.env.OSK_PUSH_KEY, RELAY = process.env.RELAY_URL || "https://atlas-api.mbaradhy.workers.dev";
if (!KEY) { console.log("OSK_PUSH_KEY missing: skipped"); process.exit(0); }
const pad = n => String(n).padStart(2, "0");
const stamp = d => d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + "00";
const meta = await (await fetch(RELAY + "/inc?meta=1")).json().catch(() => ({}));
const now = new Date(), q = new Date(Math.floor((now.getTime() - 16 * 60000) / 900000) * 900000);
if (meta.last && meta.last >= stamp(new Date(q.getTime() - 15 * 60000))) { console.log("incidents: up to date (" + meta.last + ")"); process.exit(0); }
const stamps = [];
for (let t = q.getTime(); stamps.length < 12; t -= 900000) { const s = stamp(new Date(t)); if (meta.last && s <= meta.last) break; stamps.push(s); }
stamps.reverse();
// theme from the article address (GDELT has no text) and the actor names
const TH = [["farm", /farm|tractor|agricult|agricol|paysan|landwirt|boer/], ["lab", /strike|union|pension|wage|worker|labou?r|greve|retraite|syndicat|streik|huelga|sciopero|teacher|nurse|doctor/],
  ["me", /gaza|palestin|israel|hamas|lebanon|iran/], ["clim", /climate|extinction|just-stop|letzte-generation|climat|fossil/],
  ["col", /cost-of-living|price|fuel|inflation|rent|housing|electricity|vie-chere|tax/], ["gov", /government|president|prime-minister|election|corruption|opposition|regime|parliament|resign/],
  ["war", /ukraine|russia|war|nato|peace/], ["mig", /migra|asylum|refugee|immigra/], ["rights", /women|lgbt|pride|abortion|rights|police-brutality|racis/]];
const theme = s => { s = s.toLowerCase(); for (const t of TH) if (t[1].test(s)) return t[0]; return "oth"; };
// armed-conflict themes (CAMEO 18 assault, 19 fight, 20 mass violence): by place named in the article address and actors
const WAR_TH = [["ukr", /ukrain|russia|kyiv|kharkiv|donbas|moscow|kremlin/], ["me", /gaza|lebanon|hezbollah|israel|iran|hamas|yemen|houthi|syria/], ["afr", /sudan|sahel|mali|niger|burkina|congo|nigeria|somalia|ethiopia|kenya|mozambique/], ["am", /haiti|gang|cartel|mexic|venezuela|colombia|brazil|ecuador|guatemala/], ["asia", /myanmar|burma|pakistan|afghan|manipur/]];
const warTheme = s => { s = s.toLowerCase(); for (const t of WAR_TH) if (t[1].test(s)) return t[0]; return "oth"; };
const WAR_KIND = { "18": "assault", "19": "fight", "20": "mass" };
const KIND = c => c.startsWith("145") ? "riot" : c.startsWith("143") ? "strike" : c.startsWith("144") ? "block" : c.startsWith("142") ? "hunger" : "protest";
const agg = {}; let lines = 0, kept = 0, files = 0;
for (const s of stamps) {
  const u = "http://data.gdeltproject.org/gdeltv2/" + s + ".export.CSV.zip";
  let txt;
  try { const r = await fetch(u, { signal: AbortSignal.timeout(30000) }); if (!r.ok) continue; const buf = Buffer.from(await r.arrayBuffer());
    const f = "/tmp/g.zip"; (await import("node:fs")).writeFileSync(f, buf); txt = execFileSync("unzip", ["-p", f], { maxBuffer: 64 << 20 }).toString("utf8"); files++; }
  catch (e) { console.log("skip " + s + ": " + e.message); continue; }
  for (const ln of txt.split("\n")) {
    lines++; const c = ln.split("\t"); const root = c[28]; if (c.length < 61 || !["14", "18", "19", "20"].includes(root)) continue;
    const war = root !== "14";
    const la = parseFloat(c[56]), lo = parseFloat(c[57]); if (isNaN(la) || isNaN(lo)) continue;
    const url = c[60] || "", dom = (url.match(/^https?:\/\/(?:www\.)?([^/]+)/) || [])[1] || "";
    const th = war ? warTheme(url + " " + c[6] + " " + c[16]) : theme(url + " " + c[6] + " " + c[16]), kd = war ? WAR_KIND[root] : KIND(c[26]), gt = +c[51], d = c[59].slice(0, 4) + "-" + c[59].slice(4, 6) + "-" + c[59].slice(6, 8);
    const t = Date.UTC(+c[59].slice(0, 4), +c[59].slice(4, 6) - 1, +c[59].slice(6, 8), +c[59].slice(8, 10), +c[59].slice(10, 12));
    const key = d + "|" + la.toFixed(1) + "|" + lo.toFixed(1) + "|" + th + "|" + kd;
    const o = agg[key] || (agg[key] = { d, k: key, la: +la.toFixed(2), lo: +lo.toFixed(2), th, c: kd, pg: war ? "war" : undefined, p: gt === 1 || gt === 5 ? 1 : 3, pl: c[52].slice(0, 80), cc: c[53], n: 0, m: 0, dm: [], u: [], t0: t, t1: t, um: 0 });
    o.n++; o.m += +c[31] || 0; if (dom && o.dm.indexOf(dom) < 0 && o.dm.length < 8) o.dm.push(dom);
    if (url && o.u.indexOf(url) < 0 && (o.u.length < 2 || (+c[31] || 0) > o.um)) { if (o.u.length >= 2) o.u.pop(); o.u.unshift(url); o.um = +c[31] || 0; }
    o.t0 = Math.min(o.t0, t); o.t1 = Math.max(o.t1, t); kept++;
  }
}
const rows = Object.values(agg).map(o => { delete o.um; return o; });
const body = JSON.stringify({ last: stamps[stamps.length - 1] || meta.last || "", rows });
const r = await fetch(RELAY + "/inc", { method: "POST", headers: { "Content-Type": "application/json", "X-Key": KEY }, body, signal: AbortSignal.timeout(60000) });
console.log("incidents: " + files + " GDELT files, " + lines + " events read, " + kept + " protest events, " + rows.length + " groups sent (" + Math.round(body.length / 1024) + " KB) → " + r.status);
if (r.status === 404 || r.status === 405) { console.log("relay not updated yet (run setup.cmd): skipped"); process.exit(0); }
if (!r.ok) process.exit(1);
