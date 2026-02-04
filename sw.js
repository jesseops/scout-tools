const CACHE_NAME = "scout-tools-v5";
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./theme-preview.html",
  "./offline.html",
  "./assets/css/base.css",
  "./assets/css/theme-pack.css",
  "./assets/css/theme-troop.css",
  "./assets/js/theme.js",
  "./assets/js/alpine.min.js",
  "./assets/js/marked.min.js",
  "./assets/js/html2pdf.bundle.min.js",
  // Ensure directory indices are handled if GH Pages doesn't auto-resolve them in SW
  "./tools/uniform-inspection-checklist/",
  "./tools/uniform-inspection-checklist/index.html",
  "./tools/activity-timer/",
  "./tools/activity-timer/index.html",
  "./tools/markdown-to-pdf/",
  "./tools/markdown-to-pdf/index.html",
];

// 1. Install: Cache the "Application Shell"
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// 2. Activate: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// 3. Fetch: "Stale-While-Revalidate" Strategy
// This loads content from the cache INSTANTLY, but also fetches 
// a fresh copy from the network to update the cache for next time.
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Handle GitHub Pages specific requests (sometimes they come in full URL)
  // We can leave standard strategy for now.

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // A. Setup the Network Fetch for the background
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // If valid response, update cache
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch((err) => {
            // Network failed. If we didn't have a cached response,
            // and this is a page navigation, show offline.html.
            const accepts = event.request.headers.get("accept") || "";
            if (!cachedResponse && accepts.includes("text/html")) {
              return caches.match("./offline.html");
            }
            throw err;
          });

        // B. Return Cached Response immediately if we have it, 
        // otherwise wait for the network fetch
        return cachedResponse || fetchPromise;
      });
    })
  );
});
