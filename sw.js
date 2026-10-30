/* Global Risk Atlas service worker: the app opens offline (last saved version and data), updates when online. */
const V = "gra-v5", SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== V + "-rt").map(k => caches.delete(k)))).then(() => self.clients.claim())); });
const LIB = /cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com|fonts\.(googleapis|gstatic)\.com/;
function netFirst(req, ms) {
  return new Promise(res => {
    let done = false; const t = setTimeout(() => { if (!done) caches.match(req).then(r => { if (r && !done) { done = true; res(r); } }); }, ms);
    fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(V + "-rt").then(x => x.put(req, c)); } if (!done) { done = true; clearTimeout(t); res(r); } })
      .catch(() => caches.match(req).then(r => { if (!done) { done = true; clearTimeout(t); res(r || new Response("offline", { status: 503 })); } }));
  });
}
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (req.mode === "navigate") { e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(V).then(x => x.put("index.html", c)); return r; }).catch(() => caches.match("index.html"))); return; }
  if (LIB.test(u.hostname)) { e.respondWith(caches.match(req).then(r => r || fetch(req).then(n => { const c = n.clone(); caches.open(V + "-rt").then(x => x.put(req, c)); return n; }))); return; }
  if (/atlas-api\./.test(u.hostname) && !/\/(planes|ships|osk|hit)/.test(u.pathname)) { e.respondWith(netFirst(req, 15000)); return; }
  if (u.origin === location.origin) e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
self.addEventListener("notificationclick", e => { e.notification.close(); e.waitUntil(self.clients.matchAll({ type: "window" }).then(cs => cs.length ? cs[0].focus() : self.clients.openWindow("./"))); });
