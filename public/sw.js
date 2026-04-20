/**
 * LyfeCore Hub — Service Worker
 * 
 * Strategy: Network-first with cache fallback.
 * Caches the app shell so the user can launch the app offline,
 * while always preferring fresh data from the network.
 */

const CACHE_NAME = 'lyfecore-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/favicon.svg',
];

// Install — cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network first, cache fallback
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests (Firebase, Google APIs, etc.)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful navigation and asset responses
        if (response.ok && (event.request.mode === 'navigate' || event.request.destination === 'script' || event.request.destination === 'style')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline fallback
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // For navigation requests, return the cached index page (SPA)
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});
