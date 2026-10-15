(function () {
  'use strict';

  function todayStr() {
    try { return new Date().toISOString().slice(0, 10); } catch (e) { return ''; }
  }
  function yesterdayStr() {
    try {
      var d = new Date();
      d.setUTCDate(d.getUTCDate() - 1);
      return d.toISOString().slice(0, 10);
    } catch (e) { return ''; }
  }
  function readLS(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function writeLS(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function hashStr(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    }
    return h >>> 0;
  }

  function share(opts) {
    opts = opts || {};
    var title = opts.title || document.title;
    var text = opts.text || '';
    var url = opts.url || window.location.href;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        var p = navigator.share({ title: title, text: text, url: url });
        if (p && typeof p.catch === 'function') {
          p.catch(function () { fallbackShare(text, url); });
        }
        return;
      } catch (e) { /* fall through to fallback */ }
    }
    fallbackShare(text, url);
  }
  function fallbackShare(text, url) {
    var wa = 'https://wa.me/?text=' + encodeURIComponent((text ? text + ' ' : '') + url);
    var w = null;
    try { w = window.open(wa, '_blank', 'noopener'); } catch (e) { w = null; }
    if (!w) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).catch(function () {});
        }
      } catch (e) { /* clipboard unavailable */ }
      try { window.alert('Link copied'); } catch (e) { /* no alert */ }
    }
  }

  function dailySeed(slug) {
    return hashStr(todayStr() + '|' + String(slug || ''));
  }

  function getStreak(slug) {
    var data = readLS('av_streak_' + slug, null);
    if (!data || typeof data.count !== 'number') return 0;
    return data.count;
  }
  function bumpStreak(slug) {
    var today = todayStr();
    var data = readLS('av_streak_' + slug, null);
    var count = 0;
    if (data && data.last === today) return typeof data.count === 'number' ? data.count : 0;
    if (data && data.last === yesterdayStr() && typeof data.count === 'number') count = data.count + 1;
    else count = 1;
    writeLS('av_streak_' + slug, { last: today, count: count });
    return count;
  }

  var COUNTRIES = ['Pakistan', 'India', 'Bangladesh', 'Other'];
  var leaderboard = {
    submit: function (slug, entry) {
      entry = entry || {};
      var name = String(entry.name == null ? '' : entry.name).replace(/[<>&]/g, '').trim();
      var score = Number(entry.score);
      var country = String(entry.country == null ? '' : entry.country);
      if (name.length < 1 || name.length > 16) return false;
      if (!isFinite(score) || score < 0 || score > 10000000) return false;
      if (COUNTRIES.indexOf(country) === -1) return false;
      var key = 'av_lb_' + slug;
      var list = readLS(key, []);
      if (!Array.isArray(list)) list = [];
      list.push({ name: name, score: score, country: country, date: todayStr(), ts: Date.now() });
      list.sort(function (a, b) { return b.score - a.score; });
      if (list.length > 500) list = list.slice(0, 500);
      writeLS(key, list);
      return true;
    },
    top: function (slug, board, n) {
      var list = readLS('av_lb_' + slug, []);
      if (!Array.isArray(list)) list = [];
      var out;
      if (board === 'daily') {
        var today = todayStr();
        out = list.filter(function (e) { return e && e.date === today; });
      } else if (board === 'country') {
        var best = {};
        list.forEach(function (e) {
          if (!e || !e.country) return;
          if (!best[e.country] || e.score > best[e.country].score) best[e.country] = e;
        });
        out = Object.keys(best).map(function (k) { return best[k]; });
      } else {
        out = list.slice();
      }
      out.sort(function (a, b) { return b.score - a.score; });
      return out.slice(0, n == null ? 5 : n);
    },
    render: function (el, slug) {
      if (!el) return;
      var board = el.getAttribute('data-av-board') || 'daily';
      function draw(message) {
        var tabs = ['daily', 'all', 'country'];
        var labels = { daily: 'Daily', all: 'All-time', country: 'By country' };
        var rows = leaderboard.top(slug, board, 5);
        var html = '<div class="av-lb"><div class="av-lb-tabs" role="tablist">';
        tabs.forEach(function (t) {
          html += '<button type="button" class="av-lb-tab' + (t === board ? ' active' : '') + '" data-board="' + t + '">' + labels[t] + '</button>';
        });
        html += '</div>';
        if (!rows.length) {
          html += '<p class="av-lb-empty">No scores yet — be the first to play.</p>';
        } else {
          html += '<ol class="av-lb-list">';
          rows.forEach(function (e, i) {
            html += '<li><span class="av-lb-rank">' + (i + 1) + '</span> <span class="av-lb-name">' + esc(e.name) + '</span> <span class="av-lb-country">' + esc(e.country) + '</span> <b class="av-lb-score">' + esc(fmt(e.score)) + '</b></li>';
          });
          html += '</ol>';
        }
        html += '<form class="av-lb-form"><label>Nickname <input type="text" class="av-lb-name-input" maxlength="16" placeholder="Your nickname" required></label>'
          + '<label>Country <select class="av-lb-country-select"><option>Pakistan</option><option>India</option><option>Bangladesh</option><option>Other</option></select></label>'
          + '<label>Score <input type="number" class="av-lb-score-input" min="0" max="10000000" step="1" placeholder="Your score" required></label>'
          + '<button type="submit" class="btn btn-primary">Submit score</button></form>';
        if (message) html += '<p class="av-lb-msg">' + esc(message) + '</p>';
        html += '</div>';
        el.innerHTML = html;
        el.querySelectorAll('.av-lb-tab').forEach(function (btn) {
          btn.addEventListener('click', function () {
            el.setAttribute('data-av-board', btn.getAttribute('data-board'));
            leaderboard.render(el, slug);
          });
        });
        var form = el.querySelector('.av-lb-form');
        if (form) {
          form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            var name = el.querySelector('.av-lb-name-input').value;
            var country = el.querySelector('.av-lb-country-select').value;
            var score = Number(el.querySelector('.av-lb-score-input').value);
            var ok = leaderboard.submit(slug, { name: name, score: score, country: country });
            leaderboard.render(el, slug);
            if (!ok) {
              var msg = el.querySelector('.av-lb-msg');
              if (!msg) {
                msg = document.createElement('p');
                msg.className = 'av-lb-msg';
                el.querySelector('.av-lb').appendChild(msg);
              }
              msg.textContent = 'Enter a nickname (1–16 characters), a valid score, and a country.';
            }
          });
        }
      }
      draw('');
    }
  };

  function track(event, data) {
    var entry = { event: String(event || ''), data: data == null ? null : data, ts: Date.now() };
    var list = readLS('av_events', []);
    if (!Array.isArray(list)) list = [];
    list.push(entry);
    if (list.length > 200) list = list.slice(list.length - 200);
    writeLS('av_events', list);
    try {
      window.dispatchEvent(new CustomEvent('av:analytics', { detail: { event: entry.event, data: entry.data } }));
    } catch (e) { /* dispatch unavailable */ }
  }

  function whileYouHere(el, prefix) {
    if (!el) return;
    prefix = prefix == null ? '../' : prefix;
    var tools = [
      { href: prefix + 'image-compressor.html', name: 'Image Compressor' },
      { href: prefix + 'merge-pdf.html', name: 'Merge PDF' },
      { href: prefix + 'qr-generator.html', name: 'QR Generator' }
    ];
    var html = '<div class="av-while-here"><h3>While you\'re here</h3><ul>';
    tools.forEach(function (t) {
      html += '<li><a href="' + esc(t.href) + '" data-tool="' + esc(t.name) + '">' + esc(t.name) + '</a></li>';
    });
    html += '</ul></div>';
    el.innerHTML = html;
    el.querySelectorAll('a[data-tool]').forEach(function (a) {
      a.addEventListener('click', function () {
        track('tool_click_from_game', { tool: a.getAttribute('data-tool') });
      });
    });
  }

  function adSlot(id) {
    return '<div class="av-ad-slot" data-slot="' + esc(id) + '" style="min-height:90px;display:flex;align-items:center;justify-content:center;border:1px dashed #cbd5e1;border-radius:12px;color:#94a3b8;font-size:0.85rem;background:#f8fafc;">Advertisement</div>';
  }

  function markPlayed(slug) {
    slug = String(slug || '');
    if (!slug) return;
    var list = readLS('av_recent', []);
    if (!Array.isArray(list)) list = [];
    list = list.filter(function (s) { return s !== slug; });
    list.unshift(slug);
    if (list.length > 4) list = list.slice(0, 4);
    writeLS('av_recent', list);
  }
  function getRecent() {
    var list = readLS('av_recent', []);
    return Array.isArray(list) ? list.slice(0, 4) : [];
  }

  function fmt(n) {
    var num = Number(n);
    if (!isFinite(num)) return '0';
    return num.toLocaleString('en-US');
  }
  function reducedMotion() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  }
  function onVisibility(onHide, onShow) {
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { if (typeof onHide === 'function') onHide(); }
      else { if (typeof onShow === 'function') onShow(); }
    });
  }

  window.AV_Games = {
    share: share,
    dailySeed: dailySeed,
    getStreak: getStreak,
    bumpStreak: bumpStreak,
    leaderboard: leaderboard,
    track: track,
    whileYouHere: whileYouHere,
    adSlot: adSlot,
    markPlayed: markPlayed,
    getRecent: getRecent,
    fmt: fmt,
    reducedMotion: reducedMotion,
    onVisibility: onVisibility
  };
})();
