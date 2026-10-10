/* SabKuch PWA helpers — service worker registration + install prompt banner.
 * Null-guarded IIFE, no dependencies. Safe to include on any page. */
(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  var w = window, d = document;

  var USES = 'sk_uses';          // tool-page view counter
  var DISMISS = 'sk_pwa_dismiss'; // banner dismissal counter
  var DONE = 'sk_pwa_done';       // set when installed or dismissed twice

  function lsGet(k) {
    try {
      var v = parseInt(w.localStorage.getItem(k), 10);
      return isNaN(v) ? 0 : v;
    } catch (e) { return 0; }
  }
  function lsSet(k, v) {
    try { w.localStorage.setItem(k, String(v)); } catch (e) {}
  }

  // ---- 1. Service worker (HTTPS or localhost only) ----
  var isSecureCtx = w.location.protocol === 'https:';
  var isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(w.location.hostname);
  if ((isSecureCtx || isLocal) && 'serviceWorker' in w.navigator) {
    try {
      w.navigator.serviceWorker.register('/sabkuch/sw.js').catch(function () {});
    } catch (e) {}
  }

  // ---- 2. Count tool-page views (.tool-panel presence) ----
  if (d.querySelector('.tool-panel')) {
    lsSet(USES, lsGet(USES) + 1);
  }

  // ---- 3. Install banner ----
  var deferredPrompt = null;

  function neverAgain() { return lsGet(DONE) >= 1; }
  function markDone() { lsSet(DONE, 1); }

  w.addEventListener('appinstalled', function () { markDone(); hideBanner(); });

  w.addEventListener('beforeinstallprompt', function (e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    deferredPrompt = e;
    maybeShow();
  });

  function maybeShow() {
    if (neverAgain() || !deferredPrompt) return;
    if (lsGet(USES) < 2) return;                 // show only after 2 tool views
    if (lsGet(DISMISS) >= 2) { markDone(); return; }
    if (d.getElementById('skPwaBanner')) return; // already shown
    showBanner();
  }

  function injectStyles() {
    if (d.getElementById('skPwaStyles')) return;
    var st = d.createElement('style');
    st.id = 'skPwaStyles';
    st.textContent =
      '#skPwaBanner{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:9999;' +
      'max-width:480px;margin:0 auto;padding:14px 16px;border-radius:16px;' +
      'background:rgba(255,255,255,.82);-webkit-backdrop-filter:blur(14px) saturate(1.4);backdrop-filter:blur(14px) saturate(1.4);' +
      'border:1px solid rgba(0,0,0,.08);box-shadow:0 12px 32px rgba(15,23,42,.18);' +
      'display:flex;align-items:center;gap:12px;font-family:Inter,system-ui,sans-serif;' +
      'animation:skPwaIn .28s ease-out}' +
      '@keyframes skPwaIn{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}' +
      '#skPwaBanner .sk-pwa-ico{flex:0 0 40px;width:40px;height:40px;border-radius:12px;' +
      'background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;font-weight:800;font-size:22px;' +
      'display:flex;align-items:center;justify-content:center}' +
      '#skPwaBanner .sk-pwa-txt{flex:1;min-width:0}' +
      '#skPwaBanner .sk-pwa-txt b{display:block;font-size:.95rem;color:#0f172a}' +
      '#skPwaBanner .sk-pwa-txt span{font-size:.8rem;color:#64748b}' +
      '#skPwaBanner .sk-pwa-btns{display:flex;gap:8px;flex-shrink:0}' +
      '#skPwaBanner button{border:0;border-radius:10px;padding:9px 14px;font-size:.85rem;font-weight:700;cursor:pointer}' +
      '#skPwaBanner .sk-pwa-install{background:#2563eb;color:#fff}' +
      '#skPwaBanner .sk-pwa-later{background:rgba(15,23,42,.07);color:#334155}' +
      '[data-theme="dark"] #skPwaBanner{background:rgba(19,28,49,.86);border-color:rgba(255,255,255,.1)}' +
      '[data-theme="dark"] #skPwaBanner .sk-pwa-txt b{color:#f1f5f9}' +
      '[data-theme="dark"] #skPwaBanner .sk-pwa-txt span{color:#94a3b8}' +
      '[data-theme="dark"] #skPwaBanner .sk-pwa-later{background:rgba(255,255,255,.1);color:#e2e8f0}';
    if (d.head) d.head.appendChild(st);
  }

  function showBanner() {
    injectStyles();
    var bar = d.createElement('div');
    bar.id = 'skPwaBanner';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Install SabKuch app');

    var ico = d.createElement('div');
    ico.className = 'sk-pwa-ico'; ico.textContent = 'S';
    var txt = d.createElement('div');
    txt.className = 'sk-pwa-txt';
    var b = d.createElement('b'); b.textContent = 'Install SabKuch app';
    var sp = d.createElement('span'); sp.textContent = 'Faster access, works offline';
    txt.appendChild(b); txt.appendChild(sp);

    var btns = d.createElement('div');
    btns.className = 'sk-pwa-btns';
    var install = d.createElement('button');
    install.type = 'button'; install.className = 'sk-pwa-install'; install.textContent = 'Install';
    var later = d.createElement('button');
    later.type = 'button'; later.className = 'sk-pwa-later'; later.textContent = 'Later';

    install.addEventListener('click', function () {
      if (!deferredPrompt) { hideBanner(); return; }
      var p = deferredPrompt;
      deferredPrompt = null;
      try {
        p.prompt();
        if (p.userChoice && typeof p.userChoice.then === 'function') {
          p.userChoice.then(function (choice) {
            if (choice && choice.outcome === 'accepted') markDone();
            hideBanner();
          }).catch(function () { hideBanner(); });
        } else { hideBanner(); }
      } catch (e) { hideBanner(); }
    });
    later.addEventListener('click', function () {
      var n = lsGet(DISMISS) + 1;
      lsSet(DISMISS, n);
      if (n >= 2) markDone();
      hideBanner();
    });

    btns.appendChild(install); btns.appendChild(later);
    bar.appendChild(ico); bar.appendChild(txt); bar.appendChild(btns);
    d.body.appendChild(bar);
  }

  function hideBanner() {
    var bar = d.getElementById('skPwaBanner');
    if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
  }
})();
