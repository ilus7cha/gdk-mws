var CACHE_STATIC = 'static-v1';
var CACHE_DYNAMIC = 'dynamic-v2';
var STATIC_FILES = [
    '/',
    '/index.html',
    // '/offline.html'
];

self.addEventListener('install', function (event) {
    self.skipWaiting();
    console.log('[Service Worker] installing service worker...', event);
    // cache API
    event.waitUntil(
        caches.open(CACHE_STATIC) // store the asstes to cache
            .then(function (cache) {
                console.log('[Service Worker] Caching Core Assest...');
                //cache.add('/src/js/app.js'); // add single asset to cache
                // cache multiple assest
                // set precache of core assets
                cache.addAll(STATIC_FILES)
            })
    )
});

self.addEventListener('activate', function (event) {

    console.log('[Service Worker] Activate service worker...', event);
    // clean up the old version caches
    event.waitUntil(
        caches.keys() // to store the list of cache in the storage
            .then(function (keyList) {
                return Promise.all(keyList.map(function (key) { // convert list array to promise wait untul all list is get
                    if (key !== CACHE_STATIC && key !== CACHE_DYNAMIC) { // check if the name of list cache not the current our assets
                        console.log('[Service Worker] Removing Old Cache', key);
                        return caches.delete(key);
                    }
                }));
            })
    )
    return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(CACHE_DYNAMIC).then(function(cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request).then(function(response) {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
);
});