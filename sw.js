/* AllVerse service worker — cache-first for static assets, network fallback. */
(function () {
  'use strict';
  var CACHE = 'allverse-v11';
  var CORE = [
    '/allverse/',
    '/allverse/index.html',
    '/allverse/css/style.css',
    '/allverse/js/main.js',
    '/allverse/manifest.json',
    '/allverse/images/icon-192.png',
    '/allverse/og-image.png'
  ];

  self.addEventListener('install', function (e) {
    e.waitUntil(
      caches.open(CACHE).then(function (c) { return c.addAll(CORE); })
        .then(function () { return self.skipWaiting(); })
        .catch(function () {})
    );
  });

  self.addEventListener('activate', function (e) {
    e.waitUntil(
      caches.keys().then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; })
          .map(function (k) { return caches.delete(k); }));
      }).then(function () { return self.clients.claim(); })
    );
  });

  self.addEventListener('fetch', function (e) {
    var req = e.request;
    if (req.method !== 'GET') return;
    var url = new URL(req.url);
    // Only handle same-origin requests under /allverse/
    if (url.origin !== self.location.origin) return;
    if (url.pathname.indexOf('/allverse/') !== 0) return;
    // Directory URLs (trailing slash) are HTML pages too — the old check
    // only matched *.html and the site root, so /games/ etc. were
    // treated as static assets and could serve stale/wrong content.
    var isHtml = /\.html$/.test(url.pathname) || url.pathname === '/allverse/' || /\/$/.test(url.pathname);
    e.respondWith(
      isHtml
        // HTML: network-first (always fresh), cache as offline fallback
        ? fetch(req).then(function (res) {
            if (res && res.ok) {
              var copy = res.clone();
              caches.open(CACHE).then(function (c) { c.put(req, copy); });
            }
            return res;
          }).catch(function () {
            return caches.match(req).then(function (hit) {
              return hit || caches.match('/allverse/index.html');
            });
          })
        // Static assets: cache-first
        : caches.match(req, { ignoreSearch: false }).then(function (hit) {
            if (hit) return hit;
            return fetch(req).then(function (res) {
              if (res && res.ok && /\.(css|js|png|jpg|jpeg|webp|svg|woff2?|json)$/.test(url.pathname)) {
                var copy = res.clone();
                caches.open(CACHE).then(function (c) { c.put(req, copy); });
              }
              return res;
            }).catch(function () {
              // Asset genuinely unavailable: return a real 404, never
              // index.html (HTML served as JS/CSS breaks the page).
              return new Response('', { status: 404, statusText: 'Not Found' });
            });
          })
    );
  });
})();
