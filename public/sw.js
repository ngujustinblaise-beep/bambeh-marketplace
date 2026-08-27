/* Bambeh service worker - FIX410
 *
 * Rules, in order of importance:
 *  1. NEVER touch Supabase, CamPay or any cross-origin request. Caching an
 *     auth call or replaying a payment would be far worse than being offline.
 *  2. index.html is NETWORK FIRST, so a new deploy is picked up immediately
 *     and users are never stuck on an old build.
 *  3. Hashed build assets are CACHE FIRST. Their filenames change on every
 *     build, so a cached one is always the right one - and this is what makes
 *     the app open instantly on a slow Yaounde connection.
 *  4. On a failed navigation we serve the cached shell instead of the
 *     browser's dinosaur page.
 */
const VERSION    = 'bambeh-v1';
const SHELL      = VERSION + '-shell';
const ASSETS     = VERSION + '-assets';
const SHELL_URLS = ['/', '/index.html', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL)
      .then((c) => c.addAll(SHELL_URLS).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // rule 1 - only ever same-origin GETs
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (_e) { return; }
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/auth/') || url.pathname.startsWith('/rest/')) return;

  // rule 2 - the app shell, network first
  if (req.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put('/index.html', copy)).catch(() => undefined);
          return res;
        })
        .catch(() => caches.match('/index.html').then((r) => r || Response.error()))
    );
    return;
  }

  // rule 3 - hashed build output, cache first
  if (url.pathname.startsWith('/assets/') || /\.(js|css|png|jpg|jpeg|webp|svg|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(ASSETS).then((c) => c.put(req, copy)).catch(() => undefined);
        }
        return res;
      }).catch(() => hit))
    );
  }
});