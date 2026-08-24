/*!
 * PizzaAlkimista — sw.js
 * Egyszerű "app shell" cache-first stratégia: az app maga offline is
 * elinduljon. A GitHub Pages relatív útvonalakat használ, ezért a CACHE
 * kulcsokat is relatívan soroljuk fel.
 */
const CACHE_NAME = 'pizzaalkimista-v14';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './timeline_rules.json',
  './css/style.css',
  './css/print.css',
  './js/calc.js',
  './js/db.js',
  './js/wiki-data.js',
  './js/app.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-180.png',
  './icons/icon-32.png',
  './icons/icon-16.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        APP_SHELL.map(url => cache.add(url).catch(err => console.warn('PWA Cache kihagyva:', url, err)))
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (res.ok && event.request.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return res;
      }).catch(err => {
        if (cached) return cached;
        return new Response('Network error', { status: 408, headers: { 'Content-Type': 'text/plain' } });
      });
    })
  );
});
