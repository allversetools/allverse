/* ============================================================
   SabKuch — Shared AI helper (vanilla JS, no dependencies)
   - aiChat(prompt, systemPrompt): free text generation
     tries LLM7 (OpenAI-compatible) first, falls back to
     Pollinations text API. $0 cost, no API keys.
   - Request queue (1 concurrent), localStorage result cache,
     friendly 429 handling. Errors in Roman Urdu + English.
   ============================================================ */
(function () {
  'use strict';

  var LLM7_URL = 'https://api.llm7.io/v1/chat/completions';
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
  function llm7(prompt, system) {
    var body = {
      model: 'default',
      messages: [
        { role: 'system', content: system || 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 1200
    };
    return fetch(LLM7_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer unused'
      },
      body: JSON.stringify(body)
    }).then(function (res) {
      if (res.status === 429) {
        var e = new Error('AI busy, retry in a moment. / AI masroof hai, thori dair baad dobara try karein.');
        e.code = 429;
        throw e;
      }
      if (!res.ok) throw new Error('llm7:' + res.status);
      return res.json();
    }).then(function (data) {
      var txt = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (!txt) throw new Error('llm7:empty');
      return txt.trim();
    });
  }

  function pollinations(prompt, system) {
    var full = system ? (system + '\n\nUser request: ' + prompt) : prompt;
    var url = POLLINATIONS_TEXT + encodeURIComponent(full);
    return fetch(url, { method: 'GET' }).then(function (res) {
      if (res.status === 429) {
        var e = new Error('AI busy, retry in a moment. / AI masroof hai, thori dair baad dobara try karein.');
        e.code = 429;
        throw e;
      }
      if (!res.ok) throw new Error('pollinations:' + res.status);
      return res.text();
    }).then(function (txt) {
      txt = (txt || '').trim();
      if (!txt) throw new Error('pollinations:empty');
      return txt;
    });
  }

  function runRequest(prompt, system) {
    return llm7(prompt, system).catch(function () {
      return pollinations(prompt, system); /* graceful fallback */
    });
  }

  /* ---------- public API ---------- */
  function aiChat(prompt, systemPrompt) {
    prompt = (prompt || '').trim();
    if (!prompt) return Promise.reject(new Error('Empty prompt. / Khali request.'));
    var key = hashStr((systemPrompt || '') + '||' + prompt);
    var cached = cacheGet(key);
    if (cached !== null) return Promise.resolve(cached);
    return enqueue(prompt, systemPrompt).then(function (txt) {
      cacheSet(key, txt);
      return txt;
    });
  }

  /* Typing effect: reveals text char-by-char into an element */
  function typeInto(el, text, done) {
    if (!el) { if (done) done(); return; }
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
  function pollinationsImage(prompt, opts) {
    opts = opts || {};
    var w = opts.width || 1024, h = opts.height || 1024;
    var model = opts.model || 'flux';
    var seed = (typeof opts.seed === 'number') ? opts.seed : Math.floor(Math.random() * 999999);
    return 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) +
      '?width=' + w + '&height=' + h + '&model=' + model + '&nologo=true&seed=' + seed;
  }

  /* Small UX helpers used by AI tool pages */
  function setBusy(btn, busy, busyLabel) {
    if (!btn) return;
    if (busy) {
      btn.dataset._label = btn.textContent;
      btn.disabled = true;
      btn.textContent = busyLabel || 'AI soch raha hai… / Thinking…';
    } else {
      btn.disabled = false;
      if (btn.dataset._label) btn.textContent = btn.dataset._label;
    }
  }
  function showError(el, msg) {
    if (!el) return;
    el.hidden = false;
    el.innerHTML = '<p style="color:#b91c1c">⚠️ ' + escapeHtml(msg) + '</p>';
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  window.SK_AI = {
    chat: aiChat,
    typeInto: typeInto,
    pollinationsImage: pollinationsImage,
    setBusy: setBusy,
    showError: showError,
    escapeHtml: escapeHtml
  };
})();
