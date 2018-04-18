var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
  '/dist/styles.css',
  '/scripts/script.js'
];

self.addEventListener('install', function(event) {
    // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event){
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});