/**
 * Bambeh Marketplace — Service Worker
 * Place this file at: /public/sw.js
 * It will be served at: https://yourdomain.com/sw.js
 *
 * Strategy:
 *   - App shell (HTML/JS/CSS): Cache First
 *   - API requests: Network First with offline fallback
 *   - Images: Stale While Revalidate
 */

const CACHE_NAME    = 'bambeh-v1';
const API_CACHE     = 'bambeh-api-v1';
const IMAGE_CACHE   = 'bambeh-images-v1';

// App shell resources to pre-cache
const PRECACHE_URLS = [
  '/',
  '/offline-mode',
];

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => ![CACHE_NAME, API_CACHE, IMAGE_CACHE].includes(name))
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET') return;
  if (!url.origin.includes(self.location.hostname) && !url.hostname.includes('supabase.co')) return;

  // Images → Stale While Revalidate
  if (request.destination === 'image') {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    return;
  }

  // API / Supabase → Network First
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase.co')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Navigation (HTML) → Network First, fallback to /offline-mode
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/offline-mode') || caches.match('/'))
    );
    return;
  }

  // JS/CSS/fonts → Cache First
  event.respondWith(cacheFirst(request, CACHE_NAME));
});

// ── Strategies ────────────────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || fetchPromise;
}

// ── Background Sync (for offline actions) ─────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

async function syncOfflineActions() {
  // In production: read queued actions from IndexedDB and replay them
  // e.g., messages sent while offline, orders placed while offline
  console.log('[SW] Syncing offline actions...');
}
