/* ============================================================
   AllVerse — Google-style smart search (vanilla JS, no deps)
   Features:
   1. Autocomplete dropdown (up to 8, icons, category, <mark>)
   2. Fuzzy matching (typo tolerance, no library)
   3. Smart ranking (prefix > word-start > substring > fuzzy)
   4. Keyboard nav (↑/↓/Enter/Esc)
   5. Recent searches (localStorage, last 5)
   6. Trending searches (on focus, empty input)
   7. "Did you mean" on zero results
   8. Searches name, roman/keys, category
   9. Click-outside / Esc closes; mobile friendly
   Uses window.SK_TOOLS (exposed by main.js).
   ============================================================ */
(function () {
  'use strict';

  function tools() { return (window.SK_TOOLS || []); }

  /* ---------- category emoji (dropdown icons) ---------- */
  var CAT_ICON = {
    'Image Tools': '🖼️', 'Text Tools': '📝', 'Calculators': '🧮',
    'Converters': '🔄', 'Generators': '⚡', 'Developer Tools': '💻',
    'Color Tools': '🎨', 'Date & Time': '🕐', 'Social Media': '📱',
    'Fun Tools': '🎲', 'SEO Tools': '🔍', 'Finance Tools': '💰',
    'Health Tools': '❤️', 'PDF Tools': '📄', 'Writing Tools': '✍️',
    'Marketing Tools': '📣', 'Education Tools': '🎓', 'Security Tools': '🔒',
    'Business Tools': '💼', 'Everyday Tools': '🛠️',
    'Pakistan Utilities': '🇵🇰', 'Islamic Tools': '☪️', 'AI Tools': '🤖',
    'Resume Tools': '📝', 'Video Tools': '🎬', 'Audio Tools': '🎙️',
    'Font Tools': '🔤', 'Meme Tools': '😂', 'Travel Tools': '✈️',
    'Real Estate Tools': '🏠', 'Wedding Tools': '💒',
    'Sports Tools': '🏆', 'Cooking Tools': '🍳'
  };

  var TRENDING = [
    'AI Image Generator', 'Word Counter', 'Image Compressor',
    'QR Generator', 'AI Chat'
  ];

  /* ---------- text utils ---------- */
  function norm(s) {
    return (s || '').toLowerCase().replace(/[^a-z0-9\u0600-\u06FF ]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Edit distance (Levenshtein), capped — for typo tolerance */
  function editDist(a, b, cap) {
    var la = a.length, lb = b.length, i, j;
    if (Math.abs(la - lb) > cap) return cap + 1;
    var prev = [], cur = [];
    for (j = 0; j <= lb; j++) prev[j] = j;
    for (i = 1; i <= la; i++) {
      cur[0] = i;
      var rowMin = cur[0];
      for (j = 1; j <= lb; j++) {
        var cost = a[i - 1] === b[j - 1] ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
        if (cur[j] < rowMin) rowMin = cur[j];
      }
      if (rowMin > cap) return cap + 1;
      var t = prev; prev = cur; cur = t;
    }
    return prev[lb];
  }

  /* Subsequence check with gap penalty → 0..1 */
  function subseqScore(q, word) {
    var qi = 0, gaps = 0, first = -1;
    for (var wi = 0; wi < word.length && qi < q.length; wi++) {
      if (word[wi] === q[qi]) { if (first < 0) first = wi; qi++; }
      else if (qi > 0) gaps++;
    }
    if (qi < q.length) return 0;
    var score = q.length / (q.length + gaps * 0.7 + first * 0.2);
    return Math.max(0, Math.min(1, score));
  }

  /* Score one query against one field's tokens → {score, matchWord} */
  function fieldScore(q, field) {
    var tokens = norm(field).split(' ');
    var best = 0, bestWord = '';
    for (var i = 0; i < tokens.length; i++) {
      var w = tokens[i];
      if (!w) continue;
      var s = 0;
      if (w === q) s = 1;
      else if (w.indexOf(q) === 0) s = 0.92;
      else if (w.indexOf(q) > 0) s = 0.7;
      else {
        var cap = q.length <= 4 ? 1 : 2;
        if (Math.abs(w.length - q.length) <= cap && editDist(q, w, cap) <= cap) {
          s = 0.55; /* typo tolerance: "imge"→"image", "claculator"→"calculator" */
        } else {
          var ss = subseqScore(q, w);
          if (ss > 0.55) s = 0.45 * ss;
        }
      }
      if (s > best) { best = s; bestWord = w; }
      if (best >= 1) break;
    }
    return { score: best, word: bestWord };
  }

  /* Whole-query against full name for prefix ranking */
  function namePrefixScore(q, name) {
    var n = norm(name);
    if (n.indexOf(q) === 0) return 1;
    var words = n.split(' ');
    for (var i = 0; i < words.length; i++) if (words[i].indexOf(q) === 0) return 0.9;
    if (n.indexOf(q) !== -1) return 0.75;
    return 0;
  }

  var POPULAR = {
    'image-compressor.html': 5, 'word-counter.html': 5, 'qr-generator.html': 4,
    'password-generator.html': 4, 'bmi-calculator.html': 3, 'unit-converter.html': 3,
    'ai-image-generator.html': 4, 'ai-chat.html': 4
  };

  function rankTools(q) {
    q = norm(q);
    if (!q) return [];
    var out = [];
    var list = tools();
    for (var i = 0; i < list.length; i++) {
      var t = list[i];
      var ns = namePrefixScore(q, t.name);
      var fs = fieldScore(q, t.name + ' ' + (t.keys || ''));
      var cs = fieldScore(q, t.cat || '');
      /* smart ranking: exact prefix > word-start > fuzzy; name weighs most */
      var score = Math.max(ns * 3, fs.score * 2.2, cs.score * 0.8);
      if (score <= 0) continue;
      score += (POPULAR[t.href] || 0) * 0.06; /* popularity boost */
      out.push({ tool: t, score: score, word: fs.word || q });
    }
    out.sort(function (a, b) { return b.score - a.score; });
    return out;
  }

  function highlight(name, q) {
    var n = norm(name), qq = norm(q);
    var idx = n.indexOf(qq);
    if (idx !== -1) {
      /* map back to original casing via case-insensitive search */
      var low = name.toLowerCase(), qlow = qq;
      var i2 = low.indexOf(qlow);
      if (i2 !== -1) {
        return esc(name.slice(0, i2)) + '<mark>' + esc(name.slice(i2, i2 + qlow.length)) + '</mark>' + esc(name.slice(i2 + qlow.length));
      }
    }
    return esc(name);
  }

  /* ---------- recent searches ---------- */
  var RECENT_KEY = 'sk_recent_searches';
  function getRecent() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function addRecent(q) {
    q = (q || '').trim();
    if (!q) return;
    try {
      var r = getRecent().filter(function (x) { return x.toLowerCase() !== q.toLowerCase(); });
      r.unshift(q);
      localStorage.setItem(RECENT_KEY, JSON.stringify(r.slice(0, 5)));
    } catch (e) {}
  }
  function clearRecent() {
    try { localStorage.removeItem(RECENT_KEY); } catch (e) {}
  }

  /* ---------- dropdown ---------- */
  var input, drop, activeIdx = -1, currentItems = [], currentQuery = '';

  function ensureDrop() {
    if (drop) return;
    drop = document.createElement('div');
    drop.className = 'sk-search-drop';
    drop.setAttribute('role', 'listbox');
    drop.hidden = true;
    var wrap = input.closest('.search-wrap') || input.parentNode;
    wrap.style.position = 'relative';
    wrap.appendChild(drop);
  }

  function closeDrop() {
    if (drop) drop.hidden = true;
    activeIdx = -1;
  }

  function itemHtml(tool, q, i) {
    var icon = CAT_ICON[tool.cat] || '🔧';
    return '<div class="sk-sr-item' + (i === activeIdx ? ' active' : '') + '" role="option" data-i="' + i + '">' +
      '<span class="sk-sr-icon">' + icon + '</span>' +
      '<span class="sk-sr-main"><span class="sk-sr-name">' + highlight(tool.name, q) + '</span>' +
      '<span class="sk-sr-cat">' + esc(tool.cat || '') + '</span></span>' +
      '<span class="sk-sr-go">→</span></div>';
  }

  function renderSuggestions(q) {
    currentQuery = q;
    var ranked = rankTools(q).slice(0, 8);
    currentItems = ranked.map(function (r) { return r.tool; });
    if (!ranked.length) { renderDidYouMean(q); return; }
    activeIdx = -1;
    drop.innerHTML = '<div class="sk-sr-label">Tools</div>' +
      ranked.map(function (r, i) { return itemHtml(r.tool, q, i); }).join('');
    bindItems();
    drop.hidden = false;
  }

  function renderDidYouMean(q) {
    /* closest match across all tools */
    var best = null, bestScore = 0;
    var list = tools();
    for (var i = 0; i < list.length; i++) {
      var fs = fieldScore(q, list[i].name);
      if (fs.score > bestScore) { bestScore = fs.score; best = list[i]; }
    }
    currentItems = [];
    activeIdx = -1;
    if (best && bestScore > 0.3) {
      drop.innerHTML = '<div class="sk-sr-empty">No results for "<b>' + esc(q) + '</b>"</div>' +
        '<div class="sk-sr-dym">Did you mean <a href="' + best.href + '"><b>' + esc(best.name) + '</b></a>?</div>';
    } else {
      drop.innerHTML = '<div class="sk-sr-empty">No tools found for "<b>' + esc(q) + '</b>"</div>';
    }
    drop.hidden = false;
  }

  function renderHome() {
    /* focus + empty → recents + trending */
    var recents = getRecent();
    var html = '';
    if (recents.length) {
      html += '<div class="sk-sr-label">Recent searches <button class="sk-sr-clear" id="skClearRecent" type="button">Clear</button></div>';
      html += recents.map(function (r) {
        return '<div class="sk-sr-item sk-sr-recent" data-q="' + esc(r) + '"><span class="sk-sr-icon">🕐</span>' +
          '<span class="sk-sr-main"><span class="sk-sr-name">' + esc(r) + '</span></span></div>';
      }).join('');
    }
    html += '<div class="sk-sr-label">Trending</div>';
    html += TRENDING.map(function (name) {
      var t = null;
      var list = tools();
      for (var i = 0; i < list.length; i++) if (list[i].name === name) { t = list[i]; break; }
      if (!t) return '';
      return '<div class="sk-sr-item" data-href="' + t.href + '"><span class="sk-sr-icon">📈</span>' +
        '<span class="sk-sr-main"><span class="sk-sr-name">' + esc(t.name) + '</span>' +
        '<span class="sk-sr-cat">' + esc(t.cat || '') + '</span></span><span class="sk-sr-go">→</span></div>';
    }).join('');
    drop.innerHTML = html;
    currentItems = [];
    activeIdx = -1;
    var cr = drop.querySelector('#skClearRecent');
    if (cr) cr.addEventListener('click', function (e) { e.stopPropagation(); clearRecent(); renderHome(); });
    drop.querySelectorAll('.sk-sr-recent').forEach(function (el) {
      el.addEventListener('mousedown', function (e) {
        e.preventDefault();
        input.value = el.getAttribute('data-q');
        onInput();
        input.focus();
      });
    });
    drop.querySelectorAll('.sk-sr-item[data-href]').forEach(function (el) {
      el.addEventListener('mousedown', function (e) {
        e.preventDefault();
        window.location.href = el.getAttribute('data-href');
      });
    });
    drop.hidden = false;
  }

  function bindItems() {
    drop.querySelectorAll('.sk-sr-item[data-i]').forEach(function (el) {
      el.addEventListener('mousedown', function (e) {
        e.preventDefault(); /* keep input focus until navigation */
        goTo(parseInt(el.getAttribute('data-i'), 10));
      });
      el.addEventListener('mousemove', function () {
        setActive(parseInt(el.getAttribute('data-i'), 10));
      });
    });
  }

  function setActive(i) {
    activeIdx = i;
    drop.querySelectorAll('.sk-sr-item').forEach(function (el, j) {
      el.classList.toggle('active', j === i);
    });
    var a = drop.querySelectorAll('.sk-sr-item')[i];
    if (a && a.scrollIntoView) a.scrollIntoView({ block: 'nearest' });
  }

  function goTo(i) {
    var t = currentItems[i];
    if (!t) return;
    addRecent(currentQuery || t.name);
    window.location.href = t.href;
  }

  function onInput() {
    ensureDrop();
    var q = input.value.trim();
    if (!q) { renderHome(); return; }
    renderSuggestions(q);
  }

  function onKey(e) {
    if (!drop || drop.hidden) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentItems.length) setActive((activeIdx + 1) % currentItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentItems.length) setActive((activeIdx - 1 + currentItems.length) % currentItems.length);
    } else if (e.key === 'Enter') {
      if (activeIdx >= 0 && currentItems[activeIdx]) {
        e.preventDefault();
        goTo(activeIdx);
      } else if (input.value.trim()) {
        addRecent(input.value.trim());
        /* let index.html card filtering handle it; on other pages go to first result */
        if (currentItems.length && !document.querySelector('.tool-card')) {
          e.preventDefault();
          goTo(0);
        }
      }
    } else if (e.key === 'Escape') {
      closeDrop();
      input.blur();
    }
  }

  function init() {
    input = document.getElementById('siteSearch');
    if (!input || !tools().length) return;
    var deb = null;
    input.addEventListener('input', function () {
      clearTimeout(deb);
      deb = setTimeout(onInput, 110);
    });
    input.addEventListener('focus', function () {
      ensureDrop();
      if (!input.value.trim()) renderHome();
      else onInput();
    });
    input.addEventListener('keydown', onKey);
    input.addEventListener('blur', function () {
      /* mousedown handlers fire before blur; delay close slightly */
      setTimeout(closeDrop, 150);
    });
    document.addEventListener('click', function (e) {
      if (drop && !drop.hidden && !drop.contains(e.target) && e.target !== input) closeDrop();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
