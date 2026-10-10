/* SabKuch service worker — cache-first for static assets, network fallback. */
(function () {
  'use strict';
  var CACHE = 'sabkuch-v1';
  var CORE = [
    '/sabkuch/',
    '/sabkuch/index.html',
    '/sabkuch/css/style.css',
    '/sabkuch/js/main.js',
    '/sabkuch/manifest.json',
    '/sabkuch/images/icon-192.png',
    '/sabkuch/og-image.png'
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
    // Only handle same-origin requests under /sabkuch/
    if (url.origin !== self.location.origin) return;
    if (url.pathname.indexOf('/sabkuch/') !== 0) return;
    e.respondWith(
      caches.match(req, { ignoreSearch: false }).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (res) {
          // Cache successful static responses (html/css/js/png/fonts)
          if (res && res.ok && /\.(html|css|js|png|jpg|jpeg|webp|svg|woff2?|json)$/.test(url.pathname)) {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, copy); });
          }
          return res;
        }).catch(function () {
          return caches.match('/sabkuch/index.html');
        });
      })
    );
  });
})();
