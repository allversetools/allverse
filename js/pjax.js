/* ============================================================
   AllVerse PJAX — seamless page navigation (music never stops)
   Intercepts internal links, swaps content via AJAX, keeps
   audio element alive. Like SoundCloud's approach.
   ============================================================ */
(function () {
  'use strict';

  var container = null;
  var isLoading = false;

  function getContainer() {
    if (!container) {
      // Wrap main content — everything except header/footer/scripts
      var main = document.querySelector('main');
      if (main) {
        container = main;
      } else {
        // Fallback: use body content wrapper
        container = document.body;
      }
    }
    return container;
  }

  var SITE_ROOT = '/allverse/';

  /* Game pages (/games/<slug>/) are NEVER PJAX targets: their game
     scripts live OUTSIDE <main> (end of <body>), so a PJAX swap would
     leave a dead canvas. They always full-load; music.js resumes the
     track from its saved position so the music still never restarts. */
  function isGamePageUrl(u) {
    var p = (typeof u === 'string') ? u : u.pathname;
    return /^\/allverse\/games\/[^/]+\/(index\.html)?$/.test(p);
  }

  function isInternalLink(a) {
    if (!a || !a.href) return false;
    if (a.target === '_blank') return false;
    if (a.hasAttribute('download')) return false;
    var url;
    try { url = new URL(a.href, window.location.href); } catch (e) { return false; }
    // Same origin, under the site root
    if (url.origin !== window.location.origin) return false;
    if (url.pathname.indexOf(SITE_ROOT) !== 0) return false;
    // Game pages: full load (see isGamePageUrl)
    if (isGamePageUrl(url)) return false;
    // Skip hash-only navigation on same page
    if (url.pathname === window.location.pathname && url.hash) return false;
    return true;
  }

  function loadPage(url, pushState) {
    if (isLoading) return;
    // Game pages always full-load (their scripts live outside <main>).
    try {
      var target = new URL(url, window.location.href);
      if (isGamePageUrl(target)) { window.location.href = url; return; }
    } catch (e) {}
    isLoading = true;

    // Let the outgoing page stop its loops/timers (games register via
    // AV_Games.onPageLeave). Shared registry — future games inherit it.
    try { document.dispatchEvent(new Event('pjax:beforeunload')); } catch (e) {}
    try {
      if (window.AV_Games && typeof window.AV_Games.runLeaveCleanups === 'function') {
        window.AV_Games.runLeaveCleanups();
      }
    } catch (e) {}

    // Show subtle loading indicator
    document.body.classList.add('pjax-loading');

    fetch(url, { headers: { 'X-PJAX': 'true' } })
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load');
        return res.text();
      })
      .then(function (html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');

        // Update title
        document.title = doc.title;

        // Pull in any new external scripts (js/ai.js, CDN libraries like
        // pdf-lib / qrcodejs) that the fetched page needs but this document
        // doesn't have yet — only <main> scripts re-execute on PJAX swaps,
        // so page-level scripts (end of <body>) and <head> scripts would
        // otherwise never load (e.g. SK_AI undefined -> dead buttons).
        // NOTE: resolve against the fetched page URL explicitly — a
        // DOMParser document's base URL is not reliable for .src resolution.
        // Compare by pathname (ignore ?v= cache-busters) so a version skew
        // never double-loads the same library.
        var needed = doc.querySelectorAll('script[src]');
        var haveScripts = document.querySelectorAll('script[src]');
        for (var hs = 0; hs < needed.length; hs++) {
          var rawSrc = needed[hs].getAttribute('src');
          var needPath;
          try { needPath = new URL(rawSrc, url).pathname; } catch (e) { continue; }
          var found = false;
          for (var hj = 0; hj < haveScripts.length; hj++) {
            try {
              if (new URL(haveScripts[hj].src).pathname === needPath) { found = true; break; }
            } catch (e2) {}
          }
          if (!found) {
            var inj = document.createElement('script');
            inj.src = new URL(rawSrc, url).href;
            document.head.appendChild(inj);
          }
        }

        // Pull in page-specific <style> blocks from the fetched page's
        // <head>. PJAX only swaps <main>, so page-specific CSS (e.g.
        // resume-builder's .rb-step wizard styles) would otherwise be
        // missing and the page renders unstyled/broken. Compare by
        // textContent to avoid duplicates across navigations.
        var needStyles = doc.head ? doc.head.querySelectorAll('style') : [];
        var haveStyles = document.head.querySelectorAll('style');
        for (var st = 0; st < needStyles.length; st++) {
          var css = needStyles[st].textContent;
          if (!css || !css.trim()) continue;
          var dup = false;
          for (var sj = 0; sj < haveStyles.length; sj++) {
            if (haveStyles[sj].textContent === css) { dup = true; break; }
          }
          if (!dup) {
            var nst = document.createElement('style');
            nst.textContent = css;
            nst.setAttribute('data-pjax-style', '1');
            document.head.appendChild(nst);
          }
        }

        // Swap main content
        var newMain = doc.querySelector('main');
        var oldMain = getContainer();        if (newMain && oldMain && oldMain.tagName === 'MAIN') {
          oldMain.innerHTML = newMain.innerHTML;
          // Execute inline scripts (innerHTML doesn't run them)
          var scripts = oldMain.querySelectorAll('script');
          for (var i = 0; i < scripts.length; i++) {
            var s = scripts[i];
            var ns = document.createElement('script');
            if (s.src) { ns.src = s.src; }
            else { ns.textContent = s.textContent; }
            s.parentNode.replaceChild(ns, s);
          }
        } else {
          // Fallback: reload if structure differs
          window.location.href = url;
          return;
        }

        // Update active nav states
        updateNav(url);

        // Scroll to top
        window.scrollTo(0, 0);

        // Update URL BEFORE executing scripts so location.search/location.href
        // reflect the new page when inline scripts run (e.g. ?template= deep links)
        if (pushState !== false) {
          history.pushState({ url: url }, '', url);
        }

        // Re-initialize page scripts (tool functionality)
        reinitializePage();

        document.body.classList.remove('pjax-loading');
        isLoading = false;
      })
      .catch(function () {
        // Fallback to normal navigation on error
        window.location.href = url;
      });
  }

  function updateNav(url) {
    // Update sidebar active states — compare fully-resolved URLs
    // (pathname + search), so hub ?cat= links match exactly.
    var links = document.querySelectorAll('.side-link');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (!href) continue;
      try {
        var resolved = new URL(href, url).href;
        links[i].classList.toggle('active', resolved === url);
      } catch (e) {}
    }
    // Update top-nav section (Tools vs Games) — the header survives swaps,
    // so its active state would otherwise go stale after PJAX navigation.
    var inGames = false;
    try { inGames = new URL(url, window.location.href).pathname.indexOf(SITE_ROOT + 'games/') === 0; } catch (e) {}
    document.querySelectorAll('.top-nav a').forEach(function (a) {
      var isGamesLink = /games/.test(a.getAttribute('href') || '');
      a.classList.toggle('active', inGames ? isGamesLink : !isGamesLink);
    });
  }

  function reinitializePage() {
    // Re-run tool initialization
    // Most tools use DOMContentLoaded which won't fire — trigger manually
    var event = new Event('pjax:load');
    document.dispatchEvent(event);

    // Re-inject music button if needed (it's outside main, so should persist)
    // But ensure it's there
    if (window.AV && window.AV.reinjectMusic) {
      window.AV.reinjectMusic();
    }
  }

  // Intercept clicks
  document.addEventListener('click', function (e) {
    // Respect handlers that already claimed the click (e.g. the games
    // hub sidebar filter, which is in-page and must not ALSO PJAX).
    if (e.defaultPrevented) return;
    var a = e.target.closest('a');
    if (!a || !isInternalLink(a)) return;

    // Allow Ctrl/Cmd+click for new tab
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;

    e.preventDefault();
    loadPage(a.href, true);
  });

  // Handle back/forward buttons
  // Stamp the initial history entry so Back to it carries a state to load —
  // without this, e.state is null on the first entry and Back does nothing.
  try {
    if (!history.state || !history.state.url) {
      history.replaceState({ url: window.location.href }, '', window.location.href);
    }
  } catch (e) {}
  window.addEventListener('popstate', function (e) {
    var url = (e.state && e.state.url) || window.location.href;
    loadPage(url, false);
  });

  // Expose for debugging
  window.AV = window.AV || {};
  window.AV.pjaxLoad = loadPage;
})();
