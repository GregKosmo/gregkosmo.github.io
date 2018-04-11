var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
  '/',
  '/main.css',
  '/script.js',
  '/index.html'
];

self.addEventListener('install', function(event) {
    // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(e){
    console.log(event.request.url);
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});