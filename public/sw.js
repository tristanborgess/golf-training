/* Production build replaces the version. Cache names are scoped to this app. */
const VERSION = "__BUILD_VERSION__";
const CACHE = `range-notes-offline-${VERSION}`;
const READY = "/__range_notes_ready__";
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const response = await fetch("/precache.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Offline manifest unavailable");
      const manifest = await response.json();
      if (manifest.version !== VERSION)
        throw new Error("Offline version mismatch");
      const cache = await caches.open(CACHE);
      try {
        await cache.addAll(
          manifest.urls.map((url) => new Request(url, { cache: "reload" })),
        );
        await cache.put(READY, new Response(VERSION));
        await self.skipWaiting();
      } catch (error) {
        await caches.delete(CACHE);
        throw error;
      }
    })(),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys())
        if (name.startsWith("range-notes-offline-") && name !== CACHE)
          await caches.delete(name);
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("message", (event) => {
  if (event.data?.type === "OFFLINE_STATUS")
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE);
        const ready = Boolean(await cache.match(READY));
        event.ports[0]?.postMessage({ ready, version: VERSION });
      })(),
    );
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin)
    return;
  if (url.pathname === "/sw.js" || url.pathname === "/precache.json") return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      let key = url.pathname;
      if (event.request.mode === "navigate")
        key = key.endsWith("/")
          ? `${key}index.html`
          : key.endsWith(".html")
            ? key
            : `${key}/index.html`;
      const cached = await cache.match(key);
      if (cached) return cached;
      try {
        return await fetch(event.request);
      } catch {
        return new Response(
          "Range Notes: this page is not saved offline. /en/ or /es/",
          {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          },
        );
      }
    })(),
  );
});
