# AllVerse Hourly Design Improvements — Gemini consultation (2026-10-10 night)

Source: Google Gemini text consultation on the AllVerse homepage screenshot,
with lusion.co's design formula as the quality bar.
User instruction: implement ONE item per hour, 6 hours total, overnight.

Guidance for implementer: each item is a tasteful refinement, not a redesign.
Keep AllVerse identity, keep light + dark modes both working, keep the sidebar,
search, smart-paste and tool cards functional, keep mobile responsive, keep it
fast (CSS-only motion, no heavy libraries). Never break tool functionality.

- [x] 1. Strict monochrome foundation + one electric accent — Tighten the palette toward disciplined neutrals (crisp bone-white light mode, deep charcoal dark mode) and reserve ONE electric accent color strictly for interactive states (hovers, active filters, focus rings, CTAs). Remove scattered soft tints so the accent feels intentional. [done 2026-10-10, run 1: accent #2563eb light / #6b9bff dark; neutral icon tiles, removed sage/pink/purple/yellow tints; verified live]
- [x] 2. Mono micro-labels + massive display type — Add a crisp monospace font for micro-labels (eyebrow "FREE • ONLINE • NO LOGIN", Ctrl+K hint, stat pills, sidebar counts) and scale the hero headline up to a commanding, ultra-tight display size.
- [x] 3. Replace emoji card icons with monoline SVG glyphs — Swap emojis in tool cards for uniform thin-stroke SVG icons in subtly tinted tiles, consistent across all cards. [done 2026-10-10, run 3: 41-symbol inline sprite, 52 homepage tool-card icons swapped (stroke-width 2, currentColor, 26px — matches sidebar/category icon style); also cleaned 510 corrupted run-2 CSS blobs, consolidated .micro-label/.hero-h1, bumped SW cache v1→v2 so visitors get fresh HTML; verified live via cache-busted fresh load]
- [x] 4. Hairline borders + grid discipline — Replace chunky shadows with 1px hairline borders that lock sidebar, search, and cards into a precise grid; sharper, more architectural feel. [done 2026-10-10, run 4: final override block — cards flat + 12px radius, hover = accent hairline only (no lift/glass/tilt/glare), sidebar right hairline (drawer shadow gone), search 1px border, tool-panel shadow removed; tilt JS left untouched (only sets unused CSS vars); SW cache v2→v3; visual-verified live light mode]
- [ ] 5. Smart-paste card → command-bar terminal — Restyle the paste box as a sleek command-palette input: single hairline border, mono status text, blinking caret, power-user feel.
- [ ] 6. Dot-expansion + sliding-arrow micro-interactions — Hover on buttons/category rows triggers a small dot expanding into a pill fill, and "View all →" arrows slide in smoothly via CSS transitions. One easing curve everywhere.
- [ ] 7. Sidebar → architectural index — Condense the 33-category sidebar: tiny mono counts right-aligned, hairline row dividers, active state via accent bar/opacity instead of heavy fills.
- [ ] 8. Staggered masked text reveals on load — CSS keyframe entrance: hero headline words slide up through overflow:hidden masks with staggered delays; sections fade/slide on scroll.
