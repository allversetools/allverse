/* ============================================================
   AllVerse FX — 3D design-system behaviours (vanilla JS)
   All null-guarded IIFEs. No libraries. Respects
   prefers-reduced-motion everywhere.
   ============================================================ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Category detection -> body[data-cat] ---------- */
  (function () {
    var map = {
      'calculators.html': 'calculators', 'finance-tools.html': 'finance',
      'business-tools.html': 'business', 'image-tools.html': 'image',
      'pdf-tools.html': 'pdf', 'converters.html': 'converters',
      'generators.html': 'generators', 'developer-tools.html': 'developer',
      'color-tools.html': 'color', 'date-time.html': 'date-time',
      'fun-tools.html': 'fun', 'everyday-tools.html': 'everyday'
    };
    var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (map[page]) document.body.dataset.cat = map[page];
    // index.html: stamp each category section so cards keep their material
    if (page === 'index.html' || page === '') {
      document.querySelectorAll('.cat-section').forEach(function (sec) {
        var link = sec.querySelector('a[href$="-tools.html"], a[href="calculators.html"], a[href="converters.html"], a[href="date-time.html"]');
        var href = link ? (link.getAttribute('href') || '').toLowerCase() : '';
        if (map[href]) sec.dataset.cat = map[href];
      });
    }
  })();

  /* ---------- 2. Count-up numbers with overshoot (easeOutBack) ---------- */
  (function () {
    if (REDUCED || !('MutationObserver' in window)) return;
    function easeOutBack(t) { var c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
    function parseNum(s) {
      if (!s) return null;
      var m = String(s).replace(/[,\s]/g, '').match(/-?\d+(\.\d+)?/);
      return m ? parseFloat(m[0]) : null;
    }
    function animate(el, from, to, decimals, suffix) {
      var start = null, dur = 650;
      /* token: a newer animation (or a direct value update) invalidates this one,
         so stale frames can never overwrite a fresher value */
      var seq = el._fxSeq = (el._fxSeq || 0) + 1;
      function frame(ts) {
        if (el._fxSeq !== seq || !el.isConnected) return;
        if (!start) start = ts;
        var t = Math.min((ts - start) / dur, 1);
        var v = from + (to - from) * easeOutBack(t);
        el._fxSelf = true; /* mark our own writes so the observer ignores them */
        el.textContent = (decimals ? v.toFixed(decimals) : Math.round(v).toString()) + suffix;
        if (t < 1 && el.isConnected) requestAnimationFrame(frame);
        else { el._fxSelf = true; el.textContent = (decimals ? to.toFixed(decimals) : Math.round(to).toString()) + suffix; }
      }
      requestAnimationFrame(frame);
      return seq;
    }
    var io = new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        var el = m.target.nodeType === 3 ? m.target.parentElement : m.target;
        if (!el) return;
        if (el._fxSelf) { el._fxSelf = false; return; } /* our own animation frame */
        // only animate single-number values (e.g. "24.5 kg"); never rewrite rich text
        var clean = (el.textContent || '').trim();
        if (!/^-?[\d,]+(\.\d+)?\s*[^\d\s.,-]*$/.test(clean)) { el._fxPrevText = el.textContent; return; }
        var neu = parseNum(el.textContent);
        if (neu === null) return;
        if (el._fxTick) {
          /* a new value arrived mid-animation: cancel the stale animation and
             accept the fresh value as-is (no animation on rapid updates) */
          el._fxSeq = (el._fxSeq || 0) + 1;
          el._fxTick = false;
          el._fxPrevText = el.textContent;
          return;
        }
        var old = parseNum(el._fxPrevText);
        if (old === null || old === neu) { el._fxPrevText = el.textContent; return; }
        el._fxTick = true;
        var dec = (String(el.textContent).match(/\.(\d+)/) || [])[1];
        var suffix = (el.textContent.match(/[^\d.,\s-]+$/) || [''])[0];
        var seq = animate(el, old, neu, dec ? dec.length : 0, suffix);
        setTimeout(function () { if (el._fxSeq === seq) { el._fxTick = false; el._fxPrevText = el.textContent; } }, 700);
        // glow pulse on result panels
        var rp = el.closest ? el.closest('.result-panel') : null;
        if (rp) { rp.classList.remove('fx-glow'); void rp.offsetWidth; rp.classList.add('fx-glow'); }
        // slide-in for converters
        if (rp && document.body.dataset.cat === 'converters') {
          rp.classList.remove('fx-slide'); void rp.offsetWidth; rp.classList.add('fx-slide');
        }
        // flip-clock for date-time stat digits
        var sb = el.tagName === 'B' && el.closest('.stat') ? el : null;
        if (sb && document.body.dataset.cat === 'date-time') {
          sb.classList.remove('fx-flip'); void sb.offsetWidth; sb.classList.add('fx-flip');
        }
      });
    });
    document.querySelectorAll('.stat b, .result-panel').forEach(function (el) {
      el._fxPrevText = el.textContent;
      io.observe(el, { childList: true, characterData: true, subtree: true });
    });
  })();

  /* ---------- 3. Copy buttons morph (uses window.SK.copy, no toast) ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-copy], .copy-btn') : null;
    if (!b || b._fxMorph) return;
    var txt = b.getAttribute('data-copy');
    if (txt == null) {
      var t = b.closest('.result-panel');
      txt = t ? t.textContent : '';
    }
    if (window.SK && typeof window.SK.copy === 'function') window.SK.copy(txt);
    b._fxMorph = true;
    var orig = b.innerHTML;
    b.innerHTML = 'Copied ✓';
    setTimeout(function () { b.innerHTML = orig; b._fxMorph = false; }, 1500);
  });

  /* ---------- 4. Haptics on .btn clicks ---------- */
  if ('vibrate' in navigator) {
    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.btn') : null;
      if (b) { try { navigator.vibrate(8); } catch (err) {} }
    });
  }

  /* ---------- 5. Sparkle burst (generators) ---------- */
  document.addEventListener('click', function (e) {
    if (REDUCED) return;
    if (document.body.dataset.cat !== 'generators') return;
    var b = e.target.closest ? e.target.closest('.btn') : null;
    if (!b) return;
    var r = b.getBoundingClientRect();
    for (var i = 0; i < 12; i++) {
      var s = document.createElement('span');
      s.className = 'fx-spark';
      var a = Math.random() * Math.PI * 2, d = 46 + Math.random() * 60;
      s.style.setProperty('--sx', (Math.cos(a) * d).toFixed(0) + 'px');
      s.style.setProperty('--sy', (Math.sin(a) * d).toFixed(0) + 'px');
      s.style.left = (r.left + r.width / 2 + window.scrollX) + 'px';
      s.style.top = (r.top + r.height / 2 + window.scrollY) + 'px';
      document.body.appendChild(s);
      (function (el) { setTimeout(function () { el.remove(); }, 750); })(s);
    }
  });

  /* ---------- 6. Color: tap-point gradient bleed (--tx/--ty) ---------- */
  if (document.body.dataset.cat === 'color') {
    var panel = document.querySelector('.tool-panel');
    if (panel) {
      panel.addEventListener('pointermove', function (e) {
        var r = panel.getBoundingClientRect();
        panel.style.setProperty('--tx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        panel.style.setProperty('--ty', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    }
  }

  /* ---------- 7. Trust badge on file-upload tools ---------- */
  (function () {
    if (!document.querySelector('input[type="file"]')) return;
    var panel = document.querySelector('.tool-panel');
    if (!panel || panel.querySelector('.trust-pill')) return;
    var pill = document.createElement('div');
    pill.className = 'trust-pill';
    pill.textContent = '🔒 100% on-device — your files never leave your device';
    panel.insertBefore(pill, panel.firstChild);
  })();

  /* ---------- 8. Mobile bottom nav (≤900px via CSS) ---------- */
  (function () {
    if (document.querySelector('.fx-bottomnav')) return;
    var nav = document.createElement('nav');
    nav.className = 'fx-bottomnav';
    nav.setAttribute('aria-label', 'Quick navigation');
    function item(href, ico, label, action) {
      var el = document.createElement(href ? 'a' : 'button');
      if (href) el.href = href;
      el.innerHTML = '<span class="bn-ico">' + ico + '</span><span>' + label + '</span>';
      if (action) el.addEventListener('click', action);
      return el;
    }
    nav.appendChild(item('index.html', '🏠', 'Home'));
    nav.appendChild(item(null, '🔍', 'Search', function () {
      var s = document.getElementById('siteSearch');
      if (s) { s.focus(); s.scrollIntoView({ block: 'center' }); }
      else if (window.dispatchEvent) { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })); }
    }));
    nav.appendChild(item('index.html#favSection', '⭐', 'Favorites'));
    nav.appendChild(item(null, '🧰', 'Tools', function () {
      var sb = document.getElementById('sidebar');
      var mt = document.getElementById('menuToggle');
      if (mt) mt.click();
      else if (sb) sb.classList.add('open');
    }));
    document.body.appendChild(nav);
  })();

  /* ---------- 9. Smart paste (index hero) ---------- */
  (function () {
    var input = document.getElementById('smartPasteInput');
    var chips = document.getElementById('smartPasteChips');
    if (!input || !chips) return;
    var tools = {
      json: { href: 'json-formatter.html', name: 'Format JSON', ico: '🧾' },
      color: { href: 'color-picker.html', name: 'Pick this color', ico: '🎨' },
      url: { href: 'url-encoder-decoder.html', name: 'Encode URL', ico: '🔗' },
      date: { href: 'date-difference.html', name: 'Date math', ico: '📅' },
      num: { href: 'percentage-calculator.html', name: 'Calculate %', ico: '%' },
      words: { href: 'word-counter.html', name: 'Count words', ico: '📝' },
      kase: { href: 'case-converter.html', name: 'Change case', ico: '🔠' }
    };
    function detect(v) {
      v = v.trim();
      if (!v) return [];
      try { JSON.parse(v); return ['json']; } catch (e) {}
      if (/^#?[0-9a-f]{6}$/i.test(v) || /^#?[0-9a-f]{3}$/i.test(v) || /^rgb\(/i.test(v) || /^hsl\(/i.test(v)) return ['color'];
      if (/^https?:\/\//i.test(v)) return ['url'];
      if ((/-|\//.test(v)) && !isNaN(Date.parse(v))) return ['date'];
      if (/^-?\d+([.,]\d+)?$/.test(v)) return ['num'];
      return ['words', 'kase'];
    }
    function render(list) {
      chips.innerHTML = '';
      list.forEach(function (k) {
        var t = tools[k];
        if (!t) return;
        var a = document.createElement('a');
        a.className = 'sp-chip';
        a.href = t.href;
        a.textContent = t.ico + ' ' + t.name;
        chips.appendChild(a);
      });
    }
    input.addEventListener('input', function () { render(detect(input.value)); });
  })();
})();

/* ---------- Hero 3D scene: mouse parallax + cursor spotlight (lusion-style) ---------- */
(function () {
  'use strict';
  var scene = document.querySelector('.hero-scene');
  if (!scene) return;
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOVERABLE = window.matchMedia && window.matchMedia('(hover: hover)').matches;
  if (REDUCED || !HOVERABLE) return;
  var layers = Array.prototype.slice.call(scene.querySelectorAll('.hs-layer'));
  var spot = document.getElementById('hsSpot');
  var hero = scene.closest('.hero') || document.body;
  var raf = null, tx = 0, ty = 0, cx = 0, cy = 0;
  function render() {
    raf = null;
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    layers.forEach(function (el) {
      var d = parseFloat(el.getAttribute('data-depth') || '30');
      el.style.transform = 'translate(' + (-cx * d).toFixed(1) + 'px,' + (-cy * d).toFixed(1) + 'px)';
    });
    if (spot) {
      var r = hero.getBoundingClientRect();
      spot.style.left = ((cx * 900) + r.width * 0.62) + 'px';
      spot.style.top = ((cy * 700) + r.height * 0.35) + 'px';
    }
    if (Math.abs(tx - cx) > 0.0005 || Math.abs(ty - cy) > 0.0005) {
      raf = requestAnimationFrame(render);
    }
  }
  hero.addEventListener('mousemove', function (e) {
    var r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
    if (!raf) raf = requestAnimationFrame(render);
  });
  hero.addEventListener('mouseleave', function () {
    tx = 0; ty = 0;
    if (!raf) raf = requestAnimationFrame(render);
  });
})();
