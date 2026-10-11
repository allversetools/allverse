/* ============================================================
   AllVerse Music — generative ambient background music
   No audio files: warm pad chords synthesized live with WebAudio.
   Toggle button is injected next to every theme switch (all pages,
   no HTML edits needed). Default OFF — browsers require a user
   gesture before any sound. Zero dependencies.
   ============================================================ */
(function () {
  'use strict';

  var ctx = null, master = null;
  var playing = false, timer = null, chordIdx = 0;

  // Warm, slow progression (frequencies in Hz)
  var CHORDS = [
    [87.31, 110.00, 130.81, 164.81, 196.00],  // Fmaj9
    [130.81, 164.81, 196.00, 246.94, 293.66], // Cmaj9
    [110.00, 130.81, 164.81, 246.94, 293.66], // Am9
    [98.00, 123.47, 146.83, 164.81, 220.00]   // G6/9
  ];
  var CHORD_DUR = 9;      // seconds per chord
  var NOTE_PEAK = 0.022;  // per-oscillator peak — stays soft

  function ensureCtx() {
    if (ctx) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();

    master = ctx.createGain();
    master.gain.value = 0.0001;

    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 850;
    filter.Q.value = 0.4;

    // slow "breathing" on the filter cutoff for movement
    var lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    var lfoGain = ctx.createGain();
    lfoGain.gain.value = 220;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    master.connect(filter);
    filter.connect(ctx.destination);
    return true;
  }

  function playChord(freqs) {
    var t0 = ctx.currentTime + 0.05;
    var atk = 3.5, rel = 3.5;
    freqs.forEach(function (f, i) {
      var osc = ctx.createOscillator();
      osc.type = (i % 2) ? 'triangle' : 'sine';
      // root an octave down for warmth
      osc.frequency.value = (i === 0) ? f * 0.5 : f;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(NOTE_PEAK, t0 + atk);
      g.gain.setValueAtTime(NOTE_PEAK, Math.max(t0 + atk, t0 + CHORD_DUR - rel));
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + CHORD_DUR);
      osc.connect(g);
      g.connect(master);
      osc.start(t0);
      osc.stop(t0 + CHORD_DUR + 0.1);
    });
  }

  function sparkle() {
    // occasional soft high note (pentatonic) — the "comfortable" shimmer
    var penta = [523.25, 587.33, 659.25, 783.99, 880.00];
    var f = penta[Math.floor(Math.random() * penta.length)];
    var t0 = ctx.currentTime + 0.05;
    var osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.016, t0 + 1.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 4.5);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + 4.7);
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
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0.55, ctx.currentTime, 1.4);
    playChord(CHORDS[chordIdx % CHORDS.length]);
    timer = setInterval(function () {
      chordIdx++;
      playChord(CHORDS[chordIdx % CHORDS.length]);
      if (Math.random() < 0.55) sparkle();
    }, CHORD_DUR * 1000 - 2600); // overlap => seamless crossfade
    setButtons(true);
  }

  function stop() {
    playing = false;
    if (timer) { clearInterval(timer); timer = null; }
    if (ctx) {
      master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.7);
      setTimeout(function () { if (!playing && ctx && ctx.state === 'running') ctx.suspend(); }, 2400);
    }
    setButtons(false);
  }

  function toggle() { if (playing) stop(); else start(); }

  /* Inject the toggle next to every theme switch — works on all pages */
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
        '<svg class="mq-note" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>' +
        '<span class="mq-bars" aria-hidden="true"><span></span><span></span><span></span></span>';
      wrap.insertAdjacentElement('afterend', btn);
      btn.addEventListener('click', toggle);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
