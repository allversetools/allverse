# Gemini UX Recommendations — AllVerse tools polish (2026-10-11 morning)

Source: Google Gemini text consultation (user's complaints: no loading animation on AI tools;
story text invisible in dark mode; fix ALL tools with precision, small + big issues).

## A. Loading/Processing States (all async tools)
- Pattern: shimmer skeleton loader + staged status text for long AI waits (10-60s);
  clean CSS spinner inside button for quick computations.
- Reusable component: div#loading-state.loading-container with .shimmer-line divs +
  p#status-message.status-text. CSS: linear-gradient(90deg, var(--soft) 25%, var(--border) 50%,
  var(--soft) 75%); background-size 200% 100%; shimmer 1.5s infinite. MUST use theme vars.
- Staged messages via timed array: 0s "Soch raha hai…", 5s "Content ko structure kiya ja raha hai…",
  15s "Final touches diye ja rahe hain…".
- setBusy(btn,bool): disable + reduce opacity + inline SVG spinner next to label
  ("Processing… / Kaam chal raha hai…"). Success: hide loader, typeInto(). Error: showError
  with distinct red error border.

## B. Theme-visibility audit
- Grep anti-patterns: style="[^"]*(color|background...  ; background:\s*#(f|e|d|c|b|a) ;
  color:\s*#(0|1|2|3|4|5) ; legacy #fff / #f8fafc hardcoded.
- Fix pattern: .result-panel { background-color: var(--card); color: var(--ink);
  border: 1px solid var(--border); } — no fixed hex.
- Audit all cards, badges, modals, text wrappers; replace with var(--bg)/var(--card)/var(--soft)/var(--ink).
- Verify: toggle dark mode on sample AI/image/calculator results; contrast must pass WCAG AA.

## C. Small-details checklist (apply everywhere)
1. Auto-scroll: resultPanel.scrollIntoView({behavior:'smooth', block:'nearest'}) when generation starts.
2. Copy feedback: label → "Copied! / Copy ho gaya! ✓" for 2s, then revert.
3. Empty-input validation: if (!input.value.trim()) → red shake animation or hint ("Kuch toh likho!"); never fire API.
4. Tap targets ≥44px height; visible focus ring (outline/box-shadow) on all interactive controls.

## D. Big-picture
- Centralize: expand SK_AI helper to auto-handle skeleton injection, error wrappers globally.
- Unify result panels via shared CSS (single .result-panel system, no per-page hacks).
- @media print: print only inputs + results. @media (prefers-reduced-motion: reduce): disable shimmer/typing.
