// Keeps فسحة playable offline. Online, every file comes fresh from the network (so an update shows up
// on the next open, iPhones included) and is saved; the saved copy is only used when there's no network
// or it takes too long. Supabase (sign-in, codes, rooms) never goes through the cache.
const CACHE = "fos7a-v37";
const SHELL = ["./", "index.html", "foldit/", "foldit/index.html", "manifest.webmanifest", "privacy.html", "vendor/supabase.js", "vendor/591.supabase.js", "vendor/qrcode.js", "js/people.js", "js/common.js", "js/yard.js", "js/clean.js", "js/net.js", "js/pass.js", "js/hub.js", "js/room.js", "js/khallast.js", "js/questions.js", "js/khat.js", "js/fold.js", "js/trabee.js", "js/alqab.js", "js/hisn.js", "js/ghash.js", "js/kanz.js", "vendor/jsqr.js", "js/tv.js", "js/shell.js", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).hostname.endsWith("supabase.co")) return;
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      const net = fetch(req, { cache: "no-cache" }).then((r) => { if (r.ok) c.put(req, r.clone()); return r; });
      const slow = new Promise((ok) => setTimeout(ok, 4000)).then(() => c.match(req));
      try {
        // whichever comes first: the network, or the saved copy after 4 seconds of waiting
        const r = await Promise.race([net, slow.then((hit) => hit || net)]);
        return r;
      } catch (err) {
        return (await c.match(req)) || (req.mode === "navigate" ? c.match("index.html") : Response.error());
      }
    }),
  );
});
