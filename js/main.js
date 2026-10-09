/* ============================================================
   SabKuch — Shared behaviour (vanilla JS, no dependencies)
   1. Mobile sidebar menu   2. Live tool search
   3. Scroll reveal          4. Card tilt + glare (CSS vars)
   5. Button ripple         6. Global SK helpers (copy / download)
   7. Dark mode toggle      8. Spotlight grid tracking
   9. Magnetic buttons     10. Command palette (Ctrl+K)
   11. Favorites + recently used (localStorage)
   ============================================================ */
(function () {
  'use strict';

  var HOVERABLE = window.matchMedia && window.matchMedia('(hover: hover)').matches;
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Tool registry (powers palette + favorites) ---------- */
  var TOOLS = [
    { name: 'Image Resizer', href: 'image-resizer.html', cat: 'Image Tools', keys: 'resize photo dimensions' },
    { name: 'Image Compressor', href: 'image-compressor.html', cat: 'Image Tools', keys: 'compress shrink optimize jpg png' },
    { name: 'YouTube Thumbnail Resizer', href: 'youtube-thumbnail-resizer.html', cat: 'Image Tools', keys: 'youtube thumbnail 1280 720 resize' },
    { name: 'Word Counter', href: 'word-counter.html', cat: 'Text Tools', keys: 'words characters reading time' },
    { name: 'Case Converter', href: 'case-converter.html', cat: 'Text Tools', keys: 'uppercase lowercase title case' },
    { name: 'BMI Calculator', href: 'bmi-calculator.html', cat: 'Calculators', keys: 'body mass index weight height' },
    { name: 'Age Calculator', href: 'age-calculator.html', cat: 'Calculators', keys: 'birthday years months days' },
    { name: 'Unit Converter', href: 'unit-converter.html', cat: 'Converters', keys: 'length weight temperature' },
    { name: 'Currency Converter', href: 'currency-converter.html', cat: 'Converters', keys: 'pkr usd eur money exchange' },
    { name: 'Password Generator', href: 'password-generator.html', cat: 'Generators', keys: 'strong random secure' },
    { name: 'QR Generator', href: 'qr-generator.html', cat: 'Generators', keys: 'qr code scan text link' },
    { name: 'WhatsApp Link Generator', href: 'whatsapp-link-generator.html', cat: 'Generators', keys: 'whatsapp wa.me link message' },
    { name: 'JSON Formatter', href: 'json-formatter.html', cat: 'Developer Tools', keys: 'validate minify beautify code' },
    { name: 'Color Picker', href: 'color-picker.html', cat: 'Developer Tools', keys: 'hex rgb hsl eyedropper' },
    { name: 'Palette Generator', href: 'palette-generator.html', cat: 'Color Tools', keys: 'color scheme swatches' },
    { name: 'Contrast Checker', href: 'contrast-checker.html', cat: 'Color Tools', keys: 'wcag accessibility ratio' },
    { name: 'Countdown Timer', href: 'countdown-timer.html', cat: 'Date & Time', keys: 'countdown days hours' },
    { name: 'Date Difference', href: 'date-difference.html', cat: 'Date & Time', keys: 'days between dates' },
    { name: 'Hashtag Generator', href: 'hashtag-generator.html', cat: 'Social Media', keys: 'instagram tiktok tags' },
    { name: 'Bio Maker', href: 'bio-maker.html', cat: 'Social Media', keys: 'profile instagram about' },
    { name: 'Random Picker', href: 'random-picker.html', cat: 'Fun Tools', keys: 'random draw pick winner' },
    { name: 'Dice Roller', href: 'dice-roller.html', cat: 'Fun Tools', keys: 'dice roll game' }
  ];
  function toolByHref(href) {
    for (var i = 0; i < TOOLS.length; i++) if (TOOLS[i].href === href) return TOOLS[i];
    return null;
  }

  /* ---------- 1. Mobile menu ---------- */
  var menuToggle = document.getElementById('menuToggle');
  var sidebar = document.getElementById('sidebar');
  var scrim = null;

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    if (scrim && scrim.parentNode) scrim.parentNode.removeChild(scrim);
    scrim = null;
    document.body.style.overflow = '';
  }

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', function () {
      var willOpen = !sidebar.classList.contains('open');
      sidebar.classList.toggle('open', willOpen);
      if (willOpen) {
        scrim = document.createElement('div');
        scrim.className = 'scrim';
        scrim.addEventListener('click', closeSidebar);
        document.body.appendChild(scrim);
        document.body.style.overflow = 'hidden';
      } else {
        closeSidebar();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSidebar();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeSidebar();
    });
  }

  /* ---------- 2. Live tool search ---------- */
  var searchInput = document.getElementById('siteSearch');

  if (searchInput) {
    var deb = null;
    searchInput.addEventListener('input', function () {
      clearTimeout(deb);
      deb = setTimeout(function () {
        var q = searchInput.value.trim().toLowerCase();
        document.querySelectorAll('.tool-card').forEach(function (card) {
          var name = (card.getAttribute('data-name') || card.textContent || '').toLowerCase();
          card.hidden = q !== '' && name.indexOf(q) === -1;
        });
        document.querySelectorAll('.cat-section').forEach(function (section) {
          var visible = section.querySelectorAll('.tool-card:not([hidden])').length;
          section.hidden = q !== '' && visible === 0;
        });
      }, 120);
    });
  }

  /* ---------- 3. Scroll reveal ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- 4. Card tilt + glare (CSS vars, desktop only) ---------- */
  if (HOVERABLE && !REDUCED) {
    document.querySelectorAll('.tool-card.tilt').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', (px * 11).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (-py * 11).toFixed(2) + 'deg');
        card.style.setProperty('--gx', ((px + 0.5) * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', ((py + 0.5) * 100).toFixed(1) + '%');
      });
      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- 5. Button ripple (delegated) ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.btn') : null;
    if (!btn) return;
    var r = btn.getBoundingClientRect();
    var size = Math.max(r.width, r.height);
    var ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - r.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - r.top - size / 2) + 'px';
    btn.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 600);
  });

  /* ---------- 6. Global SK helpers ---------- */
  window.SK = {
    copy: function (text) {
      text = String(text == null ? '' : text);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(
          function () { return true; },
          function () { return fallbackCopy(text); }
        );
      }
      return Promise.resolve(fallbackCopy(text));
    },
    download: function (url, filename) {
      var a = document.createElement('a');
      a.href = url;
      if (filename) a.setAttribute('download', filename);
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { a.remove(); }, 100);
    },
    toast: function (msg) {
      var t = document.querySelector('.toast');
      if (!t) {
        t = document.createElement('div');
        t.className = 'toast';
        document.body.appendChild(t);
      }
      t.textContent = msg;
      t.classList.add('show');
      clearTimeout(t._h);
      t._h = setTimeout(function () { t.classList.remove('show'); }, 2200);
    }
  };

  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      ta.remove();
      return !!ok;
    } catch (err) {
      return false;
    }
  }

  /* ---------- 7. Dark mode (iOS-style switch) ----------
     Switch ON  (checked, knob right) = Light / white screen
     Switch OFF (unchecked, knob left) = Dark  / black screen  */
  var themeSwitch = document.getElementById('themeToggle');
  var themeLabel = document.getElementById('themeLabel');
  function currentTheme() {
    try {
      var saved = localStorage.getItem('sk_theme');
      if (saved) return saved;
    } catch (e) {}
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    if (themeSwitch) themeSwitch.checked = (t === 'light');
    if (themeLabel) themeLabel.textContent = (t === 'light') ? 'Light' : 'Dark';
    try { localStorage.setItem('sk_theme', t); } catch (e) {}
  }
  applyTheme(currentTheme());
  if (themeSwitch) {
    themeSwitch.addEventListener('change', function () {
      applyTheme(themeSwitch.checked ? 'light' : 'dark');
    });
  }

  /* ---------- 8. Spotlight grid tracking (Gemini) ---------- */
  if (HOVERABLE && !REDUCED) {
    document.querySelectorAll('.cards-grid, .tool-grid').forEach(function (grid) {
      grid.addEventListener('mousemove', function (e) {
        var r = grid.getBoundingClientRect();
        grid.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        grid.style.setProperty('--my', (e.clientY - r.top) + 'px');
        grid.classList.add('spotlight-on');
      });
      grid.addEventListener('mouseleave', function () {
        grid.classList.remove('spotlight-on');
      });
    });
  }

  /* ---------- 9. Magnetic buttons (ChatGPT) ---------- */
  if (HOVERABLE && !REDUCED) {
    document.querySelectorAll('.btn.magnetic').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        var pull = Math.min(5, dist / 12);
        btn.style.transform = 'translate(' + (dx / dist * pull).toFixed(1) + 'px,' + (dy / dist * pull).toFixed(1) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- 10. Command palette (ChatGPT) ---------- */
  var paletteBuilt = false, palOverlay, palInput, palList, palItems = [], palActive = -1;

  function buildPalette() {
    if (paletteBuilt) return;
    paletteBuilt = true;
    palOverlay = document.createElement('div');
    palOverlay.className = 'cmd-overlay';
    palOverlay.innerHTML =
      '<div class="cmd-palette" role="dialog" aria-label="Quick tool search">' +
      '<input class="cmd-input" id="cmdInput" type="text" placeholder="Type a tool name…" autocomplete="off">' +
      '<div class="cmd-list" id="cmdList"></div>' +
      '<div class="cmd-hint"><kbd>↑</kbd><kbd>↓</kbd> navigate &nbsp; <kbd>↵</kbd> open &nbsp; <kbd>esc</kbd> close</div>' +
      '</div>';
    document.body.appendChild(palOverlay);
    palInput = palOverlay.querySelector('#cmdInput');
    palList = palOverlay.querySelector('#cmdList');

    palInput.addEventListener('input', renderPalette);
    palInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); movePal(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); movePal(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); openPal(); }
      else if (e.key === 'Escape') { closePalette(); }
    });
    palOverlay.addEventListener('click', function (e) {
      if (e.target === palOverlay) closePalette();
    });
    renderPalette();
  }

  function renderPalette() {
    var q = (palInput.value || '').trim().toLowerCase();
    palItems = TOOLS.filter(function (t) {
      return !q || t.name.toLowerCase().indexOf(q) !== -1 || t.keys.indexOf(q) !== -1 || t.cat.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 9);
    palActive = palItems.length ? 0 : -1;
    palList.innerHTML = palItems.map(function (t, i) {
      return '<div class="cmd-item' + (i === palActive ? ' active' : '') + '" data-i="' + i + '">' +
        '<span>' + t.name + '</span><span class="cmd-cat">' + t.cat + '</span></div>';
    }).join('') || '<div class="cmd-item"><span>No tools found</span></div>';
    palList.querySelectorAll('.cmd-item[data-i]').forEach(function (el) {
      el.addEventListener('click', function () {
        palActive = parseInt(el.getAttribute('data-i'), 10);
        openPal();
      });
    });
  }

  function movePal(d) {
    if (!palItems.length) return;
    palActive = (palActive + d + palItems.length) % palItems.length;
    palList.querySelectorAll('.cmd-item').forEach(function (el, i) {
      el.classList.toggle('active', i === palActive);
    });
    var active = palList.querySelectorAll('.cmd-item')[palActive];
    if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest' });
  }

  function openPal() {
    if (palActive >= 0 && palItems[palActive]) {
      window.location.href = palItems[palActive].href;
    }
  }

  function openPalette() {
    buildPalette();
    palOverlay.classList.add('open');
    palInput.value = '';
    renderPalette();
    setTimeout(function () { palInput.focus(); }, 30);
  }
  function closePalette() {
    if (palOverlay) palOverlay.classList.remove('open');
  }

  document.addEventListener('keydown', function (e) {
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    var typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (palOverlay && palOverlay.classList.contains('open')) closePalette(); else openPalette();
    } else if (e.key === '/' && !typing) {
      e.preventDefault();
      openPalette();
    } else if (e.key === 'Escape' && palOverlay && palOverlay.classList.contains('open')) {
      closePalette();
    }
  });

  /* ---------- 11. Favorites + recently used ---------- */
  function lsGet(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  var favs = lsGet('sk_favs', []);

  // Inject favorite buttons into cards on index/category pages
  document.querySelectorAll('.tool-card').forEach(function (card) {
    var href = card.getAttribute('href');
    if (!href) return;
    var btn = document.createElement('button');
    btn.className = 'fav-btn' + (favs.indexOf(href) !== -1 ? ' faved' : '');
    btn.setAttribute('aria-label', 'Toggle favorite');
    btn.setAttribute('title', 'Save to favorites');
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var i = favs.indexOf(href);
      if (i === -1) { favs.push(href); btn.classList.add('faved'); SK.toast('Added to favorites'); }
      else { favs.splice(i, 1); btn.classList.remove('faved'); SK.toast('Removed from favorites'); }
      lsSet('sk_favs', favs);
      renderFavSection();
    });
    card.appendChild(btn);
  });

  // Track tool page visits as "recently used"
  (function trackRecent() {
    var path = (window.location.pathname.split('/').pop() || 'index.html');
    if (path === '' ) path = 'index.html';
    var tool = toolByHref(path);
    if (!tool) return;
    var recent = lsGet('sk_recent', []).filter(function (h) { return h !== path; });
    recent.unshift(path);
    lsSet('sk_recent', recent.slice(0, 6));
  })();

  function cardHTML(tool) {
    return '<a class="tool-card tilt" href="' + tool.href + '">' +
      '<h3>' + tool.name + '</h3><p>' + tool.cat + '</p></a>';
  }

  function renderFavSection() {
    var wrap = document.getElementById('favSection');
    if (!wrap) return;
    var items = favs.map(toolByHref).filter(Boolean);
    wrap.hidden = items.length === 0;
    var grid = wrap.querySelector('.cards-grid');
    if (grid) grid.innerHTML = items.map(cardHTML).join('');
  }

  function renderRecentSection() {
    var wrap = document.getElementById('recentSection');
    if (!wrap) return;
    var recent = lsGet('sk_recent', []).map(toolByHref).filter(Boolean).slice(0, 4);
    wrap.hidden = recent.length === 0;
    var grid = wrap.querySelector('.cards-grid');
    if (grid) grid.innerHTML = recent.map(cardHTML).join('');
  }

  renderFavSection();
  renderRecentSection();

  /* ---------- 13. Hero 3D stage parallax (V4) ----------
     Mouse steers the floating card constellation (desktop only). */
  if (HOVERABLE && !REDUCED) {
    var stage = document.getElementById('stageInner');
    var heroEl = document.querySelector('.hero');
    if (stage && heroEl) {
      heroEl.addEventListener('mousemove', function (e) {
        var r = heroEl.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        stage.style.setProperty('--sry', (px * 14).toFixed(2) + 'deg');
        stage.style.setProperty('--srx', (-py * 10).toFixed(2) + 'deg');
      });
      heroEl.addEventListener('mouseleave', function () {
        stage.style.setProperty('--srx', '0deg');
        stage.style.setProperty('--sry', '0deg');
      });
    }
  }
})();
