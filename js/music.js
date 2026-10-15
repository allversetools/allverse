/* ============================================================
   AllVerse Music — background MP3 (reliable, no glitches)
   Simple HTML5 audio loop. Toggle button with animation.
   - Audio URL is SITE-ROOT ABSOLUTE so it works from any depth
     (/games/<game>/ pages used to 404 on the relative path).
   - Playback POSITION is persisted (localStorage) so music RESUMES
     where it left off across full page loads — it never restarts
     from the beginning when you switch tools/games/categories.
   - SINGLE audio instance, SINGLE play path (start()), SINGLE fade
     controller (fadeTimer). start()/stop() always cancel any
     in-flight fade first, so rapid toggles, tab-hide/show spam and
     autoplay-unlock can never stack competing fade intervals that
     fight over volume / pause() — that overlap was the stutter +
     button-says-playing-while-paused desync.
   - OFF-BUG FIX (2026-10-15): OFF used to only start a 2s fade-out
     while THREE separate auto-paths could restart playback behind
     the user's back — (1) the 800ms tryAutoPlay timer fired
     unconditionally after any full page load, even if the user had
     just pressed OFF; (2) the first-gesture unlock listener fired
     start() on any later click/keydown; (3) stop() never invalidated
     an in-flight play() promise. Net effect: button showed OFF while
     music kept playing. Now: OFF pauses SYNCHRONOUSLY (no fade-out
     tail), bumps playSeq so stale play() promises are ignored, and
     records an explicit 'off' choice that tryAutoPlay, unlock and
     tab-return resume all refuse to override. Tab-hide auto-pause
     is NOT a user OFF (stop(false)) so resume-on-return still works.
   - BANDWIDTH FIX (2026-10-15): preload='auto' downloaded the full
     3.7MB MP3 on EVERY page load even when autoplay was blocked and
     the user never wanted music. Now preload='none': zero bytes
     until playback is actually wanted.
   - SINGLE-INSTANCE GUARD: if this file ever executes twice (PJAX
     re-inject, stale SW copy, double tag), the second copy returns
     immediately instead of creating a second Audio that OFF could
     never silence.
   ============================================================ */
(function () {
  'use strict';

  /* Second execution of this file must be a no-op: one Audio ever. */
  if (window.__AV_MUSIC_LOADED) return;
  window.__AV_MUSIC_LOADED = true;

  var SITE_ROOT = '/allverse/';
  var TARGET_VOLUME = 0.5;
  var audio = null;
  var playing = false;
  var lastSavedPos = -1;
  /* The ONE fade interval. Every fade goes through fadeTo(), which
     clears the previous interval first — at most one fade ever runs. */
  var fadeTimer = null;
  /* Guards start()'s async play() against a newer start()/stop() that
     already superseded it (rapid toggles while play() is pending). */
  var playSeq = 0;
  var unlockArmed = false;

  function ensureAudio() {
    if (audio) return true;
    audio = new Audio(SITE_ROOT + 'audio/user-music.mp3?v=1');
    audio.loop = true;
    audio.volume = 0.5;
    /* NEVER pre-download the 3.7MB file: fetch only when playback is
       actually wanted (start() -> play()). */
    audio.preload = 'none';
    // Resume position: if music was playing when the last page unloaded,
    // seek back to that spot as soon as metadata is available.
    audio.addEventListener('loadedmetadata', function () {
      if (!wasOn()) return;
      seekToSaved();
    });
    // Persist position every ~5s while playing (throttled timeupdate).
    audio.addEventListener('timeupdate', function () {
      if (!playing) return;
      var t = Math.floor(audio.currentTime || 0);
      if (t !== lastSavedPos && t % 5 === 0) { lastSavedPos = t; savePos(); }
    });
    /* Honesty guard: if the element ever pauses behind our back
       (browser interruption, OS), the button must show OFF too —
       button state must always match real playback state. */
    audio.addEventListener('pause', function () {
      if (playing) { playing = false; setButtons(false); }
    });
    return true;
  }

  function saveState(on) {
    try { localStorage.setItem('av_music_on', on ? '1' : '0'); } catch (e) {}
  }
  function wasOn() {
    try { return localStorage.getItem('av_music_on') === '1'; } catch (e) { return false; }
  }
  /* Explicit user choice: 'on' | 'off' | null (never chose). Falls back
     to the legacy av_music_on flag so an OFF from an older build still
     sticks after this update. */
  function choice() {
    try {
      var c = localStorage.getItem('av_music_choice');
      if (c === 'on' || c === 'off') return c;
      var legacy = localStorage.getItem('av_music_on');
      if (legacy === '0') return 'off';
      if (legacy === '1') return 'on';
    } catch (e) {}
    return null;
  }
  function setChoice(v) {
    try { localStorage.setItem('av_music_choice', v); } catch (e) {}
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

  /* THE single resume-seek path: loadedmetadata handler + start() both
     call this, nothing seeks anywhere else. */
  function seekToSaved() {
    if (!audio) return;
    var p = savedPos();
    if (p > 0 && isFinite(audio.duration) && p < audio.duration - 3) {
      try { audio.currentTime = p; } catch (e) {}
    }
  }

  function setButtons(on) {
    var btns = document.querySelectorAll('.music-toggle');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('playing', on);
      btns[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function clearFade() {
    if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
  }

  /* Ramp volume to target (0.5 = full, 0 = silent). Cancels any
     in-flight fade first. Reaching 0 pauses the audio exactly once.
     Used for fade-IN only now: OFF pauses synchronously (see stop). */
  function fadeTo(target) {
    clearFade();
    if (!audio) return;
    fadeTimer = setInterval(function () {
      if (target > audio.volume) {
        audio.volume = Math.min(target, audio.volume + 0.025);
        if (audio.volume >= target) clearFade();
      } else {
        audio.volume = Math.max(target, audio.volume - 0.025);
        if (audio.volume <= target) {
          clearFade();
          if (target === 0) audio.pause();
        }
      }
    }, 100);
  }

  /* THE single play path. Returns Promise<boolean> (true = playing).
     Rejects nothing — a blocked play resolves false so callers can
     arm the first-gesture unlock. */
  function start() {
    if (!ensureAudio()) return Promise.resolve(false);
    if (playing && audio && !audio.paused) { fadeTo(TARGET_VOLUME); return Promise.resolve(true); }
    var mySeq = ++playSeq;
    playing = true;
    saveState(true);
    setChoice('on');
    seekToSaved();
    // 2s fade in
    audio.volume = 0;
    fadeTo(TARGET_VOLUME);
    return audio.play().then(function () {
      if (mySeq === playSeq && playing) setButtons(true);
      return true;
    }).catch(function () {
      // Blocked (autoplay policy) — stop the fade, reset state.
      // Ignore if a newer start()/stop() already superseded this call.
      if (mySeq === playSeq) {
        clearFade();
        playing = false;
        setButtons(false);
      }
      return false;
    });
  }

  /* THE single stop path.
     userInitiated=true  = user pressed OFF: record explicit 'off'
       choice (no auto-path may ever restart) + pause SYNCHRONOUSLY.
     userInitiated=false = internal auto-pause (tab hide): choice
       untouched so resume-on-return still works. */
  function stop(userInitiated) {
    /* Invalidate any in-flight play() promise: a stale resolve/reject
       from an older start() must never touch state again. */
    ++playSeq;
    clearFade();
    playing = false;
    saveState(false);
    if (userInitiated) setChoice('off');
    savePos();
    setButtons(false);
    /* OFF means silent NOW: pause synchronously + drop volume to 0
       (belt and braces — even if pause() threw, volume 0 = silent). */
    if (audio) {
      try { audio.pause(); } catch (e) {}
      try { audio.volume = 0; } catch (e) {}
    }
  }

  function toggle() { if (playing) stop(true); else start(); }

  /* Start on the FIRST user gesture if autoplay was blocked. Armed at
     most once; the handler disarms itself before calling start().
     NEVER arms after an explicit user OFF. */
  function armUnlock() {
    if (unlockArmed) return;
    if (choice() === 'off') return;
    unlockArmed = true;
    var unlock = function () {
      disarm();
      if (!playing && choice() !== 'off') start();
    };
    function disarm() {
      unlockArmed = false;
      ['pointerdown', 'touchstart', 'keydown', 'click'].forEach(function (ev) {
        document.removeEventListener(ev, unlock);
      });
    }
    ['pointerdown', 'touchstart', 'keydown', 'click'].forEach(function (ev) {
      document.addEventListener(ev, unlock, { passive: true });
    });
  }

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

  /* PJAX calls this after swaps (it used to reference a missing
     AV.reinjectMusic — now real, and idempotent). */
  window.AV = window.AV || {};
  window.AV.reinjectMusic = inject;

  function init() {
    inject();
    setButtons(false);
    // Persist position when leaving the page (full loads: game pages, etc.)
    window.addEventListener('pagehide', savePos);
    window.addEventListener('beforeunload', savePos);
    // Pause on tab hide, resume on show (auto-pause, NOT user OFF)
    var wasPlaying = false;
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (playing) { wasPlaying = true; stop(false); saveState(true); }
      } else {
        if (wasPlaying && !playing && choice() !== 'off') {
          wasPlaying = false;
          start().then(function (ok) { if (!ok) armUnlock(); });
        }
      }
    });
    // AUTO-PLAY for everyone who never explicitly turned it OFF:
    // try on load, else start on first interaction.
    // ONE play path: tryAutoPlay goes through start(), never a direct
    // audio.play() that would bypass fade/seek/state.
    var tryAutoPlay = function () {
      if (playing) return;
      /* Explicit user OFF is permanent: NEVER auto-restart — not on
         full page loads, not on tab return, not on any later click. */
      if (choice() === 'off') return;
      start().then(function (ok) { if (!ok) armUnlock(); });
    };
    // Try autoplay shortly after page load
    setTimeout(tryAutoPlay, 800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
