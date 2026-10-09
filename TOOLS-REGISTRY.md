# SabKuch — Tools Registry

Every page lives at the repo root. Add a tool = add 1 file + 1 card.

## Categories (10)

| File | Label |
|---|---|
| image-tools.html | Image Tools |
| text-tools.html | Text Tools |
| calculators.html | Calculators |
| converters.html | Converters |
| generators.html | Generators |
| developer-tools.html | Developer Tools |
| color-tools.html | Color Tools |
| date-time.html | Date & Time |
| social-media.html | Social Media |
| fun-tools.html | Fun Tools |

## Tools (22)

| File | Category page | Back link target |
|---|---|---|
| image-resizer.html | image-tools.html | image-tools.html |
| image-compressor.html | image-tools.html | image-tools.html |
| youtube-thumbnail-resizer.html | image-tools.html | image-tools.html |
| word-counter.html | text-tools.html | text-tools.html |
| case-converter.html | text-tools.html | text-tools.html |
| bmi-calculator.html | calculators.html | calculators.html |
| age-calculator.html | calculators.html | calculators.html |
| unit-converter.html | converters.html | converters.html |
| currency-converter.html | converters.html | converters.html |
| password-generator.html | generators.html | generators.html |
| qr-generator.html | generators.html | generators.html |
| whatsapp-link-generator.html | generators.html | generators.html |
| json-formatter.html | developer-tools.html | developer-tools.html |
| color-picker.html | developer-tools.html | developer-tools.html |
| palette-generator.html | color-tools.html | color-tools.html |
| contrast-checker.html | color-tools.html | color-tools.html |
| countdown-timer.html | date-time.html | date-time.html |
| date-difference.html | date-time.html | date-time.html |
| hashtag-generator.html | social-media.html | social-media.html |
| bio-maker.html | social-media.html | social-media.html |
| random-picker.html | fun-tools.html | fun-tools.html |
| dice-roller.html | fun-tools.html | fun-tools.html |

## How to add a new tool (5 minutes)

1. **Copy** any existing tool page in the same category (e.g. `word-counter.html`
   → `my-tool.html`).
2. **Edit**: `<title>`, `<meta name="description">`, the sidebar `active` class
   (keep it on the tool's category), the `back-link` href/text, `<h1>`,
   `.tool-desc`, and the `.tool-panel` UI + bottom `<script>`.
3. **Register the card** in two places (copy an existing card block):
   - `index.html` — inside the right `.cat-section` → `.tool-grid`
   - `<category>.html` — inside its `.tool-grid`
   
   Card template:
   ```html
   <a class="tool-card tilt reveal" data-name="my tool keywords for search" href="my-tool.html"><span class="card-icon">[svg]</span><h3>My Tool</h3><p>One-line description</p></a>
   ```
4. **New category?** Create `<slug>.html` (copy any category page), add its
   `side-link` to the sidebar `<nav>` in **every** page (search-replace the nav
   block), and add a `.cat-section` on `index.html`.

## Shared contracts (don't break these)

- CSS classes: `.site-header .logo .search-input#siteSearch .menu-toggle#menuToggle
  .layout .sidebar#sidebar .side-link(.active) .main .hero .tool-grid .tool-card.tilt
  .page-head .tool-wrap .back-link .tool-panel .field .btn(.btn-primary/.btn-ghost)
  .result-panel .site-footer .reveal`
- JS: `js/main.js` wires `#menuToggle`, `#siteSearch` (filters `.tool-card` by
  `data-name`), `.reveal`, `.tilt`, `.btn` ripples; exposes `window.SK.copy(text)`
  and `window.SK.download(url, filename)`.
- Keep page scripts null-guarded and IIFE/function scoped.
