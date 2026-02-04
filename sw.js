const CACHE_NAME = "scout-tools-v1";
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./offline.html",
  "./assets/css/base.css",
  "./assets/css/theme-pack.css",
  "./assets/css/theme-troop.css",
  "./assets/js/theme.js",
  "./tools/uniform-inspection-checklist/",
  "./tools/uniform-inspection-checklist/index.html",
  "./tools/activity-timer/",
  "./tools/activity-timer/index.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key === CACHE_NAME ? null : caches.delete(key))))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("./offline.html"));
    })
  );
});
