const CACHE_NAME = 'laudo-cache-v1';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './jspdf.min.js'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // ativa imediatamente

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  self.clients.claim(); // assume controle imediatamente

  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request).catch(() => {
          // fallback offline (opcional)
          return caches.match('./index.html');
        });
      })
  );
});