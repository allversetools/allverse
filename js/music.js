/* ============================================================
   AllVerse Music — background MP3 (reliable, no glitches)
   Simple HTML5 audio loop. Toggle button with animation.
   ============================================================ */
(function () {
  'use strict';

  var audio = null;
  var playing = false;

  function ensureAudio() {
    if (audio) return true;
    audio = new Audio('audio/pro-relax.mp3?v=1');
    audio.loop = true;
    audio.volume = 0.5;
    audio.preload = 'auto';
    return true;
  }

  function saveState(on) {
    try { localStorage.setItem('av_music_on', on ? '1' : '0'); } catch (e) {}
  }
  function wasOn() {
    try { return localStorage.getItem('av_music_on') === '1'; } catch (e) { return false; }
  }

  function setButtons(on) {
    var btns = document.querySelectorAll('.music-toggle');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('playing', on);
      btns[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function start() {
    if (!ensureAudio()) return;
    playing = true;
    saveState(true);
    // 2s fade in
    audio.volume = 0;
    var fadeIn = setInterval(function () {
      if (!playing) { clearInterval(fadeIn); return; }
      audio.volume = Math.min(0.5, audio.volume + 0.025);
      if (audio.volume >= 0.5) clearInterval(fadeIn);
    }, 100);
    audio.play().then(function () {
      setButtons(true);
    }).catch(function () {
      // Blocked — wait for user gesture
      playing = false;
      setButtons(false);
    });
  }

  function stop() {
    if (!audio) { playing = false; setButtons(false); saveState(false); return; }
    playing = false;
    saveState(false);
    // 2s fade out
    var fadeOut = setInterval(function () {
      audio.volume = Math.max(0, audio.volume - 0.025);
      if (audio.volume <= 0) {
        clearInterval(fadeOut);
        audio.pause();
      }
    }, 100);
    setButtons(false);
  }

  function toggle() { if (playing) stop(); else start(); }

  function inject() {
    var wraps = document.querySelectorAll('.theme-switch-wrap');
    for (var i = 0; i < wraps.length; i++) {
      var wrap = wraps[i];
      if (wrap.parentNode.querySelector(':scope > .music-toggle')) continue;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'music-toggle';
      btn.title = 'Background music on / off';
      btn.setAttribute('aria-label', 'Toggle background music');
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML =
        '<span class="mq-ring" aria-hidden="true"></span>' +
        '<svg class="mq-note" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>' +
        '<path d="M20 3v10.55A4 4 0 1 0 22 17V7h-2V3h0z" opacity=".35"/></svg>' +
        '<span class="mq-bars" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></span>';
      wrap.insertAdjacentElement('afterend', btn);
      btn.addEventListener('click', toggle);
    }
  }

  function init() {
    inject();
    setButtons(false);
    // Pause on tab hide, resume on show
    var wasPlaying = false;
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (playing) { wasPlaying = true; stop(); saveState(true); }
      } else {
        if (wasPlaying && !playing) { wasPlaying = false; start(); }
      }
    });
    // AUTO-PLAY for everyone: try on load, else start on first interaction
    var autoPlayDone = false;
    var tryAutoPlay = function () {
      if (autoPlayDone || playing) return;
      autoPlayDone = true;
      // Try immediate play (works if browser allows)
      if (ensureAudio()) {
        audio.play().then(function () {
          playing = true;
          saveState(true);
          setButtons(true);
        }).catch(function () {
          // Blocked by browser policy — start on FIRST click/tap/key anywhere
          autoPlayDone = false;
          var unlock = function () {
            if (playing) return;
            autoPlayDone = true;
            start();
            ['pointerdown', 'touchstart', 'keydown', 'click'].forEach(function (ev) {
              document.removeEventListener(ev, unlock);
            });
          };
          ['pointerdown', 'touchstart', 'keydown', 'click'].forEach(function (ev) {
            document.addEventListener(ev, unlock, { passive: true });
          });
        });
      }
    };
    // Try autoplay shortly after page load
    setTimeout(tryAutoPlay, 800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
