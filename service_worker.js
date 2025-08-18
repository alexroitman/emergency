// service_worker.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

// Cambiá esto en cada deploy
const SW_VERSION = 'v7';
const CACHE_NAME = `pwa-offline-${SW_VERSION}`;
const OFFLINE_FALLBACK = 'index.html';

self.addEventListener('install', (event) => {
  // Precache del fallback
  event.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.add(OFFLINE_FALLBACK))
  );
  // Activar al toque
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Tomar control y limpiar caches viejos
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(k => k.startsWith('pwa-offline-') && k !== CACHE_NAME)
          .map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// Navegaciones: network-first y sin reutilizar cache del navegador para HTML
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(
          new Request(event.request.url, { cache: 'no-store' })
        );
        return fresh;
      } catch (err) {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(OFFLINE_FALLBACK);
        return cached || new Response('Offline', { status: 503 });
      }
    })());
  }
  // Para otros requests, dejá pasar (o podés agregar caching si querés)
});
