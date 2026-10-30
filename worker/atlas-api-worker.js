// Global Risk Atlas — data relay Worker. © 2026 M. BARADHY
// Fetches public feeds that block direct browser requests, caches them, and adds CORS headers.
// Deploy as a separate Worker named "atlas-api" and keep its workers.dev address (atlas-api.<account>.workers.dev).

const ROUTES = {
  gdelt:     { base: "https://api.gdeltproject.org/api/v2/doc/doc",                ttl: 900 },
  reliefweb: { base: "https://api.reliefweb.int/v2/reports",                       ttl: 900 },
  poly:      { base: "https://gamma-api.polymarket.com/events",                    ttl: 600 },
  usgs:      { base: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson", ttl: 300 },
  eonet:     { base: "https://eonet.gsfc.nasa.gov/api/v3/events",                  ttl: 600 },
  kp:        { base: "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json", ttl: 600 },
  meteo:     { base: "https://api.open-meteo.com/v1/forecast",                     ttl: 900 },
  geo:       { base: "https://geocoding-api.open-meteo.com/v1/search",             ttl: 86400 }
};
const GDACS_RSS = "https://www.gdacs.org/xml/rss.xml";

const RSS = {
  // English
  f24en:   { url: "https://www.france24.com/en/rss",                      name: "France 24",  lang: "en" },
  bbc:     { url: "https://feeds.bbci.co.uk/news/world/rss.xml",          name: "BBC News",   lang: "en" },
  aje:     { url: "https://www.aljazeera.com/xml/rss/all.xml",            name: "Al Jazeera", lang: "en" },
  guard:   { url: "https://www.theguardian.com/world/rss",                name: "The Guardian", lang: "en" },
  npr:     { url: "https://feeds.npr.org/1004/rss.xml",                   name: "NPR",        lang: "en" },
  dwen:    { url: "https://rss.dw.com/rdf/rss-en-world",                  name: "DW",         lang: "en" },
  unnews:  { url: "https://news.un.org/feed/subscribe/en/news/all/rss.xml", name: "UN News",  lang: "en" },
  // French
  f24fr:   { url: "https://www.france24.com/fr/rss",                      name: "France 24",  lang: "fr" },
  lemonde: { url: "https://www.lemonde.fr/international/rss_full.xml",    name: "Le Monde",   lang: "fr" },
  rfi:     { url: "https://www.rfi.fr/fr/rss",                            name: "RFI",        lang: "fr" },
  finfo:   { url: "https://www.francetvinfo.fr/monde.rss",                name: "franceinfo", lang: "fr" },
  // Other languages (the atlas shows these when that language is selected)
  f24es:   { url: "https://www.france24.com/es/rss",                      name: "France 24",  lang: "es" },
  bbcmundo:{ url: "https://feeds.bbci.co.uk/mundo/rss.xml",               name: "BBC Mundo",  lang: "es" },
  elpais:  { url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/internacional/portada", name: "El País", lang: "es" },
  dwde:    { url: "https://rss.dw.com/xml/rss-de-all",                    name: "DW",         lang: "de" },
  tagess:  { url: "https://www.tagesschau.de/xml/rss2/",                  name: "tagesschau", lang: "de" },
  ansa:    { url: "https://www.ansa.it/sito/notizie/mondo/mondo_rss.xml", name: "ANSA",       lang: "it" },
  bbcpt:   { url: "https://feeds.bbci.co.uk/portuguese/rss.xml",          name: "BBC News Brasil", lang: "pt" },
  rtp:     { url: "https://www.rtp.pt/noticias/rss/mundo",                name: "RTP",        lang: "pt" },
  nos:     { url: "https://feeds.nos.nl/nosnieuwsbuitenland",             name: "NOS",        lang: "nl" },
  dr:      { url: "https://www.dr.dk/nyheder/service/feeds/udland",       name: "DR",         lang: "da" },
  yle:     { url: "https://yle.fi/rss/uutiset/tuoreimmat",                name: "Yle",        lang: "fi" },
  svt:     { url: "https://www.svt.se/nyheter/utrikes/rss.xml",           name: "SVT",        lang: "sv" },
  nrk:     { url: "https://www.nrk.no/urix/toppsaker.rss",                name: "NRK",        lang: "nb" },
  tvn24:   { url: "https://tvn24.pl/swiat.xml",                           name: "TVN24",      lang: "pl" },
  bbcua:   { url: "https://feeds.bbci.co.uk/ukrainian/rss.xml",          name: "BBC News Україна", lang: "uk" },
  bbcru:   { url: "https://feeds.bbci.co.uk/russian/rss.xml",             name: "BBC News Русская служба", lang: "ru" },
  dwru:    { url: "https://rss.dw.com/xml/rss-ru-all",                    name: "DW",         lang: "ru" },
  bbcar:   { url: "https://feeds.bbci.co.uk/arabic/rss.xml",              name: "BBC News عربي", lang: "ar" },
  f24ar:   { url: "https://www.france24.com/ar/rss",                      name: "France 24",  lang: "ar" },
  // Humanitarian
  rw:      { url: "https://reliefweb.int/updates/rss.xml",                name: "ReliefWeb",  lang: "un" }
};
function pick(xml, tag) {
  const m = xml.match(new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)</" + tag + ">", "i"));
  if (!m) return "";
  return m[1].replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}
async function rss(lang, ctx, debug) {
  const keys = Object.keys(RSS).filter(k => lang === "any" ? true : lang === "all" ? ["en", "fr", "un"].includes(RSS[k].lang) : lang ? RSS[k].lang === lang : RSS[k].lang !== "un" && ["en", "fr"].includes(RSS[k].lang));
  const cache = caches.default;
  const lists = await Promise.all(keys.map(async k => {
    const src = RSS[k];
    try {
      const ck = new Request(src.url);
      let r = await cache.match(ck);
      if (!r) {
        r = await fetch(src.url, { headers: { "User-Agent": "GlobalRiskAtlas/1.0 (+https://github.com/mbaradhy/globalrisk)" }, cf: { cacheTtl: 600, cacheEverything: true } });
        if (!r.ok) return [];
        const t = await r.text();
        r = new Response(t, { headers: { "Cache-Control": "public, max-age=600" } });
        ctx.waitUntil(cache.put(ck, r.clone()));
      }
      const xml = await r.text();
      return (xml.match(/<item[\s\S]*?<\/item>/gi) || []).slice(0, 25).map(it => ({
        title: pick(it, "title"), url: pick(it, "link") || pick(it, "guid"), date: pick(it, "pubDate") || pick(it, "dc:date"), source: src.name, lang: src.lang
      })).filter(x => x.title && x.url);
    } catch (e) { return []; }
  }));
  const items = [].concat(...lists).sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
  if (debug) return new Response(JSON.stringify({ sources: keys.map((k, i) => ({ id: k, name: RSS[k].name, lang: RSS[k].lang, items: lists[i].length })) }, null, 1), { headers: { "Content-Type": "application/json; charset=utf-8", ...CORS } });
  return new Response(JSON.stringify({ items }), { headers: { "Content-Type": "application/json; charset=utf-8", ...CORS } });
}

// GDACS: public alert feed (RSS) converted to the GeoJSON shape the atlas reads
async function gdacs(ctx) {
  const cache = caches.default, ck = new Request(GDACS_RSS + "?atlas=1");
  let r = await cache.match(ck);
  if (!r) {
    const up = await fetch(GDACS_RSS, { headers: { "User-Agent": "GlobalRiskAtlas/1.0 (+https://github.com/mbaradhy/globalrisk)" } });
    if (!up.ok) return new Response(JSON.stringify({ error: up.status }), { status: 502, headers: { "Content-Type": "application/json", ...CORS } });
    const xml = await up.text();
    const features = (xml.match(/<item[\s\S]*?<\/item>/gi) || []).map(it => {
      const lat = parseFloat(pick(it, "geo:lat")), lon = parseFloat(pick(it, "geo:long"));
      const pt = pick(it, "georss:point").split(/\s+/).map(parseFloat);
      const la = isNaN(lat) ? pt[0] : lat, lo = isNaN(lon) ? pt[1] : lon;
      if (isNaN(la) || isNaN(lo)) return null;
      return { type: "Feature", geometry: { type: "Point", coordinates: [lo, la] }, properties: {
        name: pick(it, "title"), alertlevel: pick(it, "gdacs:alertlevel"), eventtype: pick(it, "gdacs:eventtype"),
        fromdate: pick(it, "gdacs:fromdate") || pick(it, "pubDate"), url: { report: pick(it, "link") } } };
    }).filter(Boolean);
    r = new Response(JSON.stringify({ type: "FeatureCollection", features }), { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=600" } });
    ctx.waitUntil(cache.put(ck, r.clone()));
  }
  const out = new Response(r.body, r);
  Object.entries(CORS).forEach(([k, v]) => out.headers.set(k, v));
  return out;
}

// ---------- Visitor counter (no cookies, no IP stored): needs a KV binding named STATS
const day = d => d.toISOString().slice(0, 10);
function bump(o, k) { if (!k) return; o[k] = (o[k] || 0) + 1; }
async function hit(request, url, env, ctx) {
  const ok = new Response(null, { status: 204, headers: CORS });
  if (!env.STATS) return ok;
  const cf = request.cf || {};
  const ua = request.headers.get("User-Agent") || "";
  if (/bot|crawl|spider|preview|facebookexternalhit|whatsapp|telegram/i.test(ua)) return ok;
  const tab = (url.searchParams.get("t") || "").replace(/[^a-z]/g, "").slice(0, 12);
  const ref = (url.searchParams.get("r") || "").replace(/[^a-z0-9.\-]/gi, "").slice(0, 40) || "direct";
  const isNew = url.searchParams.get("v") === "1";
  const dev = /iPad|Tablet/i.test(ua) ? "tablet" : /Mobi|Android|iPhone/i.test(ua) ? "phone" : "computer";
  const k = "d:" + day(new Date());
  ctx.waitUntil((async () => {
    const d = (await env.STATS.get(k, "json")) || { views: 0, visits: 0, countries: {}, cities: {}, devices: {}, tabs: {}, refs: {}, langs: {} };
    d.views++;
    if (isNew) { d.visits++; bump(d.countries, cf.country || "??"); bump(d.cities, (cf.city ? cf.city + ", " : "") + (cf.country || "??")); bump(d.devices, dev); bump(d.refs, ref); bump(d.langs, (url.searchParams.get("l") || "").slice(0, 2)); }
    bump(d.tabs, tab);
    await env.STATS.put(k, JSON.stringify(d), { expirationTtl: 400 * 86400 });
  })());
  return ok;
}
async function stats(url, env) {
  if (!env.STATS || !env.STATS_KEY || url.searchParams.get("key") !== env.STATS_KEY)
    return new Response("Not allowed", { status: 403 });
  const n = Math.min(365, parseInt(url.searchParams.get("days") || "30", 10) || 30);
  const days = [], tot = { views: 0, visits: 0, countries: {}, cities: {}, devices: {}, tabs: {}, refs: {}, langs: {} };
  for (let i = n - 1; i >= 0; i--) {
    const dd = day(new Date(Date.now() - i * 86400000));
    const d = await env.STATS.get("d:" + dd, "json");
    days.push({ d: dd, views: d ? d.views : 0, visits: d ? d.visits : 0 });
    if (d) { tot.views += d.views; tot.visits += d.visits;
      ["countries", "cities", "devices", "tabs", "refs", "langs"].forEach(f => Object.entries(d[f] || {}).forEach(([k, v]) => tot[f][k] = (tot[f][k] || 0) + v)); }
  }
  if (url.searchParams.get("format") === "json") return new Response(JSON.stringify({ days, tot }), { headers: { "Content-Type": "application/json" } });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const top = (o, lim) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, lim || 15);
  const bars = (title, o, lim) => { const e = top(o, lim), m = Math.max(1, ...e.map(x => x[1]));
    return "<section><h2>" + title + "</h2>" + (e.length ? e.map(([k, v]) => "<div class=r><span>" + esc(k || "—") + "</span><b><i style='width:" + (v / m * 100) + "%'></i></b><em>" + v + "</em></div>").join("") : "<p>—</p>") + "</section>"; };
  const mx = Math.max(1, ...days.map(x => x.views));
  const chart = "<div class=ch>" + days.map(x => "<div title='" + x.d + ": " + x.visits + " visits, " + x.views + " views'><i style='height:" + (x.views / mx * 100) + "%'></i><s style='height:" + (x.visits / mx * 100) + "%'></s></div>").join("") + "</div><p class=lg><i></i> views <s></s> visits · " + days[0].d + " → " + days[days.length - 1].d + "</p>";
  const html = "<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'><title>Atlas statistics</title><style>body{margin:0;background:#0a1018;color:#e3e9ee;font:15px system-ui,sans-serif;padding:20px max(16px,4vw)}h1{font-size:1.5rem;margin:0 0 4px}h2{font-size:1rem;margin:0 0 8px;color:#7fd1ff}.k{display:flex;gap:12px;flex-wrap:wrap;margin:14px 0}.k div{background:#111a25;border:1px solid #24323f;border-radius:6px;padding:10px 16px}.k b{display:block;font-size:1.6rem}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}section{background:#111a25;border:1px solid #24323f;border-radius:6px;padding:12px 14px}.r{display:grid;grid-template-columns:minmax(0,1fr) 90px 36px;gap:8px;align-items:center;font-size:.86rem;margin:3px 0}.r span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.r b{height:7px;background:#1d2a37;border-radius:4px;overflow:hidden}.r i{display:block;height:100%;background:#7fd1ff}.r em{font-style:normal;text-align:right;color:#8c9aa8}.ch{display:flex;align-items:flex-end;gap:2px;height:140px;background:#111a25;border:1px solid #24323f;border-radius:6px;padding:8px}.ch div{flex:1;height:100%;position:relative}.ch i,.ch s{position:absolute;bottom:0;left:0;right:0;border-radius:2px 2px 0 0}.ch i{background:#2b4a66}.ch s{background:#7fd1ff;left:25%;right:25%}.lg{color:#8c9aa8;font-size:.8rem}.lg i,.lg s{display:inline-block;width:10px;height:10px;background:#2b4a66;vertical-align:middle}.lg s{background:#7fd1ff}a{color:#7fd1ff}</style>" +
    "<h1>Global Risk Atlas · statistics</h1><p class=lg>Last " + n + " days · <a href='?key=" + esc(url.searchParams.get("key")) + "&days=7'>7 d</a> · <a href='?key=" + esc(url.searchParams.get("key")) + "&days=30'>30 d</a> · <a href='?key=" + esc(url.searchParams.get("key")) + "&days=90'>90 d</a> · no cookies, no IP addresses stored</p>" +
    "<div class=k><div>Visits<b>" + tot.visits + "</b></div><div>Page and tab views<b>" + tot.views + "</b></div><div>Countries<b>" + Object.keys(tot.countries).length + "</b></div></div>" + chart +
    "<div class=g style='margin-top:14px'>" + bars("Countries", tot.countries) + bars("Cities", tot.cities) + bars("Devices", tot.devices) + bars("Tabs opened", tot.tabs) + bars("Came from", tot.refs) + bars("Language", tot.langs) + "</div>";
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

// GDELT allows one request every 5 seconds: space our own calls inside this isolate
let lastGdelt = 0;
async function gdeltSlot() {
  const wait = lastGdelt + 5500 - Date.now();
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastGdelt = Date.now();
}


// ---------- Live layers (planes, ships, internet outages, fires) ----------
const J = { "Content-Type": "application/json; charset=utf-8" };
function withCors(r, extra) { const o = new Response(r.body, r); Object.entries(CORS).forEach(([k, v]) => o.headers.set(k, v)); if (extra) Object.entries(extra).forEach(([k, v]) => o.headers.set(k, v)); return o; }
function jerr(status, msg) { return new Response(JSON.stringify({ error: msg }), { status, headers: { ...J, ...CORS } }); }
// cache helper: fresh copy for ttl seconds, stale copy for 1 day used when the source fails
async function cached(id, ttl, ctx, produce, type) {
  const cache = caches.default;
  const fk = new Request("https://atlas-cache.local/" + id), sk = new Request("https://atlas-cache.local/stale/" + id);
  let r = await cache.match(fk);
  if (r) return withCors(r);
  try {
    const body = await produce();
    const h = { "Content-Type": type || J["Content-Type"] };
    r = new Response(body, { headers: { ...h, "Cache-Control": "public, max-age=" + ttl } });
    ctx.waitUntil(Promise.all([cache.put(fk, r.clone()), cache.put(sk, new Response(body, { headers: { ...h, "Cache-Control": "public, max-age=86400" } }))]));
    return withCors(r);
  } catch (e) {
    const old = await cache.match(sk);
    if (old) return withCors(old, { "X-Atlas-Stale": "1" });
    return jerr(502, String(e && e.message || e));
  }
}
async function upText(u, headers) {
  const r = await fetch(u, { headers: { "User-Agent": "GlobalRiskAtlas/1.0 (+https://github.com/mbaradhy/globalrisk)", ...(headers || {}) } });
  const t = await r.text();
  if (!r.ok) throw new Error("upstream " + r.status + " " + t.slice(0, 120));
  return t;
}
// Air traffic around hotspots (ADS-B, open data from adsb.lol, fallback airplanes.live); radius 250 nm
const HOT = { gulf: [26.5, 54.5], levant: [33, 35.5], blacksea: [46.5, 32], baltic: [57.5, 21], taiwan: [24, 120.5], europe: [49, 4],
  london: [51.5, -1], madrid: [40.4, -3.7], rome: [42, 12.5], warsaw: [52, 19], istanbul: [40.5, 29.5], nordic: [59.5, 13], alps: [47, 9.5],
  nyc: [40.7, -74], chicago: [41.9, -87.6], atlanta: [33.6, -84.4], dallas: [32.9, -97], la: [34, -118.4], florida: [27.5, -81.5], denver: [39.8, -104.7], seattle: [47.4, -122.3],
  tokyo: [35.6, 139.8], shanghai: [31.2, 121.5], beijing: [40, 116.5], delhi: [28.6, 77.1], singapore: [1.35, 103.9], seoul: [37.5, 127], dubai: [25.2, 55.4],
  paris: [48.9, 2.4], frankfurt: [50, 8.6], amsterdam: [52.3, 4.8], athens: [37.9, 23.7], lisbon: [38.8, -9.1], dublin: [53.4, -6.3], moscow: [55.8, 37.6], kyiv: [50.4, 30.5],
  toronto: [43.7, -79.6], sf: [37.6, -122.4], phoenix: [33.4, -112], houston: [29.9, -95.3], dc: [38.9, -77.4], boston: [42.4, -71], minneapolis: [44.9, -93.2], mexico: [19.4, -99.1],
  saopaulo: [-23.4, -46.5], bogota: [4.7, -74.1], buenosaires: [-34.8, -58.5], lima: [-12, -77.1],
  cairo: [30.1, 31.4], johannesburg: [-26.1, 28.2], lagos: [6.6, 3.3], nairobi: [-1.3, 36.9], casablanca: [33.4, -7.6],
  riyadh: [24.9, 46.7], tehran: [35.7, 51.3], mumbai: [19.1, 72.9], bangkok: [13.7, 100.7], hongkong: [22.3, 113.9], chengdu: [30.6, 104], jakarta: [-6.1, 106.7], manila: [14.5, 121],
  sydney: [-33.9, 151.2], melbourne: [-37.7, 144.8], auckland: [-37, 174.8], natrack: [53, -25], anchorage: [61.2, -150] };
// Global air traffic from OpenSky Network (needs secrets OPENSKY_CLIENT_ID and OPENSKY_CLIENT_SECRET, free account)
let oskTok = null, oskExp = 0;
async function openskyAll(env, ctx) {
  return cached("planes-all", 90, ctx, async () => {
    const T = ms => ({ signal: AbortSignal.timeout(ms) });
    let why = "";
    try {
      if (!oskTok || Date.now() > oskExp) {
        const tr = await fetch("https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token", { ...T(12000),
          method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: "grant_type=client_credentials&client_id=" + encodeURIComponent(env.OPENSKY_CLIENT_ID) + "&client_secret=" + encodeURIComponent(env.OPENSKY_CLIENT_SECRET) });
        if (!tr.ok) throw new Error("token " + tr.status);
        const tj = await tr.json(); oskTok = tj.access_token; oskExp = Date.now() + ((tj.expires_in || 1800) - 60) * 1000;
      }
      const r = await fetch("https://opensky-network.org/api/states/all", { ...T(25000), headers: { Authorization: "Bearer " + oskTok, Accept: "application/json" } });
      if (r.ok) return '{"src":"opensky",' + (await r.text()).replace(/^\s*\{/, "");
      why = "api " + r.status;
    } catch (e) { why = String(e.message || e); }
    // the login server can be unreachable from Cloudflare: try the anonymous API (lower limits) before giving up
    try {
      const r = await fetch("https://opensky-network.org/api/states/all", { ...T(25000), headers: { Accept: "application/json", "User-Agent": "GlobalRiskAtlas/1.0" } });
      if (r.ok) return '{"src":"opensky-anon",' + (await r.text()).replace(/^\s*\{/, "");
      why += "; anonymous " + r.status;
    } catch (e) { why += "; anonymous " + (e.message || e); }
    throw new Error("opensky unreachable from Cloudflare (" + why + ")");
  });
}
async function planes(url, ctx, env) {
  const r = url.searchParams.get("r") || "gulf";
  if (r === "all") { if (!env.OPENSKY_CLIENT_ID || !env.OPENSKY_CLIENT_SECRET) return jerr(503, "OPENSKY credentials not set"); return openskyAll(env, ctx); }
  const h = HOT[r];
  if (!h) return jerr(400, "unknown region");
  return cached("planes-" + r, 90, ctx, async () => {
    try { return await upText(`https://api.adsb.lol/v2/point/${h[0]}/${h[1]}/250`, { Accept: "application/json" }); }
    catch (e) { return await upText(`https://api.airplanes.live/v2/point/${h[0]}/${h[1]}/250`, { Accept: "application/json" }); }
  });
}
// Ships: a few seconds of live AIS from aisstream.io (needs secret AISSTREAM_KEY)
const AIS_BOX = { hormuz: [[24, 54], [27.6, 58.6]], bab: [[11, 42], [15.5, 45]], suez: [[29.5, 32.2], [31.6, 32.8]], malacca: [[1, 100], [4.5, 104]], taiwan: [[22, 118], [26, 121.5]], finland: [[59, 22], [60.7, 30]], channel: [[49.8, -2], [51.3, 2]] };
function inBox(la, lo, b) { return la >= b[0][0] && la <= b[1][0] && lo >= b[0][1] && lo <= b[1][1]; }
async function collectAis(key, ms, boxes, cap) {
  const resp = await fetch("https://stream.aisstream.io/v0/stream", { headers: { Upgrade: "websocket" } });
  const ws = resp.webSocket;
  if (!ws) throw new Error("aisstream refused the connection (" + resp.status + ")");
  ws.accept();
  const ships = {}; let n = 0, err = "", closed = "";
  ws.addEventListener("close", ev => { closed = "closed by aisstream (" + ev.code + (ev.reason ? " " + ev.reason : "") + ")"; });
  let sample = "", perr = "";
  ws.addEventListener("message", async ev => {
    if (++n > (cap || 1500)) return;
    try {
      const x = ev.data;
      const txt = typeof x === "string" ? x : (x && typeof x.text === "function") ? await x.text() : new TextDecoder().decode(x instanceof ArrayBuffer ? new Uint8Array(x) : x);
      if (!sample) sample = txt.slice(0, 160);
      const d = JSON.parse(txt);
      if (d.error || d.Error) { err = String(d.error || d.Error); return; }
      const m = d.MetaData || d.Metadata || d.metaData; if (!m) return;
      const pr = (d.Message || {}).PositionReport || {};
      const la = m.latitude ?? m.Latitude ?? pr.Latitude, lo = m.longitude ?? m.Longitude ?? pr.Longitude; if (typeof la !== "number" || typeof lo !== "number") return;
      ships[m.MMSI] = [Math.round(la * 1000) / 1000, Math.round(lo * 1000) / 1000, Math.round((pr.Sog || 0) * 10) / 10, Math.round(pr.Cog || 0), String(m.ShipName || "").trim(), m.MMSI];
    } catch (e) { if (!perr) perr = String(e.message || e).slice(0, 80); }
  });
  ws.send(JSON.stringify({ APIKey: key, BoundingBoxes: boxes || Object.values(AIS_BOX), FilterMessageTypes: ["PositionReport"] }));
  await new Promise(r => setTimeout(r, ms || 9000));
  try { ws.close(1000, "done"); } catch (e) {}
  const list = Object.values(ships);
  if (!list.length) throw new Error("aisstream: " + (err || closed || "no positions received in " + Math.round((ms || 9000) / 1000) + " s (" + n + " messages" + (perr ? "; parse error: " + perr : "") + (sample ? "; first: " + sample : "") + ")")); // not cached, so the next call retries
  return list;
}
// keep every ship seen in the last 30 minutes (KV), so each short listen adds to the picture; the cron tops it up every 30 min
async function aisRefresh(env, ms) {
  let fresh = [], err = "";
  // two listens at once: the straits (exact counts) and the whole world (the map); each ship is kept 30 minutes
  const r = await Promise.allSettled([collectAis(env.AISSTREAM_KEY, ms), collectAis(env.AISSTREAM_KEY, ms, [[[-90, -180], [90, 180]]], 2500)]);
  r.forEach(x => { if (x.status === "fulfilled") fresh = fresh.concat(x.value); else if (!err) err = String(x.reason && x.reason.message || x.reason); });
  if (!env.STATS) return { list: fresh, err };
  const now = Date.now(), rec = (await env.STATS.get("ais:recent", "json")) || {};
  fresh.forEach(x => { rec[x[5]] = x.concat([now]); });
  Object.keys(rec).forEach(k => { if (now - rec[k][6] > 30 * 60000) delete rec[k]; });
  const ks = Object.keys(rec); if (ks.length > 8000) ks.sort((x, y) => rec[x][6] - rec[y][6]).slice(0, ks.length - 8000).forEach(k => delete rec[k]);
  await env.STATS.put("ais:recent", JSON.stringify(rec), { expirationTtl: 3600 });
  return { list: Object.values(rec).map(x => x.slice(0, 6)), err, fresh: fresh.length };
}
async function ships(env, ctx) {
  if (!env.AISSTREAM_KEY) return jerr(503, "AISSTREAM_KEY not set");
  return cached("ships5", 300, ctx, async () => {
    const r = await aisRefresh(env, 15000), list = r.list;
    if (!list.length) throw new Error(r.err || "aisstream: no ships yet");
    const counts = {}; Object.keys(AIS_BOX).forEach(k => counts[k] = list.filter(s => inBox(s[0], s[1], AIS_BOX[k])).length);
    let avg = null;
    if (env.STATS) { // keep the daily maximum per region to compare with a normal day
      const today = day(new Date()), k = "ais:" + today;
      const d = (await env.STATS.get(k, "json")) || {};
      Object.keys(counts).forEach(r => d[r] = Math.max(d[r] || 0, counts[r]));
      await env.STATS.put(k, JSON.stringify(d), { expirationTtl: 40 * 86400 });
      const past = [];
      for (let i = 1; i <= 14; i++) { const x = await env.STATS.get("ais:" + day(new Date(Date.now() - i * 86400000)), "json"); if (x) past.push(x); }
      if (past.length) { avg = {}; Object.keys(counts).forEach(r => avg[r] = Math.round(past.reduce((s, x) => s + (x[r] || 0), 0) / past.length)); avg._days = past.length; }
    }
    return JSON.stringify({ at: new Date().toISOString(), window: 30, fresh: r.fresh || 0, ships: list, counts, avg });
  });
}
// Internet outages by country (Cloudflare Radar; needs secret CF_RADAR_TOKEN with Radar read access)
async function outages(env, ctx) {
  if (!env.CF_RADAR_TOKEN) return jerr(503, "CF_RADAR_TOKEN not set");
  return cached("outages", 900, ctx, () => upText("https://api.cloudflare.com/client/v4/radar/annotations/outages?dateRange=7d&limit=60&format=json", { Authorization: "Bearer " + env.CF_RADAR_TOKEN, Accept: "application/json" }));
}
// Fires and strike-related hotspots, last 24 h (NASA FIRMS; needs secret FIRMS_KEY). Area: Ukraine, western Russia, Middle East
async function fires(env, ctx) {
  if (!env.FIRMS_KEY) return jerr(503, "FIRMS_KEY not set");
  return cached("fires", 1800, ctx, () => upText(`https://firms.modaps.eosdis.nasa.gov/api/area/csv/${env.FIRMS_KEY}/VIIRS_NOAA20_NRT/22,12,62,58/1`), "text/csv; charset=utf-8");
}
// What is configured (no secrets are returned)
function layersStatus(env) {
  return new Response(JSON.stringify({ planes: true, planesGlobal: !!(env.OPENSKY_CLIENT_ID && env.OPENSKY_CLIENT_SECRET), regions: Object.keys(HOT), ships: !!env.AISSTREAM_KEY, outages: !!env.CF_RADAR_TOKEN, fires: !!env.FIRMS_KEY, attention: !!env.STATS }), { headers: { ...J, ...CORS } });
}

// ---------- Media attention: headlines per risk, counted every hour (cron) or on demand ----------
const ATT_KW = {
  "iran-war": ["iran", "iranian", "iranien", "iranienne", "tehran", "téhéran"], hormuz: ["hormuz", "ormuz"],
  "ukr-war": ["ukraine", "ukrainian", "ukrainien", "ukrainienne", "kyiv", "kiev", "zelensky", "zelenski"], gaza: ["gaza"],
  lebanon: ["hezbollah", "lebanon", "liban"], houthis: ["houthi", "houthis"], sudan: ["sudan", "soudan", "darfur", "darfour"],
  sahel: ["sahel", "mali", "burkina"], drc: ["congo", "m23", "rdc"], taiwan: ["taiwan", "taïwan"],
  korea: ["north korea", "corée du nord", "pyongyang", "kim jong un"], "india-pak": ["pakistan", "kashmir", "cachemire"],
  baltic: ["baltic", "baltique", "estonia", "estonie", "latvia", "lettonie", "lithuania", "lituanie"], venezuela: ["venezuela"],
  hybrid: ["sabotage", "hybrid", "hybride", "drone incursion", "survol de drones"], ransomware: ["cyberattack", "cyber-attack", "cyberattaque", "ransomware", "hackers", "piratage"],
  oil: ["oil", "brent", "pétrole", "crude", "opec", "opep"], "eu-gas": ["gas price", "gas prices", "prix du gaz", "lng", "gnl", "gas storage"],
  inflation: ["inflation"], trade: ["tariff", "tariffs", "droits de douane", "trade war", "guerre commerciale"],
  food: ["food prices", "prix alimentaires", "wheat", "blé", "fao"], "el-nino": ["el niño", "el nino"], hunger: ["famine", "hunger", "faim", "malnutrition"],
  ebola: ["ebola"], h5n1: ["bird flu", "h5n1", "grippe aviaire"], heat: ["heatwave", "canicule", "cop31", "climate", "climat"],
  migration: ["migrants", "migrant", "migration", "asylum", "asile"], cables: ["undersea cable", "câble sous-marin", "pipeline"], "us-politics": ["midterm", "midterms", "mi-mandat"]
};
const ATT_RE = {};
Object.keys(ATT_KW).forEach(k => ATT_RE[k] = new RegExp("(^|[^a-z0-9à-ÿ])(" + ATT_KW[k].map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")([^a-z0-9à-ÿ]|$)", "i"));
function h32(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
async function attUpdate(env, ctx) {
  if (!env.STATS) return;
  const res = await rss("all", ctx); const { items } = await res.json();
  const k = "att:" + day(new Date());
  const d = (await env.STATS.get(k, "json")) || { n: 0, c: {}, s: "" };
  const seen = new Set(d.s ? d.s.split(",") : []);
  items.forEach(it => {
    const id = h32(it.title.toLowerCase()); if (seen.has(id)) return; seen.add(id); d.n++;
    Object.keys(ATT_RE).forEach(n => { if (ATT_RE[n].test(it.title)) d.c[n] = (d.c[n] || 0) + 1; });
  });
  d.s = Array.from(seen).slice(-6000).join(",");
  await env.STATS.put(k, JSON.stringify(d), { expirationTtl: 60 * 86400 });
  await env.STATS.put("att:last", String(Date.now()), { expirationTtl: 60 * 86400 });
}
async function attention(env, ctx) {
  if (!env.STATS) return jerr(503, "STATS KV not bound");
  const last = parseInt(await env.STATS.get("att:last") || "0", 10);
  if (Date.now() - last > 50 * 60000) { try { await attUpdate(env, ctx); } catch (e) {} }
  return cached("attention-" + Math.floor(Date.now() / 600000), 600, ctx, async () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const dd = day(new Date(Date.now() - i * 86400000));
      const x = await env.STATS.get("att:" + dd, "json");
      if (x) days.push({ d: dd, n: x.n, c: x.c });
    }
    return JSON.stringify({ at: new Date().toISOString(), sources: Object.values(RSS).filter(r => ["en", "fr", "un"].includes(r.lang)).map(r => r.name).filter((v, i, a) => a.indexOf(v) === i), days });
  });
}

// ---------- Global Risk Index history: browsers report the value they computed, at most once an hour each;
// the relay keeps up to 7 reports per hour and serves the hourly median (robust to an odd report).
async function gri(url, env, ctx) {
  if (!env.STATS) return jerr(503, "STATS KV not bound");
  const sv = url.searchParams.get("s"), P = sv === "3" ? "gri3:" : sv === "2" ? "gri2:" : "gri:"; // series 2 = tension score (30 Oct 2026); series 3 = P, chance of a new global shock (from 30 Oct 2026)
  const v = parseFloat(url.searchParams.get("v"));
  if (!isNaN(v)) {
    if (v < 0 || v > 100) return jerr(400, "out of range");
    const now = new Date(), k = P + day(now), hh = String(now.getUTCHours()).padStart(2, "0");
    const d = (await env.STATS.get(k, "json")) || { h: {} };
    const arr = d.h[hh] || [];
    if (arr.length < 7) { arr.push(Math.round(v * 10) / 10); d.h[hh] = arr; await env.STATS.put(k, JSON.stringify(d), { expirationTtl: 400 * 86400 }); }
    return new Response(JSON.stringify({ ok: true }), { headers: { ...J, ...CORS } });
  }
  const days = Math.min(90, Math.max(1, parseInt(url.searchParams.get("days") || "30", 10)));
  return cached(P + "hist-" + days + "-" + Math.floor(Date.now() / 900000), 900, ctx, async () => {
    const med = a => { const b = a.slice().sort((x, y) => x - y), m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
    const pts = [];
    for (let i = days - 1; i >= 0; i--) {
      const dd = day(new Date(Date.now() - i * 86400000));
      const x = await env.STATS.get(P + dd, "json");
      if (x) Object.keys(x.h).sort().forEach(hh => pts.push([dd + "T" + hh + ":00Z", Math.round(med(x.h[hh]) * 10) / 10]));
    }
    return JSON.stringify({ at: new Date().toISOString(), points: pts });
  });
}


// ---------- Forecast record (phase 3): question bands are versioned so each forecast can be scored once it resolves.
// Browsers report the bands they ship with (?v=JSON {id:[lo,hi]}); a new version is kept once 3 reports agree.
// Outcomes are set by the owner: /fc?id=taiwan&o=0&k=RESOLVE_KEY (o=1 yes, o=0 no, del=1 to remove; optional d=YYYY-MM-DD, n=note).
async function fc(url, env, ctx) {
  if (!env.STATS) return jerr(503, "STATS KV not bound");
  const sp = url.searchParams, ok = o => new Response(JSON.stringify(o), { headers: { ...J, ...CORS } });
  if (sp.get("auto")) {
    if (!env.RESOLVE_KEY || sp.get("k") !== env.RESOLVE_KEY) return jerr(403, "bad key");
    return ok({ ok: true, result: await autoResolve(env, true) });
  }
  if (sp.get("id")) {
    if (!env.RESOLVE_KEY || sp.get("k") !== env.RESOLVE_KEY) return jerr(403, "bad key");
    const id = sp.get("id").slice(0, 40), oc = (await env.STATS.get("fc:oc", "json")) || {};
    if (sp.get("del")) delete oc[id];
    else { const o = sp.get("o"); if (o !== "0" && o !== "1") return jerr(400, "o must be 0 or 1");
      oc[id] = { o: +o, d: (sp.get("d") || day(new Date())).slice(0, 10), n: (sp.get("n") || "").slice(0, 200) }; }
    await env.STATS.put("fc:oc", JSON.stringify(oc));
    return ok({ ok: true, outcomes: oc });
  }
  const v = sp.get("v");
  if (v) {
    let b; try { b = JSON.parse(v); } catch (e) { return jerr(400, "bad json"); }
    const keys = Object.keys(b || {});
    if (!keys.length || keys.length > 200 || keys.some(k => !/^[a-z0-9-]{1,40}$/.test(k) || !Array.isArray(b[k]) || b[k].length !== 2 || b[k].some(x => typeof x !== "number" || x < 0 || x > 100))) return jerr(400, "bad bands");
    const norm = JSON.stringify(Object.fromEntries(keys.sort().map(k => [k, b[k]])));
    const vs = (await env.STATS.get("fc:v", "json")) || [];
    if (vs.length && JSON.stringify(vs[vs.length - 1].b) === norm) return ok({ ok: true, same: true });
    const pend = (await env.STATS.get("fc:p", "json")) || {};
    pend[norm] = (pend[norm] || 0) + 1;
    if (pend[norm] >= 3) { vs.push({ d: new Date().toISOString().slice(0, 10), b: JSON.parse(norm) }); await env.STATS.put("fc:v", JSON.stringify(vs)); await env.STATS.put("fc:p", "{}"); return ok({ ok: true, stored: vs.length }); }
    const ks = Object.keys(pend); if (ks.length > 5) delete pend[ks[0]];
    await env.STATS.put("fc:p", JSON.stringify(pend), { expirationTtl: 30 * 86400 });
    return ok({ ok: true, pending: pend[norm] });
  }
  return cached("fc-" + Math.floor(Date.now() / 600000), 600, ctx, async () => JSON.stringify({ at: new Date().toISOString(), versions: (await env.STATS.get("fc:v", "json")) || [], outcomes: (await env.STATS.get("fc:oc", "json")) || {} }));
}



// ---------- Automatic outcomes: questions that public data can settle on their own (runs once a day from the cron).
// Outcomes you set by hand are never overwritten.
async function autoResolve(env, force) {
  if (!env.STATS) return { skipped: "no KV" };
  const today = day(new Date());
  if (!force && (await env.STATS.get("ar:last")) === today) return { skipped: "already ran today" };
  await env.STATS.put("ar:last", today, { expirationTtl: 3 * 86400 });
  const oc = (await env.STATS.get("fc:oc", "json")) || {}, done = {};
  // "ai": Nasdaq 100 closes 30 % or more below its 2026 high before 30 Oct 2027
  if (!oc.ai) try {
    const j = JSON.parse(await upText("https://query1.finance.yahoo.com/v8/finance/chart/%5ENDX?range=2y&interval=1d", { Accept: "application/json" }));
    const r = j.chart.result[0], ts = r.timestamp, cl = r.indicators.quote[0].close;
    let hi = 0, hiT = 0;
    ts.forEach((t, i) => { const d = new Date(t * 1000).toISOString().slice(0, 10); if (d.startsWith("2026") && cl[i] > hi) { hi = cl[i]; hiT = t; } });
    let hit = null;
    ts.forEach((t, i) => { const d = new Date(t * 1000).toISOString().slice(0, 10); if (!hit && t > hiT && d <= "2027-10-30" && cl[i] != null && cl[i] <= hi * 0.7) hit = { d, c: cl[i] }; });
    if (hit) done.ai = { o: 1, d: hit.d, n: "auto: Nasdaq 100 closed at " + Math.round(hit.c) + ", 30 % below its 2026 high of " + Math.round(hi) };
    else if (today > "2027-10-30") done.ai = { o: 0, d: "2027-10-30", n: "auto: no close 30 % below the 2026 high of " + Math.round(hi) };
    else done.ai_check = "2026 high " + Math.round(hi) + ", threshold " + Math.round(hi * 0.7) + ", last close " + Math.round(cl[cl.length - 1]);
  } catch (e) { done.ai_error = String(e.message || e).slice(0, 120); }
  // "el-nino": NOAA's seasonal ONI for JFM 2027 at +1.5 or more
  if (!oc["el-nino"]) try {
    const t = await upText("https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt");
    const m = t.match(/\bJFM\s+2027\s+[-\d.]+\s+([-\d.]+)/);
    if (m) { const v = parseFloat(m[1]); done["el-nino"] = { o: v >= 1.5 ? 1 : 0, d: "2027-03-31", n: "auto: NOAA ONI JFM 2027 = " + v }; }
    else done.elnino_check = "JFM 2027 not published yet";
  } catch (e) { done.elnino_error = String(e.message || e).slice(0, 120); }
  let changed = false;
  Object.keys(done).forEach(k => { if (done[k] && typeof done[k] === "object") { oc[k] = done[k]; changed = true; } });
  if (changed) await env.STATS.put("fc:oc", JSON.stringify(oc));
  await env.STATS.put("ar:log", JSON.stringify({ at: new Date().toISOString(), done }), { expirationTtl: 40 * 86400 });
  return done;
}

// ---------- OpenSky bridge: OpenSky blocks Cloudflare, so a scheduled GitHub job fetches it with your keys every 10 min
// and POSTs the snapshot here (header X-Key = secret OSK_PUSH_KEY); the atlas reads it with GET /osk.
async function osk(request, env, ctx) {
  if (!env.STATS) return jerr(503, "STATS KV not bound");
  if (request.method === "POST") {
    if (!env.OSK_PUSH_KEY || request.headers.get("X-Key") !== env.OSK_PUSH_KEY) return jerr(403, "bad key");
    const body = await request.text();
    if (body.length > 8e6 || !body.startsWith("{")) return jerr(400, "bad snapshot");
    await env.STATS.put("osk:last", body, { expirationTtl: 7200 });
    return new Response(JSON.stringify({ ok: true, bytes: body.length }), { headers: { ...J, ...CORS } });
  }
  return cached("osk-" + Math.floor(Date.now() / 60000), 60, ctx, async () => {
    const v = await env.STATS.get("osk:last");
    if (!v) throw new Error("no OpenSky snapshot yet (the GitHub job has not run, or its secrets are missing)");
    return v;
  });
}

// ---------- Markets: stock indices and commodities (Stooq, free, no key) and ECB exchange rates (Frankfurter)
const QUOTES = ["^spx", "^ndq", "^dji", "^cac", "^dax", "^ukx", "^nkx", "^hsi", "cb.f", "gc.f", "ng.f", "zw.f"];
const YAHOO = { "^spx": "^GSPC", "^ndq": "^NDX", "^dji": "^DJI", "^cac": "^FCHI", "^dax": "^GDAXI", "^ukx": "^FTSE", "^nkx": "^N225", "^hsi": "^HSI", "cb.f": "BZ=F", "gc.f": "GC=F", "ng.f": "NG=F", "zw.f": "ZW=F",
  "^stoxx": "^STOXX50E", "^sse": "000001.SS", "^bse": "^BSESN", "^kospi": "^KS11", "^asx": "^AXJO", "^tsx": "^GSPTSE", "^bvsp": "^BVSP", "^ibex": "^IBEX", "^ftmib": "FTSEMIB.MI", "^smi": "^SSMI", "^aex": "^AEX", "^omx": "^OMX", "^wig": "WIG20.WA", "^vix": "^VIX" };
async function quotesStooq() {
  const syms = QUOTES;
  const csv = await upText("https://stooq.com/q/l/?s=" + syms.map(encodeURIComponent).join("+") + "&f=sd2t2ohlc&h&e=csv");
  const rows = csv.trim().split(/\r?\n/), head = rows.shift().toLowerCase().split(",");
  if (head.indexOf("close") < 0) throw new Error("stooq: " + csv.slice(0, 80));
  const ix = n => head.indexOf(n);
  const out = rows.map(r => { const c = r.split(","); const num = k => { const v = parseFloat(c[ix(k)]); return isNaN(v) ? null : v; };
    return { s: (c[ix("symbol")] || "").toLowerCase(), close: num("close"), prev: num("open"), prevIsOpen: true }; }).filter(q => q.close != null);
  if (out.length < 3) throw new Error("stooq: too few quotes");
  return out;
}
async function quotesYahoo() {
  const res = await Promise.all(Object.keys(YAHOO).map(async k => {
    try {
      const j = JSON.parse(await upText("https://query1.finance.yahoo.com/v8/finance/chart/" + encodeURIComponent(YAHOO[k]) + "?range=5d&interval=1d", { Accept: "application/json" }));
      const m = j.chart.result[0].meta;
      return { s: k, close: m.regularMarketPrice, prev: m.chartPreviousClose ?? m.previousClose, cur: m.currency, t: m.regularMarketTime };
    } catch (e) { return null; }
  }));
  const out = res.filter(Boolean);
  if (out.length < 3) throw new Error("yahoo: too few quotes");
  return out;
}
async function quotes(ctx, debug) {
  if (debug) { const r = {}; for (const [n, f] of [["yahoo", quotesYahoo], ["stooq", quotesStooq]]) { try { r[n] = (await f()).length + " quotes"; } catch (e) { r[n] = String(e.message || e); } } return new Response(JSON.stringify(r, null, 1), { headers: { ...J, ...CORS } }); }
  return cached("quotes2", 600, ctx, async () => {
    let q, src;
    try { q = await quotesYahoo(); src = "Yahoo Finance"; } catch (e) { q = await quotesStooq(); src = "Stooq"; }
    return JSON.stringify({ at: new Date().toISOString(), src, quotes: q });
  });
}
async function fx(ctx) {
  return cached("fx", 3600, ctx, async () => {
    const start = day(new Date(Date.now() - 40 * 86400000));
    const q = start + "..?from=EUR&to=USD,GBP,CHF,JPY,CNY,PLN,SEK,NOK,DKK,TRY";
    try { return await upText("https://api.frankfurter.dev/v1/" + q, { Accept: "application/json" }); }
    catch (e) { return await upText("https://api.frankfurter.app/" + q, { Accept: "application/json" }); }
  });
}
// ---------- Official weather warnings: MeteoAlarm (Europe) by country, US National Weather Service by point
const MA = { AT: "austria", BE: "belgium", BA: "bosnia-herzegovina", BG: "bulgaria", HR: "croatia", CY: "cyprus", CZ: "czechia", DK: "denmark", EE: "estonia", FI: "finland", FR: "france", DE: "germany", GR: "greece", HU: "hungary", IS: "iceland", IE: "ireland", IL: "israel", IT: "italy", LV: "latvia", LT: "lithuania", LU: "luxembourg", MT: "malta", MD: "moldova", ME: "montenegro", NL: "netherlands", MK: "north-macedonia", NO: "norway", PL: "poland", PT: "portugal", RO: "romania", RS: "serbia", SK: "slovakia", SI: "slovenia", ES: "spain", SE: "sweden", CH: "switzerland", UA: "ukraine", GB: "united-kingdom" };
async function warnings(url, ctx) {
  const cc = (url.searchParams.get("cc") || "").toUpperCase(), lat = url.searchParams.get("lat"), lon = url.searchParams.get("lon");
  if (cc === "US" && lat && lon) {
    return cached("nws-" + (+lat).toFixed(2) + "," + (+lon).toFixed(2), 600, ctx, async () => {
      const j = JSON.parse(await upText("https://api.weather.gov/alerts/active?point=" + (+lat).toFixed(3) + "," + (+lon).toFixed(3), { Accept: "application/geo+json" }));
      return JSON.stringify({ src: "US National Weather Service", items: (j.features || []).map(f => ({ event: f.properties.event, severity: f.properties.severity, area: f.properties.areaDesc, onset: f.properties.onset, expires: f.properties.expires, title: f.properties.headline, url: f.properties["@id"] || "" })) });
    });
  }
  const slug = MA[cc];
  if (!slug) return new Response(JSON.stringify({ src: null, items: [], note: "no official warning feed for this country" }), { headers: { ...J, ...CORS } });
  return cached("ma-" + slug, 900, ctx, async () => {
    const xml = await upText("https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-" + slug);
    const items = (xml.match(/<entry[\s\S]*?<\/entry>/gi) || []).map(e => ({ event: pick(e, "cap:event"), severity: pick(e, "cap:severity"), level: pick(e, "cap:awareness_level"), area: pick(e, "cap:areaDesc"), onset: pick(e, "cap:onset") || pick(e, "cap:effective"), expires: pick(e, "cap:expires"), title: pick(e, "title"), url: (e.match(/<link[^>]*href="([^"]+)"/) || [])[1] || "" }))
      .filter(x => x.event || x.title).filter(x => !x.expires || Date.parse(x.expires) > Date.now());
    return JSON.stringify({ src: "MeteoAlarm", items });
  });
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Expose-Headers": "X-Atlas-Stale"
};

export default {
  async scheduled(event, env, ctx) { ctx.waitUntil(Promise.all([attUpdate(env, ctx).catch(() => {}), env.AISSTREAM_KEY ? aisRefresh(env, 20000).catch(() => {}) : null, autoResolve(env).catch(() => {})])); },
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(request.url);
    if (request.method === "POST" && /^\/(api\/)?osk/.test(url.pathname)) return osk(request, env, ctx);
    if (request.method !== "GET") return new Response("Method not allowed", { status: 405, headers: CORS });

    const key = url.pathname.replace(/^\/(api\/)?/, "").split("/")[0];
    if (key === "hit") return hit(request, url, env, ctx);
    if (key === "stats") return stats(url, env);
    if (key === "rss") {
      const lg = url.searchParams.get("lang") || "", dbg = url.searchParams.has("debug");
      if (dbg) return rss(lg, ctx, true);
      // whole answer cached 5 minutes per language, so feeds are parsed at most once every 5 minutes
      return cached("rss-out-" + lg, 300, ctx, async () => await (await rss(lg, ctx)).text());
    }
    if (key === "gdacs") return gdacs(ctx);
    if (key === "planes") return planes(url, ctx, env);
    if (key === "ships") return ships(env, ctx);
    if (key === "outages") return outages(env, ctx);
    if (key === "fires") return fires(env, ctx);
    if (key === "layers") return layersStatus(env);
    if (key === "attention") return attention(env, ctx);
    if (key === "gri") return gri(url, env, ctx);
    if (key === "fc") return fc(url, env, ctx);
    if (key === "osk") return osk(request, env, ctx);
    if (key === "quotes") return quotes(ctx, url.searchParams.has("debug"));
    if (key === "fx") return fx(ctx);
    if (key === "warnings") return warnings(url, ctx);
    const route = ROUTES[key];
    if (!route) {
      return new Response(JSON.stringify({ ok: true, routes: Object.keys(ROUTES).concat(["rss", "gdacs", "planes", "ships", "outages", "fires", "layers", "attention", "gri", "fc", "osk", "quotes", "fx", "warnings", "hit", "stats"]) }), {
        headers: { "Content-Type": "application/json", ...CORS }
      });
    }

    const target = route.base + url.search;
    const cache = caches.default;
    const freshKey = new Request(target, { method: "GET" });
    const staleKey = new Request(target + (target.includes("?") ? "&" : "?") + "__stale=1", { method: "GET" });
    let res = await cache.match(freshKey);
    if (!res) {
      let upstream = null, body = "", tries = key === "gdelt" ? 2 : 1;
      for (let i = 0; i < tries; i++) {
        if (key === "gdelt") await gdeltSlot();
        upstream = await fetch(target, {
          headers: { "User-Agent": "GlobalRiskAtlas/1.0 (+https://github.com/mbaradhy/globalrisk)", "Accept": "application/json" }
        });
        body = await upstream.text();
        if (upstream.status !== 429) break;
      }
      const okJson = upstream.ok && /^[\s]*[\[{]/.test(body);
      if (okJson) {
        res = new Response(body, { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=" + route.ttl } });
        const stale = new Response(body, { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
        ctx.waitUntil(Promise.all([cache.put(freshKey, res.clone()), cache.put(staleKey, stale)]));
      } else {
        const old = await cache.match(staleKey);
        if (old) {
          res = new Response(old.body, old);
          res.headers.set("X-Atlas-Stale", "1");
        } else {
          res = new Response(JSON.stringify({ error: upstream.status, detail: body.slice(0, 300) }), {
            status: 502, headers: { "Content-Type": "application/json; charset=utf-8" }
          });
        }
      }
    }
    const out = new Response(res.body, res);
    Object.entries(CORS).forEach(([k, v]) => out.headers.set(k, v));
    return out;
  }
};
