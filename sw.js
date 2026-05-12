/* =========================================
              CACHE VERSION
========================================= */

const CACHE = "sr-cache-v11";


/* =========================================
              FILE CACHE
========================================= */

const FILES = [

  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",

  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
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

    caches.keys()

      .then(keys => {

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


  /* CHỈ CACHE HTTP / HTTPS */

  if (
    !event.request.url.startsWith("http")
  ) {
    return;
  }


  event.respondWith(

    fetch(event.request)

      .then(response => {

        /* KHÔNG CACHE RESPONSE LỖI */

        if (
          !response ||
          response.status !== 200 ||
          response.type !== "basic"
        ) {

          return response;
        }

        const clone = response.clone();

        caches.open(CACHE)

          .then(cache => {

            cache.put(
              event.request,
              clone
            );
          });

        return response;
      })


      /* OFFLINE */

      .catch(() => {

        return caches.match(event.request)

          .then(res => {

            return (
              res ||
              caches.match("./index.html")
            );
          });
      })
  );
});
