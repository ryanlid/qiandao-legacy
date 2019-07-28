const staticCacheName = "site-static-v4";
const dynamicCache = "site-dynamic";
const assets = [
  "/",
  "/index.html",
  "/about.html",
  "manifest.json",
  "/css/style.css",
  "https://static.oonnnoo.com/ajax/libs/jquery/3.3.1/jquery.min.js"
];

// install service worker
self.addEventListener("install", evt => {
  evt.waitUntil(
    caches.open(staticCacheName).then(cache => {
      console.log("caching shell assets");
      cache.addAll(assets);
    })
  );
});

// activate event
self.addEventListener("activate", evt => {
  console.log("service worker has been activated");
  evt.waitUntil(
    caches.keys().then(keys => {
      console.log(keys);
      return Promise.all(
        keys
          .filter(key => key !== staticCacheName)
          .map(key => caches.delete(key))
      );
    })
  );
});

// fetch event
self.addEventListener("fetch", evt => {
  evt.respondWith(
    caches
      .match(evt.request)
      .then(cacheRes => {
        return (
          cacheRes ||
          fetch(evt.request).then(fetchRes => {
            return caches.open(dynamicCache).then(cache => {
              cache.put(evt.request.url, fetchRes.clone());
              return fetchRes;
            });
          })
        );
      })
      .catch(() => {
        if (evt.request.url.indexOf(".html") > -1) {
          caches.match("/pages/fallback.html");
        }
      })
  );
});
