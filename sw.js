// Keeps فسحة playable offline: the pages come from the cache and refresh in the background.
const CACHE = "fos7a-v15";
const SHELL = ["./", "index.html", "foldit/", "foldit/index.html", "manifest.webmanifest", "privacy.html", "vendor/supabase.js", "vendor/591.supabase.js", "vendor/qrcode.js", "js/people.js", "js/common.js", "js/yard.js", "js/clean.js", "js/net.js", "js/hub.js", "js/room.js", "js/khallast.js", "js/questions.js", "js/khat.js", "js/fold.js", "js/trabee.js", "js/shell.js", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      const hit = await c.match(e.request);
      const fresh = fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
      return hit || fresh;
    }),
  );
});
