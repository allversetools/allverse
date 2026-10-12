/* ============================================================
   AllVerse helpers — head-safe global utilities (vanilla JS)
   Loaded in <head> on every page so tool scripts inside <main>
   can use them at parse time (before js/main.js runs).
   No DOM access at load; no libraries.
   ============================================================ */
(function () {
  'use strict';

  /* Shared numeric input reader — use for EVERY numeric <input> on every tool.
     Strips thousand-separator commas and spaces ("1,000" -> 1000), handles
     empty/negative/decimal input safely. Returns null when not a number,
     or `def` when provided (e.g. skNum('x', 0)). */
  if (typeof window.skNum === 'undefined') {
    window.skNum = function (el, def) {
      var raw;
      if (typeof el === 'string') {
        var node = document.getElementById(el);
        raw = node ? node.value : el; /* id lookup, else treat as raw value */
      } else if (el && typeof el.value !== 'undefined') {
        raw = el.value;
      } else {
        return (def === undefined ? null : def);
      }
      var v = parseFloat(String(raw).replace(/[,\s ]/g, ''));
      if (isNaN(v)) return (def === undefined ? null : def);
      return v;
    };
  }

  if (typeof window.SK === 'undefined') {
    window.SK = {};
  }
  if (typeof window.SK.copy !== 'function') {
    window.SK.copy = function (text) {
      text = String(text == null ? '' : text);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(
          function () { return true; },
          function () { return fallbackCopy(text); }
        );
      }
      return Promise.resolve(fallbackCopy(text));
    };
  }
  if (typeof window.SK.download !== 'function') {
    window.SK.download = function (url, filename) {
      var a = document.createElement('a');
      a.href = url;
      if (filename) a.setAttribute('download', filename);
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { a.remove(); }, 100);
    };
  }
  if (typeof window.SK.toast !== 'function') {
    window.SK.toast = function (msg) {
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
    };
  }

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
})();
