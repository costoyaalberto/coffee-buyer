// Coffee Buyer AI — Service Worker
// Estrategia: network-first para TODO (shell y API). Intenta traer la
// versión más reciente de la red siempre que hay señal, y solo cae a la
// última copia guardada si falla la conexión. Así las actualizaciones que
// subís a GitHub Pages se reflejan solas la próxima vez que abrís la app,
// en vez de quedar pegado en la primera versión que se cacheó.

const CACHE_NAME = 'coffee-buyer-v2';

const SHELL_FILES = [
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copia = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
