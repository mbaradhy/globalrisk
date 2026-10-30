// Runs on GitHub Actions every 10 minutes: fetches OpenSky with your keys (OpenSky blocks Cloudflare, not GitHub)
// and hands a compact worldwide snapshot to the atlas-api relay, which serves it to the atlas.
const { OPENSKY_CLIENT_ID: id, OPENSKY_CLIENT_SECRET: secret, OSK_PUSH_KEY: key } = process.env;
const RELAY = process.env.RELAY_URL || "https://atlas-api.mbaradhy.workers.dev";
if (!id || !secret || !key) { console.error("Missing secret: OPENSKY_CLIENT_ID, OPENSKY_CLIENT_SECRET and OSK_PUSH_KEY are needed (repo Settings → Secrets and variables → Actions)."); process.exit(1); }
const tr = await fetch("https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token", {
  method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "client_credentials", client_id: id, client_secret: secret }), signal: AbortSignal.timeout(30000) });
if (!tr.ok) { console.error("OpenSky token failed: " + tr.status + " " + (await tr.text()).slice(0, 200)); process.exit(1); }
const { access_token } = await tr.json();
const r = await fetch("https://opensky-network.org/api/states/all", { headers: { Authorization: "Bearer " + access_token }, signal: AbortSignal.timeout(60000) });
if (!r.ok) { console.error("OpenSky states failed: " + r.status + " " + (await r.text()).slice(0, 200)); process.exit(1); }
const j = await r.json();
const R = (v, d) => v == null ? null : Math.round(v * d) / d;
// compact rows: [icao24, callsign, country, lon, lat, alt_m, on_ground, speed_m_s, track, last_contact]
const st = (j.states || []).filter(a => a[5] != null && a[6] != null).map(a => [a[0], (a[1] || "").trim(), a[2], R(a[5], 1000), R(a[6], 1000), R(a[7] ?? a[13], 1), a[8] ? 1 : 0, R(a[9], 10), R(a[10], 1), a[4] || a[3]]);
const body = JSON.stringify({ time: j.time, n: st.length, states: st });
const p = await fetch(RELAY + "/osk", { method: "POST", headers: { "Content-Type": "application/json", "X-Key": key }, body, signal: AbortSignal.timeout(60000) });
const t = await p.text();
if (!p.ok) { console.error("Relay refused the snapshot: " + p.status + " " + t.slice(0, 200)); process.exit(1); }
console.log("OK: " + st.length + " aircraft sent to the relay (" + Math.round(body.length / 1024) + " KB). " + t.slice(0, 120));
