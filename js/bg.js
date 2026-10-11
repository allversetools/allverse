/* ============================================================
   AllVerse BG — mouse-reactive ambient background
   Soft drifting gradient orbs on a fixed canvas + mouse parallax.
   Desktop only (hover:hover), honors prefers-reduced-motion,
   pauses when the tab is hidden. Zero dependencies.
   ============================================================ */
(function () {
  'use strict';

  var mq = window.matchMedia || function () { return { matches: false }; };
  var HOVER = mq('(hover: hover)').matches;
  var REDUCED = mq('(prefers-reduced-motion: reduce)').matches;
  if (!HOVER || REDUCED || !window.requestAnimationFrame) return;

  var canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(canvas, document.body.firstChild);
  var ctx = canvas.getContext('2d');

  var W = 0, H = 0;
  function resize() {
    var DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  var orbs = [];
  function seed() {
    // [r,g,b] palettes — soft in light mode, glowing in dark mode
    var cols = isDark()
      ? [[59, 130, 246], [139, 92, 246], [45, 212, 191], [236, 72, 153]]
      : [[147, 197, 253], [196, 181, 253], [153, 246, 228], [253, 213, 170]];
    orbs = cols.map(function (c, i) {
      return {
        c: c,
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.min(W, H) * (0.30 + Math.random() * 0.20),
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        depth: 0.35 + i * 0.25,          // parallax depth per orb
        ph: Math.random() * Math.PI * 2  // breathing phase
      };
    });
  }
  seed();

  // re-seed colours when the theme flips
  if ('MutationObserver' in window) {
    new MutationObserver(seed).observe(document.documentElement,
      { attributes: true, attributeFilter: ['data-theme'] });
  }

  var mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5;
  window.addEventListener('pointermove', function (e) {
    tx = e.clientX / Math.max(W, 1);
    ty = e.clientY / Math.max(H, 1);
  }, { passive: true });

  var running = true;
  document.addEventListener('visibilitychange', function () {
    var was = running;
    running = !document.hidden;
    if (running && !was) requestAnimationFrame(frame);
  });

  var t = 0;
  function frame() {
    if (!running) return;
    t += 0.008;
    // eased mouse follow
    mx += (tx - mx) * 0.045;
    my += (ty - my) * 0.045;

    ctx.clearRect(0, 0, W, H);
    var dark = isDark();
    var alpha = dark ? 0.14 : 0.32;

    for (var i = 0; i < orbs.length; i++) {
      var o = orbs[i];
      o.x += o.vx; o.y += o.vy;
      if (o.x < -o.r) o.x = W + o.r; else if (o.x > W + o.r) o.x = -o.r;
      if (o.y < -o.r) o.y = H + o.r; else if (o.y > H + o.r) o.y = -o.r;

      var px = (mx - 0.5) * 130 * o.depth;
      var py = (my - 0.5) * 130 * o.depth;
      var breathe = 1 + Math.sin(t * 2 + o.ph) * 0.07;
      var rad = o.r * breathe;
      var cx = o.x + px, cy = o.y + py;

      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      g.addColorStop(0, 'rgba(' + o.c[0] + ',' + o.c[1] + ',' + o.c[2] + ',' + alpha + ')');
      g.addColorStop(1, 'rgba(' + o.c[0] + ',' + o.c[1] + ',' + o.c[2] + ',0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
