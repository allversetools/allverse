/* ============================================================
   AllVerse — Shared AI helper (vanilla JS, no dependencies)
   - aiChat(prompt, systemPrompt): free text generation
     uses keyless Pollinations
     Pollinations text API. $0 cost, no API keys.
   - Request queue (1 concurrent), localStorage result cache,
     friendly 429 handling. Errors in Roman Urdu + English.
   ============================================================ */
(function () {
  'use strict';

  var POLLINATIONS_TEXT = 'https://text.pollinations.ai/';
  var CACHE_PREFIX = 'sk_ai_cache_';
  var CACHE_MAX = 60;

  /* ---------- tiny helpers ---------- */
  function hashStr(s) {
    var h = 5381, i;
    for (i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return 'h' + (h >>> 0).toString(36);
  }
  function cacheGet(key) {
    try {
      var raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (!o || typeof o.v !== 'string') return null;
      return o.v;
    } catch (e) { return null; }
  }
  function cacheSet(key, val) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ v: val, t: Date.now() }));
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(CACHE_PREFIX) === 0) keys.push(k);
      }
      if (keys.length > CACHE_MAX) {
        keys.sort(function (a, b) {
          var ta = 0, tb = 0;
          try { ta = JSON.parse(localStorage.getItem(a)).t || 0; } catch (e) {}
          try { tb = JSON.parse(localStorage.getItem(b)).t || 0; } catch (e) {}
          return ta - tb;
        });
        for (var j = 0; j < keys.length - CACHE_MAX; j++) localStorage.removeItem(keys[j]);
      }
    } catch (e) { /* storage full/blocked — ignore */ }
  }

  /* ---------- request queue: 1 at a time ---------- */
  var queue = [];
  var busy = false;
  function pump() {
    if (busy || !queue.length) return;
    busy = true;
    var job = queue.shift();
    var done = function (val) {
      busy = false;
      job.resolve(val);
      setTimeout(pump, 400); /* small gap between AI calls */
    };
    var fail = function (err) {
      busy = false;
      job.reject(err);
      setTimeout(pump, 400);
    };
    runRequest(job.prompt, job.system).then(done, fail);
  }
  function enqueue(prompt, system) {
    return new Promise(function (resolve, reject) {
      queue.push({ prompt: prompt, system: system, resolve: resolve, reject: reject });
      pump();
    });
  }

  /* ---------- providers ---------- */

  function pollinations(prompt, system) {
    var full = system ? (system + '\n\nUser request: ' + prompt) : prompt;
    var url = POLLINATIONS_TEXT + encodeURIComponent(full);
    // 60s timeout — the free API can stall; never hang forever
    var ctrl = null;
    try { ctrl = new AbortController(); } catch (e) { ctrl = null; }
    var timer = null;
    var fetchP = ctrl ? fetch(url, { method: 'GET', signal: ctrl.signal })
                      : fetch(url, { method: 'GET' });
    var timeoutP = new Promise(function (_, reject) {
      timer = setTimeout(function () {
        if (ctrl) { try { ctrl.abort(); } catch (e) {} }
        var e = new Error('The AI request timed out. Please try again.');
        e.code = 'timeout';
        reject(e);
      }, 60000);
    });
    return Promise.race([fetchP, timeoutP]).then(function (res) {
      clearTimeout(timer);
      if (res.status === 429) {
        var e = new Error('AI is busy, please retry in a moment.');
        e.code = 429;
        throw e;
      }
      if (!res.ok) throw new Error('pollinations:' + res.status);
      return res.text();
    }, function (err) {
      clearTimeout(timer);
      throw err;
    }).then(function (txt) {
      txt = (txt || '').trim();
      if (!txt) throw new Error('pollinations:empty');
      return txt;
    });
  }

  function runRequest(prompt, system) {
    // Keyless Pollinations (free, no API key needed)
    return pollinations(prompt, system);
  }

  /* ---------- public API ---------- */
  function aiChat(prompt, systemPrompt) {
    prompt = (prompt || '').trim();
    if (!prompt) return Promise.reject(new Error('Empty prompt.'));
    var key = hashStr((systemPrompt || '') + '||' + prompt);
    var cached = cacheGet(key);
    if (cached !== null) return Promise.resolve(cached);
    return enqueue(prompt, systemPrompt).then(function (txt) {
      cacheSet(key, txt);
      return txt;
    });
  }

  /* Typing effect: reveals text char-by-char into an element.
     Respects prefers-reduced-motion (instant fill). */
  var REDUCED_MOTION = (typeof window.matchMedia === 'function') &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function typeInto(el, text, done) {
    if (!el) { if (done) done(); return; }
    if (REDUCED_MOTION) { el.textContent = text; if (done) done(); return; }
    var i = 0, timer;
    var step = function () {
      i += 7;
      el.textContent = text.slice(0, i);
      if (i < text.length) { timer = setTimeout(step, 12); }
      else if (done) done();
    };
    step();
    return function cancel() { clearTimeout(timer); el.textContent = text; };
  }

  /* Pollinations image URL builder */
  /* ---------- Pro image generation ---------- */
  /* Free Pollinations models the user can pick per tool */
  var IMAGE_MODELS = [
    { v: 'flux',   label: 'Flux — Best quality' },
    { v: 'zimage', label: 'Z-Image — Artistic' },
    { v: 'klein',  label: 'Klein — Creative' },
    { v: 'turbo',  label: 'Turbo — Fastest' }
  ];
  /* Professional style descriptors appended per image kind — this is where
     the "pro look" comes from: composition, lighting, detail, color grading. */
  var PRO_STYLES = {
    thumbnail: 'dramatic professional YouTube thumbnail background art, bold dynamic composition with one strong focal point, rule of thirds, ultra vibrant saturated colors, dramatic cinematic rim lighting, deep shadows, extreme high contrast, hyper detailed, tack sharp focus, premium viral thumbnail aesthetic, no text, no words, no letters, 16:9',
    photo: 'professional photography, cinematic composition, dramatic natural lighting, ultra detailed, tack sharp focus, rich premium color grading, 8k quality',
    wallpaper: 'breathtaking ultra-detailed wallpaper, epic cinematic atmosphere, dramatic volumetric lighting, sweeping grand composition, hyper detailed, 8k masterpiece, no text, no watermark',
    logo: 'professional minimalist vector logo mark, flat design, clean geometric shapes, clever negative space, iconic and memorable, perfectly centered, premium brand identity, crisp clean edges, white background, no photo, no clutter'
  };
  /* Turns a plain user idea into a professional-grade image prompt */
  function proPrompt(base, kind) {
    base = String(base || '').trim().replace(/\s+/g, ' ');
    return base + ', ' + (PRO_STYLES[kind] || PRO_STYLES.photo) + ', no text, no watermark, no words, no letters';
  }
  // Rate limit: 1 request per 15s for anonymous (Pollinations free tier)
  var lastImageRequest = 0;
  var IMAGE_COOLDOWN = 15000;

  function canMakeImageRequest() {
    var now = Date.now();
    var elapsed = now - lastImageRequest;
    if (elapsed < IMAGE_COOLDOWN) {
      return Math.ceil((IMAGE_COOLDOWN - elapsed) / 1000);
    }
    return 0;
  }

  function markImageRequest() {
    lastImageRequest = Date.now();
  }

  // Enhance prompt with quality keywords (research-based)
  function enhancePrompt(prompt) {
    var quality = ', highly detailed, professional quality, 8k resolution';
    // Don't duplicate if already has quality terms
    if (/detailed|quality|8k|4k|hd/i.test(prompt)) return prompt;
    return prompt + quality;
  }

  function pollinationsImage(prompt, opts) {
    opts = opts || {};
    var w = opts.width || 1024, h = opts.height || 1024;
    var model = opts.model || 'flux';
    var seed = (typeof opts.seed === 'number') ? opts.seed : Math.floor(Math.random() * 999999);
    var enhance = (opts.enhance === false) ? 'false' : 'true';
    // Auto-enhance prompt for better results
    var enhanced = enhancePrompt(prompt);
    return 'https://image.pollinations.ai/prompt/' + encodeURIComponent(enhanced) +
      '?width=' + w + '&height=' + h + '&model=' + model + '&nologo=true&seed=' + seed + '&enhance=' + enhance;
  }

  /* Small UX helpers used by AI tool pages.
     setBusy(btn, busy, busyLabel): disable + dim + inline SVG-less CSS spinner
     next to the label. Safe to call twice (keeps the original label). */
  function setBusy(btn, busy, busyLabel) {
    if (!btn) return;
    if (busy) {
      if (!btn.dataset._label) btn.dataset._label = btn.innerHTML;
      btn.disabled = true;
      btn.classList.add('sk-busy');
      var dark = btn.classList.contains('btn-ghost') ? ' dark' : '';
      btn.innerHTML = '<span class="sk-btn-spinner' + dark + '"></span><span>' +
        escapeHtml(busyLabel || 'Thinking…') + '</span>';
    } else {
      btn.disabled = false;
      btn.classList.remove('sk-busy');
      if (btn.dataset._label) { btn.innerHTML = btn.dataset._label; delete btn.dataset._label; }
    }
  }

  /* ---------- loading skeleton + staged status ----------
     SK_AI.loading(panel, true)  → shows shimmer skeleton + staged messages
     SK_AI.loading(panel, false) → hides skeleton, clears timers
     opts: { lines: 4, messages: [[ms, text], ...] } */
  var STAGED_DEFAULT = [
    [0, 'Thinking…'],
    [5000, 'Structuring your answer…'],
    [15000, 'Adding final touches…']
  ];
  function stopStaged(panel) {
    if (panel && panel._skTimers) {
      panel._skTimers.forEach(function (t) { clearTimeout(t); });
      panel._skTimers = null;
    }
  }
  function loading(panel, on, opts) {
    if (!panel) return;
    opts = opts || {};
    if (on) {
      panel.hidden = false;
      panel.classList.remove('sk-error');
      var oldErr = panel.querySelector('[data-sk-err]');
      if (oldErr) oldErr.hidden = true;
      var box = panel.querySelector('[data-sk-loading]');
      if (!box) {
        box = document.createElement('div');
        box.className = 'sk-loading';
        box.setAttribute('data-sk-loading', '1');
        var lines = opts.lines || 4, html = '';
        var widths = ['w80', '', 'w60', 'w80'];
        for (var i = 0; i < lines; i++) {
          html += '<div class="sk-shimmer-line ' + widths[i % widths.length] + '"></div>';
        }
        html += '<p class="sk-status"><span class="sk-spinner"></span>' +
          '<span data-sk-status-text></span>' +
          '<span class="sk-elapsed" data-sk-elapsed>0s</span></p>';
        html += '<p class="sk-slow-note" data-sk-slow-note>⏳ This can take up to 30&ndash;60 seconds on the free AI service. Please keep this tab open.</p>';
        box.innerHTML = html;
        if (panel.firstChild) panel.insertBefore(box, panel.firstChild);
        else panel.appendChild(box);
      }
      box.hidden = false;
      var msgs = opts.messages || STAGED_DEFAULT;
      var txtEl = box.querySelector('[data-sk-status-text]');
      stopStaged(panel);
      var timers = [];
      msgs.forEach(function (m) {
        timers.push(setTimeout(function () { if (txtEl) txtEl.textContent = m[1]; }, m[0]));
      });
      if (txtEl && msgs.length) txtEl.textContent = msgs[0][1];
      panel._skTimers = timers;
      // Elapsed-time counter
      var elapsedEl = box.querySelector('[data-sk-elapsed]');
      var startT = Date.now();
      var tick = setInterval(function () {
        if (elapsedEl) {
          var s = Math.floor((Date.now() - startT) / 1000);
          elapsedEl.textContent = s < 60 ? s + 's' : Math.floor(s / 60) + 'm ' + (s % 60) + 's';
        }
      }, 500);
      panel._skElapsedTick = tick;
    } else {
      stopStaged(panel);
      if (panel._skElapsedTick) { clearInterval(panel._skElapsedTick); panel._skElapsedTick = null; }
      var box2 = panel.querySelector('[data-sk-loading]');
      if (box2) box2.hidden = true;
    }
  }

  /* Smooth-scroll a result panel into view when work starts */
  function scrollToEl(el) {
    if (!el) return;
    try { el.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth', block: 'nearest' }); }
    catch (e) { try { el.scrollIntoView(); } catch (e2) {} }
  }

  /* Copy-button feedback: label → "✓ Copied!" for 2s, then revert */
  function copyFeedback(btn, label) {
    if (!btn) return;
    if (!btn.dataset._clabel) btn.dataset._clabel = btn.innerHTML;
    btn.innerHTML = label || '✓ Copied!';
    setTimeout(function () {
      if (btn.dataset._clabel) { btn.innerHTML = btn.dataset._clabel; delete btn.dataset._clabel; }
    }, 2000);
  }
  /* One-call copy: writes text, then shows feedback */
  function copyText(btn, text, label) {
    var done = function () { copyFeedback(btn, label); };
    if (!text) return;
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done);
    else done();
  }

  /* Empty-input guard: returns trimmed value, or null + shake + hint.
     Never fire an API on empty input. */
  function requireInput(input, msg) {
    var v = input ? (input.value || '').trim() : '';
    if (v) return v;
    if (input) {
      input.classList.remove('sk-shake');
      void input.offsetWidth; /* restart the shake animation */
      input.classList.add('sk-shake');
      var host = input.parentNode, hint = null;
      if (host) {
        hint = host.querySelector('[data-sk-hint]');
        if (!hint) {
          hint = document.createElement('p');
          hint.className = 'sk-hint';
          hint.setAttribute('data-sk-hint', '1');
          host.appendChild(hint);
        }
        hint.hidden = false;
        hint.textContent = msg || 'Please enter something first.';
      }
      try { input.focus(); } catch (e) {}
    }
    return null;
  }
  /* Writes an error into a dedicated paragraph INSIDE el without wiping
     el's existing content. Adds .sk-error (red border, theme-aware). */
  function showError(el, msg, retryFn) {
    if (!el) return;
    el.hidden = false;
    el.classList.add('sk-error');
    var p = el.querySelector('[data-sk-err]');
    if (!p) {
      p = document.createElement('p');
      p.setAttribute('data-sk-err', '1');
      p.className = 'sk-err-msg';
      if (el.firstChild) el.insertBefore(p, el.firstChild);
      else el.appendChild(p);
    }
    p.hidden = false;
    // Friendly messages for rate limits / quota errors
    var friendly = msg;
    if (msg && msg.indexOf('429') !== -1) {
      friendly = 'The AI is busy (rate limit). Please wait 15 seconds and try again.';
    } else if (msg && msg.indexOf('402') !== -1) {
      friendly = 'The free AI service hit its usage limit. Please wait a minute and try again.';
    }
    p.textContent = '⚠️ ' + friendly;
    // Add retry button if retryFn provided
    var oldBtn = el.querySelector('[data-sk-retry]');
    if (oldBtn) oldBtn.remove();
    if (typeof retryFn === 'function') {
      var btn = document.createElement('button');
      btn.setAttribute('data-sk-retry', '1');
      btn.className = 'sk-retry-btn';
      btn.textContent = '🔄 Retry';
      btn.style.cssText = 'margin-top:8px;padding:8px 16px;background:#06b6d4;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;';
      btn.onclick = function() {
        btn.remove();
        p.hidden = true;
        el.classList.remove('sk-error');
        retryFn();
      };
      p.appendChild(document.createElement('br'));
      p.appendChild(btn);
    }
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Test hook: ?forceCloud=1 skips on-device AI and goes straight to cloud.
     Lets us verify the cloud-only path (as on browsers without on-device AI). */
  function forceCloud() {
    try { return /(?:^|[?&])forceCloud=1(?:&|$)/.test(location.search); }
    catch (e) { return false; }
  }

  /* On-device attempt with a timeout, falling back to cloud.
     deviceFn: () => Promise (on-device attempt) or null to skip
     cloudFn:  () => Promise (cloud fallback)
     Never hangs forever: after `ms` (default 20s) the cloud fallback runs. */
  function deviceOrCloud(deviceFn, cloudFn, ms) {
    ms = ms || 20000;
    if (!deviceFn || forceCloud()) return cloudFn();
    return new Promise(function (resolve, reject) {
      var finished = false;
      var timer = setTimeout(function () {
        if (!finished) { finished = true; cloudFn().then(resolve, reject); }
      }, ms);
      deviceFn().then(
        function (t) { if (!finished) { finished = true; clearTimeout(timer); resolve(t); } },
        function () { if (!finished) { finished = true; clearTimeout(timer); cloudFn().then(resolve, reject); } }
      );
    });
  }

  window.SK_AI = {
    chat: aiChat,
    deviceOrCloud: deviceOrCloud,
    forceCloud: forceCloud,
    typeInto: typeInto,
    pollinationsImage: pollinationsImage,
    canMakeImageRequest: canMakeImageRequest,
    markImageRequest: markImageRequest,
    proPrompt: proPrompt,
    IMAGE_MODELS: IMAGE_MODELS,
    setBusy: setBusy,
    loading: loading,
    scrollTo: scrollToEl,
    copyFeedback: copyFeedback,
    copyText: copyText,
    requireInput: requireInput,
    showError: showError,
    escapeHtml: escapeHtml
  };
})();
