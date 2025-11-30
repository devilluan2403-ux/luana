const CACHE = "sr-cache-v1";
const FILES = [
  "index.html",
  "style.css",
  "app.js"
  // KHÔNG CACHE manifest hoặc icon
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
});

// DÙNG NETWORK FIRST để icon, manifest luôn cập nhật
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
