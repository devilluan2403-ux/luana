/* =============================================
   Service Worker - Bản mới hoàn toàn
   Hỗ trợ offline 100%, auto update
   ============================================= */

const CACHE_NAME = "sr-app-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];

/* ========== INSTALL ========== */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

/* ========== ACTIVATE (Xóa cache cũ) ========== */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

/* ========== FETCH ========== */
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(res => {
      return (
        res ||
        fetch(event.request).catch(() => {
          return caches.match("./index.html");
        })
      );
    })
  );
});
