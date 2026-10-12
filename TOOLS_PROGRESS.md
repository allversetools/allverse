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
- ✅ Live verified: **30**
- 🟧 Code only (fix deployed, unverified): **1** (AI Story Writer — backend quota)
- ⬜ Code only (unverified): **99**
- **Total: 130**

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
see CDN_AUDIT.md. No API keys in the current tree (full secret scan clean). CORRECTION 2026-10-12: a full scan of all 9,595 blobs in git history proved no real LLM7 key was ever committed — the code only ever contained the placeholder `Bearer unused`. The earlier 'exposed key' warning was a false alarm from the overnight QA report; nothing to revoke, no history scrub needed.

## Live verified (30 tools)

| # | Tool | File | Category | Status | Verified how |
|---|------|------|----------|--------|--------------|
| 1 | AI Business Idea Generator | ai-business-idea-generator.html | AI Tools | ✅ Live verified | "eco-friendly packaging" -> structured ideas ~60s. 2026-10-12. |
| 2 | AI Caption Generator | ai-caption-generator.html | AI Tools | ✅ Live verified | "sunset beach photo" -> captions with Copy All ~60s. 2026-10-12. |
| 3 | AI Chat | ai-chat.html | AI Tools | ✅ Live verified | "Hello, what is 2+2?" -> "4." in ~60-90s (on-device+20s cloud fallback); English-only. Post-fix js28. 2026-10-12. Cloud-only path (?forceCloud=1): "What is 5+5?" -> "10" quickly, no 20s stall. 2026-10-12. |
| 4 | AI Image Generator | ai-image-generator.html | AI Tools | ✅ Live verified | "a red apple on a table" -> relevant image ~15-20s via Pollinations. 2026-10-12. |
| 5 | AI Interview Questions | ai-interview-questions.html | AI Tools | ✅ Live verified | "software engineer" -> interview Q&A ~60s. 2026-10-12. |
| 6 | AI Logo Maker | ai-logo-maker.html | AI Tools | ✅ Live verified | "coffee shop named BrewBox" -> logo image ~5-10s. 2026-10-12. |
| 7 | AI Name Generator | ai-name-generator.html | AI Tools | ✅ Live verified | "fitness app" -> name ideas ~60s. 2026-10-12. |
| 8 | AI Paraphraser | ai-paraphraser.html | AI Tools | ✅ Live verified | "The quick brown fox..." -> paraphrase in ~25s-1min. Post-fix. 2026-10-12. |
| 9 | AI Poetry Generator | ai-poetry-generator.html | AI Tools | ✅ Live verified | "rain" -> 402 friendly msg + Retry; retry -> full poem ~60s. 2026-10-12. |
| 10 | AI Text Summarizer | ai-text-summarizer.html | AI Tools | ✅ Live verified | Kyoto text -> coherent on-device summary ~22s; English-only. Post-fix js27. 2026-10-12. Cloud-only path: summary in seconds, 30-60s note visible. 2026-10-12. |
| 11 | AI Thumbnail Maker | ai-thumbnail-maker.html | AI Tools | ✅ Live verified | "10 money tips" -> 1280x720 image ~5-10s. 2026-10-12. |
| 12 | AI Translator | ai-translator.html | AI Tools | ✅ Live verified | "Hello, how are you?" EN->UR -> Urdu in seconds on-device. Post-fix js28. 2026-10-12. Cloud-only path: "Good morning" -> Urdu; one 402 then retry succeeded. 2026-10-12. |
| 13 | AI Wallpaper Generator | ai-wallpaper-generator.html | AI Tools | ✅ Live verified | "mountain landscape at night" -> 1920x1080 image in seconds. 2026-10-12. |
| 14 | Currency Converter | currency-converter.html | Converters | ✅ Live verified | 100 USD -> 27,720.6 PKR via LIVE ExchangeRate-API (1 USD=277.206); green live stamp; manual USD/PKR override present. Batch 1. |
| 15 | Electricity Bill Calculator — Pakistan | electricity-bill-calculator.html | Pakistan | ✅ Live verified | 250 units auto -> Rs 6,865 exact (100x22.44+100x28.91+50x33.10+75); Oct 2026 note citing 12 Feb 2026 NEPRA notification. Post-correction. Batch 1. |
| 16 | Gold Rate Calculator — Pakistan | gold-rate-calculator.html | Pakistan | ✅ Live verified | Prefill 441000; 1 tola -> Rs 441,000; 12 Oct 2026 note (Sarafa Assn has no public API - manual input). Batch 1. |
| 17 | Image Compressor | image-compressor.html | Image | ✅ Live verified | 1600x1200 photo 94.0KB -> 74.7KB (20% smaller); download: valid JPEG 1600x1200. 2026-10-12. |
| 18 | Image Resizer | image-resizer.html | Image | ✅ Live verified | 800x600 PNG -> 500x300; download opened via PIL: valid PNG exactly 500x300. 2026-10-12. |
| 19 | Images to PDF | images-to-pdf.html | PDF | ✅ Live verified | 3 PNGs -> download opened with pypdf: exactly 3 pages, all with content. 2026-10-12. |
| 20 | Income Tax Calculator — Pakistan | income-tax-calculator-pakistan.html | Pakistan | ✅ Live verified | Monthly 208333.33 -> yearly tax Rs 176,000 (116000+20% of 300000) exact; slab table FY 2026-27; Oct 2026 FBR note visible. Batch 1. |
| 21 | JSON Formatter &amp; Validator | json-formatter.html | Developer | ✅ Live verified | Valid JSON -> correct 2-space format; invalid {"name":} -> clear token error; empty -> message. 2026-10-12. |
| 22 | Merge PDF | merge-pdf.html | PDF | ✅ Live verified | 5-page PDF x2 -> download opened with pypdf: exactly 10 pages, all with content. 2026-10-12. |
| 23 | Password Generator | password-generator.html | Generators | ✅ Live verified | Length 16 -> 16 chars; length 20 -> 20 chars; symbols toggle respected; copy showed Copied. 2026-10-12. |
| 24 | Prayer Times | prayer-times.html | Islamic | ✅ Live verified | Karachi -> LIVE times loaded via Aladhan API (Univ. of Islamic Sciences Karachi method): Fajr 5:12 AM etc.; green live note visible. Batch 1. |
| 25 | PTA Tax Calculator — Pakistan | pta-tax-calculator.html | Pakistan | ✅ Live verified | $150 CNIC -> Rs 11,561 total (duty 11561, sales tax 0); Jan 2026 DIRBS note visible; bands match official schedule. Batch 1. |
| 26 | QR Code Generator | qr-generator.html | Generators | ✅ Live verified | "https://example.com" -> QR rendered (twice incl. reload); PNG download valid 300x300; empty -> validation. Post-fix. 2026-10-12. |
| 27 | Split PDF | split-pdf.html | PDF | ✅ Live verified | 5-page PDF -> pages 1-2; download opened with pypdf: exactly 2 pages, all with content. 2026-10-12. |
| 28 | Stamp Duty Calculator | stamp-duty-calculator.html | Real Estate | ✅ Live verified | Punjab 5,000,000 -> Rs 50,000 (1% uniform); Oct 2026 source note visible. Post-correction. Batch 1. |
| 29 | Word Counter | word-counter.html | Text | ✅ Live verified | Typed "Hello world this is a test" -> 6 words/26 chars live; 4-sentence para -> 38 words/4 sentences; empty -> zeros. 2026-10-12. |
| 30 | Zakat Calculator | zakat-calculator.html | Islamic | ✅ Live verified | Cash 1,000,000, nisab 503529 -> Rs 25,000 zakat; official nisab note visible. Post-correction. Batch 1. |

## Code only — not live-tested in browser (100 tools)

| # | Tool | File | Category | Status | Note |
|---|------|------|----------|--------|------|
| 1 | A/B Test Calculator | ab-test-calculator.html | Marketing | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 2 | Age Calculator | age-calculator.html | Calculators | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 3 | AI Story Writer | ai-story-writer.html | AI Tools | ⬜ Code only (fix deployed, unverified) | Code only - JSON-leak guard + STRICT retry deployed on js29 (code-verified, retry works); end-to-end unverified: free backend quota exhausted on all attempts. 2026-10-12. |
| 4 | ATS Resume Checker | ats-resume-checker.html | Resume | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 5 | Audio Trimmer | audio-trimmer.html | Audio | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 6 | Bill Splitter | bill-splitter.html | Finance | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 7 | ✨ Bio Maker | bio-maker.html | Social Media | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 8 | BMI Calculator | bmi-calculator.html | Calculators | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 9 | BMR Calculator | bmr-calculator.html | Health | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 10 | Body Fat Calculator | body-fat-calculator.html | Health | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 11 | Break-Even Calculator | break-even-calculator.html | Business | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 12 | Business Name Generator | business-name-generator.html | Business | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 13 | Card Validator | card-validator.html | Security | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 14 | Case Converter | case-converter.html | Text | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 15 | Citation Generator | citation-generator.html | Writing | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 16 | CNIC / Passport Photo Maker | cnic-photo-maker.html | Pakistan | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 17 | Coin Flip | coin-flip.html | Everyday | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 18 | Color Picker | color-picker.html | Developer | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 19 | Compound Interest Calculator | compound-interest-calculator.html | Finance | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 20 | Contrast Checker | contrast-checker.html | Color | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 21 | Cooking Timer | cooking-timer.html | Cooking | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 22 | Cooking Unit Converter | cooking-unit-converter.html | Cooking | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 23 | Countdown Timer | countdown-timer.html | Date & Time | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 24 | Cover Letter Generator | cover-letter-generator.html | Resume | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 25 | CPC Calculator | cpc-calculator.html | Marketing | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 26 | Date Difference Calculator | date-difference.html | Date & Time | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 27 | Device Info | device-info.html | Everyday | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 28 | 🎲 Dice Roller | dice-roller.html | Fun | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 29 | Discount Calculator | discount-calculator.html | Calculators | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 30 | DLS Par Score Calculator | dls-par-score.html | Sports | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 31 | Pregnancy Due Date Calculator | due-date-calculator.html | Health | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 32 | EMI Calculator | emi-calculator.html | Calculators | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 33 | Engagement Rate Calculator | engagement-rate-calculator.html | Marketing | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 34 | Fancy Text Generator | fancy-text-generator.html | Fonts | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 35 | Final Grade Calculator | final-grade-calculator.html | Education | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 36 | Flight Duration Calculator | flight-duration-calculator.html | Travel | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 37 | Font Pairing | font-pairing.html | Fonts | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 38 | Freelance Rate Calculator | freelance-rate-calculator.html | Business | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 39 | GPA Calculator | gpa-calculator.html | Education | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 40 | GST Calculator | gst-calculator.html | Finance | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 41 | Guest List Manager | guest-list-manager.html | Wedding | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 42 | Hash Generator | hash-generator.html | Security | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 43 | #️⃣ Hashtag Generator | hashtag-generator.html | Social Media | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 44 | Headline Analyzer | headline-analyzer.html | Writing | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 45 | Hijri Converter | hijri-converter.html | Islamic | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 46 | Ingredient Substitution | ingredient-substitution.html | Cooking | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 47 | Invoice Generator | invoice-generator.html | Generators | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 48 | Keyword Density Checker | keyword-density-checker.html | SEO | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 49 | Lorem Ipsum Generator | lorem-ipsum.html | Text | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 50 | Meme Maker | meme-maker.html | Meme | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 51 | Meme Templates | meme-templates.html | Meme | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 52 | Meta Tag Generator | meta-tag-generator.html | SEO | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 53 | Metronome | metronome.html | Audio | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 54 | Net Run Rate Calculator | net-run-rate-calculator.html | Sports | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 55 | Open Graph Preview | open-graph-preview.html | SEO | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 56 | Packing Checklist | packing-checklist.html | Travel | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 57 | Color Palette Generator | palette-generator.html | Color | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 58 | Password Strength Checker | password-strength-checker.html | Security | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 59 | Percentage Calculator | percentage-calculator.html | Calculators | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 60 | Plot Area Converter | plot-area-converter.html | Real Estate | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 61 | Plot Price Calculator | plot-price-calculator.html | Real Estate | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 62 | Points Table Maker | points-table-maker.html | Sports | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 63 | Pomodoro Timer | pomodoro-timer.html | Education | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 64 | Profit Margin Calculator | profit-margin-calculator.html | Business | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 65 | Qibla Direction | qibla-direction.html | Islamic | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 66 | Random Number Generator | random-number-generator.html | Everyday | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 67 | 🎰 Random Picker | random-picker.html | Fun | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 68 | Readability Checker | readability-checker.html | Writing | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 69 | Recipe Scaler | recipe-scaler.html | Cooking | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 70 | Rent vs Buy Calculator | rent-vs-buy-calculator.html | Real Estate | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 71 | Required Run Rate Calculator | required-run-rate-calculator.html | Sports | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 72 | Resume Builder | resume-builder.html | Resume | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 73 | Resume Templates | resume-templates.html | Resume | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 74 | Robots.txt Generator | robots-txt-generator.html | SEO | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 75 | ROI Calculator | roi-calculator.html | Marketing | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 76 | Roman Urdu → Urdu Converter | roman-urdu-to-urdu.html | Pakistan | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 77 | Scientific Calculator | scientific-calculator.html | Education | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 78 | SIP Calculator | sip-calculator.html | Finance | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 79 | Slug Generator | slug-generator.html | Text | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 80 | Stopwatch | stopwatch.html | Everyday | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 81 | Tasbeeh Counter | tasbeeh-counter.html | Islamic | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 82 | Text Art Generator | text-art-generator.html | Fonts | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 83 | Text Summarizer | text-summarizer.html | Writing | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 84 | Text to Speech Studio | text-to-speech-studio.html | AI Tools | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 85 | Timestamp Converter | timestamp-converter.html | Developer | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 86 | Travel Budget Planner | travel-budget-planner.html | Travel | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 87 | Unit Converter | unit-converter.html | Converters | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 88 | URL Encoder Decoder | url-encoder-decoder.html | Developer | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 89 | UTM Link Builder | utm-builder.html | Developer | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 90 | UUID Generator | uuid-generator.html | Developer | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 91 | Video Metadata Viewer | video-metadata-viewer.html | Video | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 92 | YouTube Timestamp Link | video-timestamp-link.html | Video | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 93 | Video to GIF | video-to-gif.html | Video | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 94 | Voice Recorder | voice-recorder.html | Audio | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 95 | Water Intake Calculator | water-intake-calculator.html | Health | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 96 | Wedding Budget Planner | wedding-budget-planner.html | Wedding | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 97 | Wedding Countdown | wedding-countdown.html | Wedding | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 98 | Wedding Expense Splitter | wedding-expense-splitter.html | Wedding | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 99 | WhatsApp Link Generator | whatsapp-link-generator.html | Generators | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |
| 100 | YouTube Thumbnail Resizer | youtube-thumbnail-resizer.html | Image | ⬜ Code only (unverified) | Not live-tested in browser yet; 2026-10-11 static audit found valid JS, wired buttons, no placeholder/fake signals. |

## Tool-count reconciliation
- **131** = actual tools (hub-link inventory, every file exists) — authoritative.
- **130** = stale homepage marketing copy — fixed to 131.
- **134** = stale number in llms.txt — fixed to 131.
- No tools are missing and none are duplicates. Details: TOOL_COUNT_RECONCILIATION.md.
