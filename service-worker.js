// Coffee Buyer AI — Service Worker
// Estrategia: cache-first para el shell (HTML/manifest/íconos),
// network-first con fallback a cache para las llamadas a la API.
// Así la app abre instantáneo aunque no haya señal, mostrando el
// último dataset conocido con lo que ya trajo antes.

const CACHE_SHELL = 'coffee-buyer-shell-v1';
const CACHE_API = 'coffee-buyer-api-v1';

const SHELL_FILES = [
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_SHELL).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_SHELL && k !== CACHE_API)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Llamadas a Apps Script (la API): red primero, cache como respaldo si falla.
  if (url.hostname.includes('script.google.com')) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copia = res.clone();
          caches.open(CACHE_API).then((cache) => cache.put(event.request, copia));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Shell de la app: cache primero, red como respaldo.
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
