// BAMBEH_DEPLOY_TOKEN__SW_FIX959_CLEAN
/*
 * public/sw.js - Bambeh's service worker - FIX959 (Package 15, Big 1 Nov 2026: "the app keeps failing to open ...
 * the light app version that works on all kinds of network"). Replaces FIX410b.
 *
 * It only runs on the website (index.html registers it on bambeh.com over https, never inside the Android app).
 * It never touches Supabase, the payments server or any other site's data: only this site's own files.
 *
 *  1. OPENING THE APP. The page itself (index.html) is asked from the network first. If the network has not answered
 *     within 4.5 seconds - or fails - the copy saved at the last good visit opens instead, and the network answer, when
 *     it comes, is saved for next time. With no saved copy and no network, a small "no connection" page in the five
 *     languages tries again by itself.
 *  2. THE APP'S FILES (/assets/, named by their content, so they never change) are kept once downloaded and served
 *     from the phone ever after - no more asking the server about each file on every visit. A few seconds after the
 *     app has opened, the page asks this worker to save the current release: the page itself, every file it names,
 *     and the screens already downloaded (Home, usually).
 *     The page is saved only once all of its files are, so a saved copy never asks for a file the server no longer
 *     has. Past 220 files the oldest are dropped - never one the saved page needs.
 *  3. ICONS, the manifest and fonts outside /assets/: from the phone at once, refreshed in the background.
 *  4. SAVE DATA (FIX958): while the member's data-saving switch is on, photos from other sites (adverts, profiles) are
 *     not downloaded on lists and on Home - a small grey picture stands in. On an item's own page they load as usual.
 *     The page tells this worker the switch and the screen; nothing else.
 */
'use strict';

var VERSION = 'fix959';
var SHELL = 'bambeh-shell-' + VERSION;
var ASSETS = 'bambeh-assets';            // content-named files: shared by every release
var STATIC = 'bambeh-static-' + VERSION;
var STATE = 'bambeh-state';
var KEEP = [SHELL, ASSETS, STATIC, STATE];
var SHELL_URL = '/index.html';
var NAV_TIMEOUT_MS = 4500;
var ASSET_LIMIT = 220;
var STATIC_RE = /\.(png|jpe?g|svg|webp|gif|ico|webmanifest|woff2?)$/i;
var DETAIL_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|\/(item|items|detail|details|listing|product)\//i;

var clientState = new Map();   // client id -> { lite, route }
var lastState = null;          // the last state any page sent (kept across restarts in the STATE cache)
var restoredDone = false;

function isHtml(res) {
  var t = (res && res.headers && res.headers.get('content-type')) || '';
  return t.indexOf('text/html') >= 0;
}

function assetUrls(html) {
  var out = [];
  var re = /(?:src|href)="(\/assets\/[^"?#]+)"/g;
  var m;
  while ((m = re.exec(html)) !== null) {
    if (out.indexOf(m[1]) < 0) out.push(m[1]);
  }
  return out;
}

// Drops the oldest files past ASSET_LIMIT, never one the saved page names.
function trim(cache) {
  return cache.keys().then(function (keys) {
    if (keys.length <= ASSET_LIMIT) return null;
    return caches.open(SHELL).then(function (s) { return s.match(SHELL_URL); }).then(function (r) {
      return r ? r.text() : '';
    }).then(function (html) {
      var keep = assetUrls(html);
      var extra = keys.length - ASSET_LIMIT;
      var drop = [];
      for (var i = 0; i < keys.length && drop.length < extra; i++) {
        var path = new URL(keys[i].url).pathname;
        if (keep.indexOf(path) < 0) drop.push(keys[i]);
      }
      return Promise.all(drop.map(function (k) { return cache.delete(k); }));
    });
  });
}

// Save one content-named file, unless already saved. A server answering with a page (text/html) is never saved under
// a file's name.
function saveAsset(cache, url) {
  return cache.match(url).then(function (hit) {
    if (hit) return null;
    return fetch(url, { credentials: 'same-origin' }).then(function (res) {
      if (res && res.ok && !isHtml(res)) return cache.put(url, res);
      return null;
    });
  }).catch(function () { return null; });
}

// The page and every file it names, saved together (three at a time).
function saveShell(html) {
  return caches.open(SHELL).then(function (shell) {
    return caches.open(ASSETS).then(function (assets) {
      var urls = assetUrls(html);
      var i = 0;
      function next() {
        if (i >= urls.length) return Promise.resolve();
        var u = urls[i++];
        return saveAsset(assets, u).then(next);
      }
      return Promise.all([next(), next(), next()]).then(function () {
        return Promise.all(urls.map(function (u) { return assets.match(u); }));
      }).then(function (found) {
        // the page is saved only once ALL its files are, so a saved page never lacks one
        for (var k = 0; k < found.length; k++) { if (!found[k]) return false; }
        return shell.put(SHELL_URL, new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }))
          .then(function () { return trim(assets); }).then(function () { return true; });
      });
    });
  });
}

function fetchShell() {
  return fetch(SHELL_URL, { cache: 'no-store', credentials: 'same-origin' }).then(function (res) {
    if (!res || !res.ok || !isHtml(res)) throw new Error('no page');
    return res.text().then(function (html) {
      if (html.indexOf('id="root"') < 0) throw new Error('not the app');
      return html;
    });
  });
}

// Installing downloads nothing: the page asks for the release to be saved once it has opened (bambeh-save-shell),
// when its files are already on the phone - so nothing is downloaded twice.
self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.filter(function (n) { return KEEP.indexOf(n) < 0; }).map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// ---------------------------------------------------------------------------------------------- opening the app
var OFFLINE = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<title>Bambeh</title><style>body{font-family:system-ui,sans-serif;background:#f0fdfa;margin:0;display:flex;min-height:100vh;' +
  'align-items:center;justify-content:center;padding:16px;color:#134e4a}main{max-width:380px;background:#fff;border-radius:16px;' +
  'padding:24px;box-shadow:0 4px 20px rgba(0,0,0,.08);text-align:center}h1{font-size:20px;margin:8px 0}p{font-size:15px;' +
  'line-height:1.45;margin:6px 0}button{margin-top:14px;background:#0d9488;color:#fff;border:0;border-radius:12px;padding:12px 22px;' +
  'font-size:16px;font-weight:700}</style></head><body><main><div style="font-size:40px">&#128246;</div>' +
  '<h1>No connection</h1><p>Bambeh opens as soon as your phone is back online.</p>' +
  '<p lang="fr">Pas de connexion. Bambeh s&#39;ouvre d&#232;s que votre t&#233;l&#233;phone est de nouveau en ligne.</p>' +
  '<p>No network. Bambeh go open as your phone come back online.</p>' +
  '<p lang="ar" dir="rtl">&#1604;&#1575; &#1610;&#1608;&#1580;&#1583; &#1575;&#1578;&#1589;&#1575;&#1604;. &#1610;&#1601;&#1578;&#1581; Bambeh &#1593;&#1606;&#1583; &#1593;&#1608;&#1583;&#1577; &#1575;&#1604;&#1575;&#1578;&#1589;&#1575;&#1604;.</p>' +
  '<p lang="ff">Alaa ce&#331;ol. Bambeh ma udditee so tel maa ruttiima e ce&#331;ol.</p>' +
  '<button onclick="location.reload()">Try again / R&#233;essayer</button></main>' +
  '<script>window.addEventListener("online",function(){location.reload()});setTimeout(function(){location.reload()},20000)</script>' +
  '</body></html>';

function offlinePage() {
  return new Response(OFFLINE, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

function handleNavigate(event) {
  var network = fetch(event.request);

  return caches.open(SHELL).then(function (shell) { return shell.match(SHELL_URL); }).then(function (saved) {
    if (!saved) {
      return network.catch(function () { return offlinePage(); });
    }
    var timer = new Promise(function (resolve) { setTimeout(function () { resolve(null); }, NAV_TIMEOUT_MS); });
    return Promise.race([network.catch(function () { return null; }), timer]).then(function (first) {
      if (first && first.ok) return first;
      // too slow, failed, or the server answered with an error: the saved page opens now; the download carries on
      event.waitUntil(network.catch(function () { return null; }));
      return saved;
    });
  });
}

// ---------------------------------------------------------------------------------------------- the app's files
// A file is kept under its plain name: a retry asks for it as name.js?r=2 (a browser will not try the same module
// address twice in one visit), and the retry must find - and fill - the same saved copy.
function handleAsset(event) {
  var u = new URL(event.request.url);
  var key = u.origin + u.pathname;
  return caches.open(ASSETS).then(function (cache) {
    return cache.match(key).then(function (hit) {
      if (hit) return hit;
      return fetch(event.request).then(function (res) {
        if (res && res.ok && !isHtml(res)) {
          var copy = res.clone();
          event.waitUntil(cache.put(key, copy).then(function () { return trim(cache); }).catch(function () { return null; }));
        }
        return res;
      });
    });
  });
}

function handleStatic(event) {
  return caches.open(STATIC).then(function (cache) {
    return cache.match(event.request).then(function (hit) {
      var net = fetch(event.request).then(function (res) {
        if (res && res.ok && res.type === 'basic') {
          var copy = res.clone();
          event.waitUntil(cache.put(event.request, copy).catch(function () { return null; }));
        }
        return res;
      });
      if (hit) {
        event.waitUntil(net.catch(function () { return null; }));
        return hit;
      }
      return net;
    });
  });
}

// ---------------------------------------------------------------------------------------------- save data
var PHOTO = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
  '<rect width="400" height="300" fill="#e7efed"/><g fill="none" stroke="#9fb8b2" stroke-width="10" stroke-linejoin="round">' +
  '<rect x="140" y="110" width="120" height="86" rx="12"/><circle cx="200" cy="153" r="22"/><path d="M172 110l10-16h36l10 16"/></g></svg>';

function photoStandIn() {
  return new Response(PHOTO, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' } });
}

function stateFor(clientId) {
  if (clientId && clientState.has(clientId)) return clientState.get(clientId);
  return lastState;
}

function liteBlocks(clientId, url) {
  var st = stateFor(clientId);
  if (!st || !st.lite) return false;
  if (url.searchParams.get('bambeh_full') === '1') return false;
  return !DETAIL_RE.test(st.route || '/');
}

function remember(st) {
  lastState = st;
  return caches.open(STATE).then(function (c) {
    return c.put('/__bambeh_state', new Response(JSON.stringify(st), { headers: { 'Content-Type': 'application/json' } }));
  }).catch(function () { return null; });
}

// after a restart: the last state a page sent, until a page speaks again
var restored = caches.open(STATE).then(function (c) { return c.match('/__bambeh_state'); }).then(function (r) {
  return r ? r.json() : null;
}).then(function (st) {
  if (st && !lastState) lastState = { lite: !!st.lite, route: String(st.route || '/') };
}).catch(function () { return null; }).then(function () { restoredDone = true; });

self.addEventListener('message', function (event) {
  var d = event.data || {};
  if (d.type === 'bambeh-state') {
    var st = { lite: !!d.lite, route: String(d.route || '/') };
    var id = event.source && event.source.id;
    if (id) {
      clientState.set(id, st);
      if (clientState.size > 30) clientState.delete(clientState.keys().next().value);
    }
    event.waitUntil(remember(st));
  } else if (d.type === 'bambeh-save-shell') {
    // the page also names the screens it has already downloaded (from the browser's own list): kept too, so the
    // screen that opened first (often Home) opens with no connection next time - read from the browser's own copy
    var extra = (Array.isArray(d.files) ? d.files : []).filter(function (f) {
      return typeof f === 'string' && /^\/assets\/[^?#]+\.(m?js|css)$/.test(f);
    }).slice(0, 80);
    event.waitUntil(fetchShell().then(saveShell).catch(function () { return null; }).then(function () {
      return caches.open(ASSETS).then(function (assets) {
        return extra.reduce(function (p, f) { return p.then(function () { return saveAsset(assets, f); }); }, Promise.resolve());
      });
    }).catch(function () { return null; }));
  } else if (d.type === 'bambeh-skip-waiting') {
    self.skipWaiting();
  }
});

// ---------------------------------------------------------------------------------------------- who goes where
self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (e) { return; }
  var same = url.origin === self.location.origin;
  // FIX981 - the Android app's download page and file (FIX980) and the app's update lists (FIX979): always straight
  // from the network, never the saved copy - on a slow line the member must get the APK, not the app's page.
  if (same && (url.pathname === '/download' || url.pathname.indexOf('/download/') === 0 || url.pathname.indexOf('/ota/') === 0)) return;

  if (req.mode === 'navigate') {
    if (same) event.respondWith(handleNavigate(event));
    return;
  }
  if (!same) {
    if (req.destination === 'image') {
      var clientId = event.clientId;
      if (!restoredDone && !lastState) {
        // just restarted and no page has spoken yet: decide once the saved state is read
        event.respondWith(restored.then(function () {
          return liteBlocks(clientId, url) ? photoStandIn() : fetch(req);
        }));
      } else if (liteBlocks(clientId, url)) {
        event.respondWith(photoStandIn());
      }
    }
    return;   // Supabase, payments, fonts, maps and other sites: untouched
  }
  if (url.pathname.indexOf('/assets/') === 0) {
    event.respondWith(handleAsset(event));
    return;
  }
  if (STATIC_RE.test(url.pathname) && url.pathname !== '/sw.js') {
    event.respondWith(handleStatic(event));
  }
});
// BAMBEH_END_TOKEN__SW_FIX959__COMPLETE
