/* ============================================================
   AllVerse Music — pleasant lo-fi background music (WebAudio)
   Composed piece: warm pads + clear melody + soft bass.
   Toggle button injected next to theme switch. Default OFF.
   ============================================================ */
(function () {
  'use strict';

  var ctx = null, master = null, musicGain = null;
  var playing = false, timers = [];

  // C major — pleasant, uplifting progression
  var CHORDS = [
    [261.63, 329.63, 392.00, 523.25],  // C
    [220.00, 261.63, 329.63, 493.88],  // Am
    [174.61, 220.00, 261.63, 440.00],  // F
    [196.00, 246.94, 293.66, 493.88],  // G
  ];
  // Simple, memorable melody (C major pentatonic)
  var MELODY = [523.25, 587.33, 659.25, 784.00, 659.25, 587.33, 523.25, 440.00,
                523.25, 659.25, 784.00, 880.00, 784.00, 659.25, 587.33, 523.25];
  var BASS = [130.81, 110.00, 87.31, 98.00]; // C, A, F, G (one octave down feel)

  function ensureCtx() {
    if (ctx) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9; // LOUDER — clearly audible
    var comp = ctx.createDynamicsCompressor();
    master.connect(comp);
    comp.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.0001;
    musicGain.connect(master);
    return true;
  }

  function note(freq, t0, dur, vol, type) {
    var osc = ctx.createOscillator();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(musicGain);
    osc.start(t0); osc.stop(t0 + dur + 0.1);
  }

  function playBar(barIdx) {
    if (!playing) return;
    var t0 = ctx.currentTime + 0.05;
    var chord = CHORDS[barIdx % CHORDS.length];
    var bassN = BASS[barIdx % BASS.length];
    // Pad chord (soft, warm)
    chord.forEach(function (f) { note(f, t0, 3.8, 0.06, 'triangle'); });
    // Bass (gentle)
    note(bassN, t0, 3.5, 0.09, 'sine');
    note(bassN * 2, t0 + 1.9, 1.6, 0.05, 'sine');
    // Melody (clear, pleasant — 4 notes per bar)
    for (var i = 0; i < 4; i++) {
      var mf = MELODY[(barIdx * 4 + i) % MELODY.length];
      note(mf, t0 + i * 0.95, 0.9, 0.11, 'sine');
      note(mf * 2, t0 + i * 0.95, 0.5, 0.025, 'triangle'); // shimmer octave
    }
    // Schedule next bar (4 seconds per bar)
    timers.push(setTimeout(function () { playBar(barIdx + 1); }, 3950));
  }

  function setButtons(on) {
    var btns = document.querySelectorAll('.music-toggle');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('playing', on);
      btns[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function start() {
    if (!ensureCtx()) return;
    if (ctx.state === 'suspended') ctx.resume();
    playing = true;
    musicGain.gain.cancelScheduledValues(ctx.currentTime);
    musicGain.gain.setTargetAtTime(0.85, ctx.currentTime, 0.8); // fade in
    playBar(0);
    setButtons(true);
  }

  function stop() {
    playing = false;
    timers.forEach(clearTimeout); timers = [];
    if (ctx) {
      musicGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4);
      setTimeout(function () { if (!playing && ctx.state === 'running') ctx.suspend(); }, 1500);
    }
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

  function initAutoplay() {
    inject();
    // Autoplay: browsers require a user gesture — start on first interaction
    var started = false;
    function tryStart() {
      if (started || playing) return;
      started = true;
      start();
      ['click', 'touchstart', 'keydown', 'scroll'].forEach(function (ev) {
        document.removeEventListener(ev, tryStart);
      });
    }
    ['click', 'touchstart', 'keydown', 'scroll'].forEach(function (ev) {
      document.addEventListener(ev, tryStart, { passive: true });
    });
    // Also try immediate (works if browser allows)
    try { start(); started = true; } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoplay);
  } else { initAutoplay(); }
})();
