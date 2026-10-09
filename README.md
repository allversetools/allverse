# SabKuch — Free Online Tools

One website, every daily tool. Static HTML/CSS/JS — no backend, no signup, no build step.

## What's inside

- **Homepage** (`index.html`): hero, live search, all 20 tools grouped by category
- **10 category pages**: image-tools, text-tools, calculators, converters, generators,
  developer-tools, color-tools, date-time, social-media, fun-tools
- **20 tool pages** (2 per category), all working 100% client-side
- **Shared assets**: `css/style.css` (design system), `js/main.js` (sidebar, search,
  scroll-reveal, card tilt, ripple, `window.SK` helpers)

## Preview locally

```bash
cd ~/workspace/sabkuch-website
python3 -m http.server 8000
# open http://localhost:8000
```

(Any static server works. Opening `index.html` directly also works except the
QR generator, which needs its CDN script over http/https.)

## Deploy to GitHub Pages (free)

1. Create a new GitHub repo (e.g. `sabkuch`), **public**.
2. Push this folder's contents to the repo root (so `index.html` is at `/`).
3. Repo → **Settings → Pages** → Source: **Deploy from a branch** →
   Branch: `main`, folder: `/ (root)` → Save.
4. Your site is live at `https://sabkuchtools.github.io/sabkuch/` within a minute or two.

Custom domain (optional): add a `CNAME` file with your domain, then point your
DNS A-records at GitHub Pages IPs (see GitHub docs).

## Notes

- Currency rates in `currency-converter.html` are **static/indicative** — update the
  `RATES` object there periodically, or wire a free API later.
- `qr-generator.html` loads `qrcode@1.5.3` from jsDelivr CDN (only external dep
  besides Google Fonts).
- All other tools run fully offline once loaded.
