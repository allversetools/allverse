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

  function isInternalLink(a) {
    if (!a || !a.href) return false;
    if (a.target === '_blank') return false;
    if (a.hasAttribute('download')) return false;
    var url = new URL(a.href, window.location.origin);
    // Same origin, HTML page
    if (url.origin !== window.location.origin) return false;
    if (!url.pathname.endsWith('.html') && url.pathname !== '/') return false;
    // Skip hash-only navigation on same page
    if (url.pathname === window.location.pathname && url.hash) return false;
    return true;
  }

  function loadPage(url, pushState) {
    if (isLoading) return;
    isLoading = true;

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

        // Pull in any new external <head> scripts (CDN libraries like
        // pdf-lib / qrcodejs) that the fetched page needs but this document
        // doesn't have yet — <head> never re-executes on PJAX swaps.
        var needed = doc.querySelectorAll('head script[src]');
        for (var hs = 0; hs < needed.length; hs++) {
          var needSrc = needed[hs].src;
          var found = false;
          var have = document.querySelectorAll('script[src]');
          for (var hj = 0; hj < have.length; hj++) {
            if (have[hj].src === needSrc) { found = true; break; }
          }
          if (!found) {
            var inj = document.createElement('script');
            inj.src = needSrc;
            document.head.appendChild(inj);
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
    // Update sidebar active states
    var links = document.querySelectorAll('.side-link');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (href && url.endsWith(href)) {
        links[i].classList.add('active');
      } else {
        links[i].classList.remove('active');
      }
    }
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
