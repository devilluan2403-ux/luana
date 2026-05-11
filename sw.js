const CACHE = "sr-cache-v3";

const FILES = [

  "./",
  "./index.html",
  "./style.css",
  "./app.js"
];


/* =========================================
                INSTALL
========================================= */

self.addEventListener("install", event => {

  self.skipWaiting();

  event.waitUntil(

    caches.open(CACHE)

      .then(cache => {

        return cache.addAll(FILES);
      })
  );
});


/* =========================================
                ACTIVATE
========================================= */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys => {

      return Promise.all(

        keys.map(key => {

          if (key !== CACHE) {

            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});


/* =========================================
                  FETCH
========================================= */

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  event.respondWith(

    fetch(event.request)

      .then(response => {

        const clone = response.clone();

        caches.open(CACHE)
          .then(cache => {

            cache.put(event.request, clone);
          });

        return response;
      })

      .catch(() => {

        return caches.match(event.request)
          .then(res => {

            return res || caches.match("./index.html");
          });
      })
  );
});
