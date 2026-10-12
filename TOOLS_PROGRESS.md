# AllVerse Tools — Live Verification Report

**Site:** https://allversetools.github.io/allverse/
**Total tools:** 131 (authoritative count — see TOOL_COUNT_RECONCILIATION.md)
**Round:** 2026-10-11 → 2026-10-12
**Rule applied honestly:** a tool is marked **"Live verified"** only after real browser
input/output testing. Everything else is **"Code only (unverified)"** — no matter how
clean the code looks.

## Status legend
- ✅ **Live verified** — tested in a real browser with real inputs; output confirmed.
- ⬜ **Code only (unverified)** — not live-tested this round. (A static code audit on
  2026-10-11 found valid JS, wired buttons and no placeholder/fake signals in 131/131,
  but that is NOT a functionality guarantee.)
- 🟧 **Code only (fix deployed, unverified)** — a fix is live in the code but the
  end-to-end browser test could not complete for external reasons.

**Console honesty note:** the browser automation used cannot open DevTools directly,
so reports say "no visible errors observed" — never "zero console errors".

## Summary
- ✅ Live verified: **22**
- 🟧 Code only (fix deployed, unverified): **1** (AI Story Writer — backend quota)
- ⬜ Code only (unverified): **108**
- **Total: 131**

## The 4 confirmations requested
1. **Tool count 131 everywhere:** meta description, og:description, twitter:description,
   hero text, footer, llms.txt — all say 131. Repo-wide sweep finds no remaining
   "130 tools"/"134 tools" claims. (134 was a stale number in llms.txt; 130 was stale
   homepage copy; both fixed and pushed 2026-10-12.)
2. **No homepage link points to a missing page:** all 166 links on index.html resolve
   to existing files — zero 404s. (Verified 2026-10-12.)
3. **Merge/Split/Images-to-PDF outputs opened and checked:** all three downloaded PDFs
   opened with a real PDF parser (pypdf) — Split = exactly 2 pages, Images-to-PDF =
   exactly 3 pages, Merge = exactly 10 pages (5+5); every page has content; producer
   pdf-lib. Source was a real 5-page PDF. (Verified 2026-10-12.)
4. **JSON Formatter tested:** valid JSON → correct 2-space formatting; invalid
   `{"name":}` → clear unexpected-token error; empty input → "Input is empty" message.
   (Live browser test 2026-10-12.)

## Bugs found and fixed this round
| Bug | Fix | Commit |
|-----|-----|--------|
| QR Generator produced no QR (wrong CDN bundle with `require()`) | Switched to qrcodejs@1.0.0 (browser build, `window.QRCode`); rewrote generate() | f8d0a90 |
| AI Chat hung forever on on-device AI | 20s timeout → cloud fallback; fixed retry-button state bug; English-only messages | d2aa2f2, 528307b |
| AI text requests had no timeout (Paraphraser/Summarizer hung with no error) | 60s fetch timeout (AbortController) in js/ai.js; `SK_AI.deviceOrCloud` helper (20s on-device timeout + cloud fallback) used by Summarizer + Translator; same pattern in Paraphraser | 99207d3, 0bfe112 |
| AI image tools hung on stalled requests | 90s timeout + clear error + retry on image generator, logo maker, wallpaper maker, thumbnail maker | 528307b, 99207d3 |
| Story Writer leaked raw JSON reasoning | Strict system prompt + JSON detection with one automatic clean retry + "wrong format" error path | 074d297 |
| Translator returned empty output silently | Empty-result detection → cloud fallback → clear error + retry | 074d297 |
| Bilingual (Roman Urdu/English) UI strings | All user-visible AI messages, loading states, retry buttons → English-only | 528307b, 99207d3 |
| Raw `pollinations:402` quota error shown to users | Friendly message: "The free AI service hit its usage limit. Please wait a minute and try again." | 074d297 |
| Browsers cached old js/ai.js after fixes | Cache-buster bumped to `?v=js28` across 80 pages | 397579e, 074d297 |
| Dead LLM7 code with exposed API key | Removed entirely; all AI tools route directly to keyless Pollinations | a3e5d48 |

## External dependency audit (2026-10-12)
Only 2 external JS libraries in the whole repo, both pinned and browser-ready —
see CDN_AUDIT.md. No API keys in the current tree (full secret scan clean); the old
LLM7 key exists only in git history and must be revoked by the account owner.

## Live verified (22 tools)

| # | Tool | File | Category | Status | Verified how |
|---|------|------|----------|--------|--------------|
| 1 | AI Business Idea Generator | ai-business-idea-generator.html | AI Tools | ✅ Live verified | Topic "eco-friendly packaging" → structured business ideas output in ~60s. 2026-10-12. |
| 2 | AI Caption Generator | ai-caption-generator.html | AI Tools | ✅ Live verified | Topic "sunset beach photo" → multiple captions with Copy All in ~60s. 2026-10-12. |
| 3 | AI Chat | ai-chat.html | AI Tools | ✅ Live verified | "Hello, what is 2+2?" → correct answer "4." in ~60–90s (on-device attempt + 20s cloud fallback); English-only UI. (Post-fix test on js28.) 2026-10-12. |
| 4 | AI Image Generator | ai-image-generator.html | AI Tools | ✅ Live verified | Prompt "a red apple on a table" → relevant photorealistic image in ~15–20s via Pollinations (flux, no key). Slow-request 90s timeout + error/retry added after. 2026-10-12. |
| 5 | AI Interview Questions | ai-interview-questions.html | AI Tools | ✅ Live verified | Role "software engineer" → interview Q&A prep output in ~60s. 2026-10-12. |
| 6 | AI Logo Maker | ai-logo-maker.html | AI Tools | ✅ Live verified | "coffee shop named BrewBox" → logo image rendered with Download + New Variation in ~5–10s. 2026-10-12. |
| 7 | AI Name Generator | ai-name-generator.html | AI Tools | ✅ Live verified | Topic "fitness app" → name ideas list with Copy All in ~60s. 2026-10-12. |
| 8 | AI Paraphraser | ai-paraphraser.html | AI Tools | ✅ Live verified | "The quick brown fox jumps over the lazy dog" → "The quick, brown fox leapt over the languid dog." in ~25s–1min. (Post-fix test.) 2026-10-12. |
| 9 | AI Poetry Generator | ai-poetry-generator.html | AI Tools | ✅ Live verified | Topic "rain" → rate-limit 402 shown with friendly message + Retry; retry after 30s → full poem in ~60s. 2026-10-12. |
| 10 | AI Text Summarizer | ai-text-summarizer.html | AI Tools | ✅ Live verified | 5-sentence Kyoto text → coherent on-device summary in ~22s; English-only status messages. (Post-fix test on js27.) 2026-10-12. |
| 11 | AI Thumbnail Maker | ai-thumbnail-maker.html | AI Tools | ✅ Live verified | "10 money tips" → 1280×720 thumbnail image with Download + New Variation in ~5–10s. 2026-10-12. |
| 12 | AI Translator | ai-translator.html | AI Tools | ✅ Live verified | "Hello, how are you?" EN→UR → "ہیلو، آپ کیسے ہیں؟" in seconds via on-device path. (Post-fix test on js28.) 2026-10-12. |
| 13 | AI Wallpaper Generator | ai-wallpaper-generator.html | AI Tools | ✅ Live verified | "mountain landscape at night" → 1920×1080 wallpaper image with Download + New Variation in seconds. 2026-10-12. |
| 14 | Image Compressor | image-compressor.html | Image | ✅ Live verified | Uploaded 1600×1200 photo PNG (94.0 KB) → compressed 74.7 KB, page honestly showed "20% smaller"; downloaded JPG opened via PIL: valid JPEG 1600×1200. 2026-10-12. |
| 15 | Image Resizer | image-resizer.html | Image | ✅ Live verified | Uploaded 800×600 PNG → resized 500×300 (aspect lock off); page showed "500 × 300 px · PNG"; downloaded PNG opened via PIL: valid PNG exactly 500×300. 2026-10-12. |
| 16 | Images to PDF | images-to-pdf.html | PDF | ✅ Live verified | Uploaded 3 PNGs → downloaded PDF opened with pypdf: valid, exactly 3 pages, all with content. 2026-10-12. |
| 17 | JSON Formatter &amp; Validator | json-formatter.html | Developer | ✅ Live verified | Valid JSON → correct 2-space format; invalid {"name":} → clear unexpected-token error; empty → "Input is empty" message. 2026-10-12. |
| 18 | Merge PDF | merge-pdf.html | PDF | ✅ Live verified | Uploaded 5-page PDF twice → merged; downloaded PDF opened with pypdf: valid, exactly 10 pages (5+5), all with content. 2026-10-12. |
| 19 | Password Generator | password-generator.html | Generators | ✅ Live verified | Length 16 → 16 chars; length 20 → 20 chars; symbols toggle respected both ways; copy showed ✓ Copied!. 2026-10-12. |
| 20 | QR Code Generator | qr-generator.html | Generators | ✅ Live verified | Typed "https://example.com" → QR rendered (verified twice incl. after reload); Download PNG saved valid 300×300 PNG; empty input → validation message. (Post-fix re-test.) 2026-10-12. |
| 21 | Split PDF | split-pdf.html | PDF | ✅ Live verified | Uploaded 5-page PDF → extracted pages 1-2; downloaded PDF opened with pypdf: valid, exactly 2 pages, all with content. 2026-10-12. |
| 22 | Word Counter | word-counter.html | Text | ✅ Live verified | Typed "Hello world this is a test" → 6 words/26 chars live; 4-sentence para → 38 words/4 sentences; empty → zeros. 2026-10-12. |

## Code only — not live-tested in browser (109 tools)

| # | Tool | File | Category | Status | Note |
|---|------|------|----------|--------|------|
| 1 | A/B Test Calculator | ab-test-calculator.html | Marketing | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 2 | Age Calculator | age-calculator.html | Calculators | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 3 | AI Story Writer | ai-story-writer.html | AI Tools | ⬜ Code only (fix deployed, unverified) | Code only — JSON-leak guard + STRICT retry deployed on js28 (code-verified in page source, retry works); end-to-end unverified: free backend quota exhausted on all attempts. 2026-10-12. |
| 4 | ATS Resume Checker | ats-resume-checker.html | Resume | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 5 | Audio Trimmer | audio-trimmer.html | Audio | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 6 | Bill Splitter | bill-splitter.html | Finance | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 7 | ✨ Bio Maker | bio-maker.html | Social Media | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 8 | BMI Calculator | bmi-calculator.html | Calculators | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 9 | BMR Calculator | bmr-calculator.html | Health | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 10 | Body Fat Calculator | body-fat-calculator.html | Health | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 11 | Break-Even Calculator | break-even-calculator.html | Business | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 12 | Business Name Generator | business-name-generator.html | Business | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 13 | Card Validator | card-validator.html | Security | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 14 | Case Converter | case-converter.html | Text | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 15 | What's New | changelog.html | AI Tools | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 16 | Citation Generator | citation-generator.html | Writing | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 17 | CNIC / Passport Photo Maker | cnic-photo-maker.html | Pakistan | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 18 | Coin Flip | coin-flip.html | Everyday | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 19 | Color Picker | color-picker.html | Developer | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 20 | Compound Interest Calculator | compound-interest-calculator.html | Finance | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 21 | Contrast Checker | contrast-checker.html | Color | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 22 | Cooking Timer | cooking-timer.html | Cooking | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 23 | Cooking Unit Converter | cooking-unit-converter.html | Cooking | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 24 | Countdown Timer | countdown-timer.html | Date & Time | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 25 | Cover Letter Generator | cover-letter-generator.html | Resume | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 26 | CPC Calculator | cpc-calculator.html | Marketing | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 27 | Currency Converter | currency-converter.html | Converters | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 28 | Date Difference Calculator | date-difference.html | Date & Time | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 29 | Device Info | device-info.html | Everyday | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 30 | 🎲 Dice Roller | dice-roller.html | Fun | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 31 | Discount Calculator | discount-calculator.html | Calculators | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 32 | DLS Par Score Calculator | dls-par-score.html | Sports | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 33 | Pregnancy Due Date Calculator | due-date-calculator.html | Health | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 34 | Electricity Bill Calculator — Pakistan | electricity-bill-calculator.html | Pakistan | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 35 | EMI Calculator | emi-calculator.html | Calculators | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 36 | Engagement Rate Calculator | engagement-rate-calculator.html | Marketing | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 37 | Fancy Text Generator | fancy-text-generator.html | Fonts | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 38 | Final Grade Calculator | final-grade-calculator.html | Education | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 39 | Flight Duration Calculator | flight-duration-calculator.html | Travel | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 40 | Font Pairing | font-pairing.html | Fonts | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 41 | Freelance Rate Calculator | freelance-rate-calculator.html | Business | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 42 | Gold Rate Calculator — Pakistan | gold-rate-calculator.html | Pakistan | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 43 | GPA Calculator | gpa-calculator.html | Education | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 44 | GST Calculator | gst-calculator.html | Finance | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 45 | Guest List Manager | guest-list-manager.html | Wedding | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 46 | Hash Generator | hash-generator.html | Security | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 47 | #️⃣ Hashtag Generator | hashtag-generator.html | Social Media | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 48 | Headline Analyzer | headline-analyzer.html | Writing | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 49 | Hijri Converter | hijri-converter.html | Islamic | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 50 | Income Tax Calculator — Pakistan | income-tax-calculator-pakistan.html | Pakistan | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 51 | Ingredient Substitution | ingredient-substitution.html | Cooking | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 52 | Invoice Generator | invoice-generator.html | Generators | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 53 | Keyword Density Checker | keyword-density-checker.html | SEO | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 54 | Lorem Ipsum Generator | lorem-ipsum.html | Text | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 55 | Meme Maker | meme-maker.html | Meme | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 56 | Meme Templates | meme-templates.html | Meme | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 57 | Meta Tag Generator | meta-tag-generator.html | SEO | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 58 | Metronome | metronome.html | Audio | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 59 | Net Run Rate Calculator | net-run-rate-calculator.html | Sports | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 60 | Open Graph Preview | open-graph-preview.html | SEO | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 61 | Packing Checklist | packing-checklist.html | Travel | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 62 | Color Palette Generator | palette-generator.html | Color | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 63 | Password Strength Checker | password-strength-checker.html | Security | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 64 | Percentage Calculator | percentage-calculator.html | Calculators | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 65 | Plot Area Converter | plot-area-converter.html | Real Estate | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 66 | Plot Price Calculator | plot-price-calculator.html | Real Estate | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 67 | Points Table Maker | points-table-maker.html | Sports | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 68 | Pomodoro Timer | pomodoro-timer.html | Education | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 69 | Prayer Times | prayer-times.html | Islamic | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 70 | Profit Margin Calculator | profit-margin-calculator.html | Business | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 71 | PTA Tax Calculator — Pakistan | pta-tax-calculator.html | Pakistan | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 72 | Qibla Direction | qibla-direction.html | Islamic | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 73 | Random Number Generator | random-number-generator.html | Everyday | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 74 | 🎰 Random Picker | random-picker.html | Fun | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 75 | Readability Checker | readability-checker.html | Writing | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 76 | Recipe Scaler | recipe-scaler.html | Cooking | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 77 | Rent vs Buy Calculator | rent-vs-buy-calculator.html | Real Estate | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 78 | Required Run Rate Calculator | required-run-rate-calculator.html | Sports | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 79 | Resume Builder | resume-builder.html | Resume | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 80 | Resume Templates | resume-templates.html | Resume | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 81 | Robots.txt Generator | robots-txt-generator.html | SEO | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 82 | ROI Calculator | roi-calculator.html | Marketing | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 83 | Roman Urdu → Urdu Converter | roman-urdu-to-urdu.html | Pakistan | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 84 | Scientific Calculator | scientific-calculator.html | Education | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 85 | SIP Calculator | sip-calculator.html | Finance | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 86 | Slug Generator | slug-generator.html | Text | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 87 | Stamp Duty Calculator | stamp-duty-calculator.html | Real Estate | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 88 | Stopwatch | stopwatch.html | Everyday | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 89 | Tasbeeh Counter | tasbeeh-counter.html | Islamic | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 90 | Text Art Generator | text-art-generator.html | Fonts | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 91 | Text Summarizer | text-summarizer.html | Writing | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 92 | Text to Speech Studio | text-to-speech-studio.html | AI Tools | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 93 | Timestamp Converter | timestamp-converter.html | Developer | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 94 | Travel Budget Planner | travel-budget-planner.html | Travel | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 95 | Unit Converter | unit-converter.html | Converters | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 96 | URL Encoder Decoder | url-encoder-decoder.html | Developer | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 97 | UTM Link Builder | utm-builder.html | Developer | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 98 | UUID Generator | uuid-generator.html | Developer | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 99 | Video Metadata Viewer | video-metadata-viewer.html | Video | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 100 | YouTube Timestamp Link | video-timestamp-link.html | Video | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 101 | Video to GIF | video-to-gif.html | Video | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 102 | Voice Recorder | voice-recorder.html | Audio | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 103 | Water Intake Calculator | water-intake-calculator.html | Health | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 104 | Wedding Budget Planner | wedding-budget-planner.html | Wedding | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 105 | Wedding Countdown | wedding-countdown.html | Wedding | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 106 | Wedding Expense Splitter | wedding-expense-splitter.html | Wedding | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 107 | WhatsApp Link Generator | whatsapp-link-generator.html | Generators | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 108 | YouTube Thumbnail Resizer | youtube-thumbnail-resizer.html | Image | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |
| 109 | Zakat Calculator | zakat-calculator.html | Islamic | ⬜ Code only (unverified) | Not live-tested in browser this round; code was statically audited 2026-10-11 (valid JS, wired buttons, no placeholders). |

## Tool-count reconciliation
- **131** = actual tools (hub-link inventory, every file exists) — authoritative.
- **130** = stale homepage marketing copy — fixed to 131.
- **134** = stale number in llms.txt — fixed to 131.
- No tools are missing and none are duplicates. Details: TOOL_COUNT_RECONCILIATION.md.
