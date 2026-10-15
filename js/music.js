/* ============================================================
   AllVerse Music — background MP3 (reliable, no glitches)
   Simple HTML5 audio loop. Toggle button with animation.
   - Audio URL is SITE-ROOT ABSOLUTE so it works from any depth
     (/games/<game>/ pages used to 404 on the relative path).
   - Playback POSITION is persisted (localStorage) so music RESUMES
     where it left off across full page loads — it never restarts
     from the beginning when you switch tools/games/categories.
   ============================================================ */
(function () {
  'use strict';

  var SITE_ROOT = '/allverse/';
  var audio = null;
  var playing = false;
  var lastSavedPos = -1;

  function ensureAudio() {
    if (audio) return true;
    audio = new Audio(SITE_ROOT + 'audio/user-music.mp3?v=1');
    audio.loop = true;
    audio.volume = 0.5;
    audio.preload = 'auto';
    // Resume position: if music was playing when the last page unloaded,
    // seek back to that spot as soon as metadata is available.
    audio.addEventListener('loadedmetadata', function () {
      if (!wasOn()) return;
      var p = savedPos();
      if (p > 0 && isFinite(audio.duration) && p < audio.duration - 3) {
        try { audio.currentTime = p; } catch (e) {}
      }
    });
    // Persist position every ~5s while playing (throttled timeupdate).
    audio.addEventListener('timeupdate', function () {
      if (!playing) return;
      var t = Math.floor(audio.currentTime || 0);
      if (t !== lastSavedPos && t % 5 === 0) { lastSavedPos = t; savePos(); }
    });
    return true;
  }

  function saveState(on) {
    try { localStorage.setItem('av_music_on', on ? '1' : '0'); } catch (e) {}
  }
  function wasOn() {
    try { return localStorage.getItem('av_music_on') === '1'; } catch (e) { return false; }
  }
  function savedPos() {
    try {
      var v = parseFloat(localStorage.getItem('av_music_pos'));
      return (isFinite(v) && v > 0) ? v : 0;
    } catch (e) { return 0; }
  }
  function savePos() {
    try {
      if (audio && isFinite(audio.currentTime)) {
        localStorage.setItem('av_music_pos', String(Math.floor(audio.currentTime)));
      }
    } catch (e) {}
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
    // If metadata is already loaded and we have a saved spot, seek now
    // (loadedmetadata handler covers the not-yet-loaded case).
    if (audio.readyState >= 1) {
      var p = savedPos();
      if (p > 0 && isFinite(audio.duration) && p < audio.duration - 3) {
        try { audio.currentTime = p; } catch (e) {}
      }
    }
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
    savePos(); /* remember where we stopped so resume is seamless */
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
    // Persist position when leaving the page (full loads: game pages, etc.)
    window.addEventListener('pagehide', savePos);
    window.addEventListener('beforeunload', savePos);
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
