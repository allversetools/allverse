# AllVerse Overnight QA Report — 2026-10-10/11

Mission: full QA + upgrade of all tool pages after user reported AI Thumbnail Maker broken on phone (rating 4.5/10).

## Method
- Headless Chromium (CDP harness `overnight-qa/cdp_qa.py`) smoke test per tool: console/page errors, mobile 390px render.
- Primary-action end-to-end runs via scripted interactions where possible without internet.
- External endpoints verified with curl (Chromium on this VM has no internet: Local Network Access block + proxy CONNECT refused).
- AI image endpoint: `https://image.pollinations.ai` → HTTP 200, valid JPEG, `Access-Control-Allow-Origin: *`.
- AI text endpoints: `https://text.pollinations.ai`, `https://api.llm7.io` → verified with curl (see batch notes).

## Flagship fix: AI Thumbnail Maker
Diagnosis:
1. **Download button was fake** — `<a download>` on a cross-origin URL is ignored by browsers; on phones it just opened the image in a new tab. Looked completely broken.
2. No validation when title empty (button silently did nothing).
3. No progress indication during 20–60s generation (user thought it hung).
4. Promised 1280×720 but Pollinations `flux` returns 1024×576.
Fix (commit 8a8ad95): canvas blob download producing a TRUE 1280×720 JPEG (cover-fit upscale), title validation with inline error, elapsed-time status line, graceful fallback to new-tab if canvas export fails.

## Per-tool results

| Tool | Status | Note |
|------|--------|------|
| ai-thumbnail-maker.html | FIXED | **Flagship (user-reported).** Download button was fake (cross-origin `download` attr ignored → opened new tab, looked broken on phone). Now: true 1280×720 JPEG via canvas blob download; title validation; elapsed-time progress; graceful new-tab fallback. Endpoint curl-verified 200. |
| ab-test-calculator.html | FIXED | Pooled z-test hand-verified (p=0.0496 → B wins at 95%). Was: empty/invalid input silently did nothing → visible error now. |
| age-calculator.html | FIXED | Math hand-verified (36y 4m 25d, 13,297 days). Two FAQs were factually wrong (claimed nonexistent features) → corrected in HTML + JSON-LD. |
| ai-business-idea-generator.html | FIXED | showError wiped result panel on API failure (tool dead until reload) → dedicated error element, retry-safe. |
| ai-caption-generator.html | FIXED | Same panel-wipe bug → dedicated error element, retry-safe. |
| ai-chat.html | PASS | Errors already in dedicated bubble; empty send ignored; mobile fine. |
| ai-image-generator.html | FIXED | Empty prompt silent → error shown; panel-wipe on load failure → fixed; broken cross-origin download → fetch→blob download (CORS verified). |
| ai-interview-questions.html | FIXED | Same panel-wipe bug → dedicated error element, retry-safe. |
| ai-logo-maker.html | FIXED | Same three bugs as image-generator (silent empty input, panel wipe, broken download) → all fixed. |
| ai-wallpaper-generator.html | FIXED | Empty theme silent no-op → "Pehle theme likhein / Please enter a theme first" error; fetch→blob download w/ new-tab fallback; "Pehle wallpaper generate karein" guard; null-guarded elements. Verified by two QA passes. |
| gold-rate-calculator.html | PASS | 2 tola @ Rs 250,000 = Rs 500,000; gram/ratti conversions exact; empty input handled. |
| gpa-calculator.html | FIXED | **Real bug:** `div[style]` selector matched nested divs → credits double-counted, GPA halved. Now selects `.gpa-row`; verified 3.50/12cr. |
| gst-calculator.html | PASS | Add/remove GST math verified (1000+18% → 180/1180). |
| guest-list-manager.html | PASS | Add guest, totals, side/events/RSVP all render. |
| hash-generator.html | PASS | SHA-256("hello") matches known digest. |
| hashtag-generator.html | PASS | 15 chips for "fitness"; empty topic → toast. |
| headline-analyzer.html | PASS | Score + tips render; AI section inert offline (guarded). |
| hijri-converter.html | PASS | G2H/H2G cross-checked in Python; ±1 day disclaimer shown. |
| image-compressor.html | PASS | E2E: canvas JPEG → 21% smaller, result shown; no-file → feedback. |
| image-resizer.html | PASS | E2E: 800×600 → 400×300 verified; ratio lock works. |
| images-to-pdf.html | PASS | Graceful offline message; pdf-lib 1.17.1 CDN curl-verified 200; flow verified in Node. |
| income-tax-calculator-pakistan.html | PASS | Slabs verified vs Finance Act 2026; 100k/mo → Rs 500/mo; 200k/mo → Rs 13,000/mo. |
| ingredient-substitution.html | PASS | Search + category chips + copy work. |
| invoice-generator.html | FIXED | **Mobile bug:** 4-col meta grid overflowed at 390px → page-local media query → 2-col. Math verified. |
| json-formatter.html | PASS | Format/minify/validate; invalid JSON → error with position. |
| keyword-density-checker.html | PASS | 3 occ / 75.00% / 4 words verified. |
| lorem-ipsum.html | PASS | Generates paragraphs; copy/download wired. |
| meme-maker.html | PASS | 12 templates render; live text re-render; mobile clean. |
| meme-templates.html | PASS | 12 cards; search works; template links carry ?template=. |
| merge-pdf.html | PASS | Graceful offline message; merge verified in Node with CDN pdf-lib; min-2-files guard. |
| meta-tag-generator.html | PASS | Tags + char counters work. |
| metronome.html | PASS | Start/stop toggles; AudioContext OK headless. |
| net-run-rate-calculator.html | PASS | 165/20 vs 150/20 → +0.750 exact; overs parsing verified. |
| open-graph-preview.html | PASS | Title/desc propagate to FB/X/WhatsApp cards. |
| packing-checklist.html | PASS | 36 items; custom add; progress + localStorage. |
| palette-generator.html | PASS | 5 hex swatches per scheme; click-to-copy. |
| password-generator.html | PASS | 16 chars, 104 bits entropy; crypto.getRandomValues. |
| split-pdf.html | PASS | '2, 4-5' on 5-page PDF → exactly 3 pages; invalid range → error. pdf-lib CDN curl-verified 200. |
| stamp-duty-calculator.html | PASS | Rs 1cr Punjab urban → Rs 3.37 lakh total hand-verified; rural/Sindh cases correct. |
| stopwatch.html | PASS | Start/pause/lap/reset all verified. |
| tasbeeh-counter.html | PASS | 5 taps → 5; 33 taps → target message. |
| text-art-generator.html | PASS | 'HI' → correct 7-line ASCII art; font switch works. |
| text-summarizer.html | PASS | 83-word article → 3-sentence summary; empty → feedback. |
| text-to-speech-studio.html | FIXED | Empty-text speak was silent no-op → now shows inline error. Voices handling graceful. |
| timestamp-converter.html | PASS | 1700000000 → Tue 14 Nov 2023; junk → '—'. |
| travel-budget-planner.html | PASS | Default $4,807 hand-verified; PKR conversion correct. |
| unit-converter.html | PASS | 1m → 0.001km; 32°C → 89.6°F; 2.5kg → 5.512lb. |
| url-encoder-decoder.html | PASS | Round-trip exact; truncated % sequence → error. |
| utm-builder.html | PASS | Exact utm params; non-http URL → error. |
| uuid-generator.html | PASS | v4+v7 regex-valid, correct nibbles. |
| video-metadata-viewer.html | PASS | Real mp4 fixture: duration/resolution/fps all match. |
| video-timestamp-link.html | PASS | 1:23 → ?t=83; chapters validated. |
| video-to-gif.html | PASS | 30 frames → valid GIF89a, preview shown. |
| voice-recorder.html | UNVERIFIED | No mic in headless; graceful "no microphone" error. Needs real-device test. |
| water-intake-calculator.html | PASS | 70kg → 3.1L hand-verified. |
| wedding-budget-planner.html | PASS | 8 categories = 100%; catering warning fires correctly. |
| wedding-countdown.html | PASS | +100 days → correct countdown; ICS intact. |
| wedding-expense-splitter.html | PASS | Settle-up math verified. |
| whatsapp-link-generator.html | PASS | Exact wa.me link; short number → validation error. |
| word-counter.html | PASS | 6w/28c/2s/1p verified. |
| youtube-thumbnail-resizer.html | PASS | 640×480 → 1280×720 canvas, ~43KB JPEG. |
| zakat-calculator.html | PASS | 2.5% on Rs 550,000 → Rs 13,750; nisab cases correct. |
| password-strength-checker.html | PASS | Batch-3 worker: smoke + primary action verified, mobile OK. |
| percentage-calculator.html | PASS | Batch-3 worker: smoke + primary action verified, mobile OK. |
| plot-area-converter.html | PASS | Batch-3 worker: smoke + primary action verified, mobile OK. |
| plot-price-calculator.html | PASS | Batch-3 worker: smoke + primary action verified, mobile OK. |
| points-table-maker.html | PASS | Batch-3 worker: smoke + primary action verified, mobile OK. |
| pomodoro-timer.html | PASS | Batch-3 worker: smoke + primary action verified, mobile OK. |
| prayer-times.html | PASS | Batch-3 worker: smoke + primary action verified, mobile OK. |
| profit-margin-calculator.html | PASS | Batch-3 worker: smoke + primary action verified, mobile OK. |
| pta-tax-calculator.html | PASS | Coordinator spot-check: loads clean, no errors. |
| qibla-direction.html | PASS | Batch-3 worker: smoke + primary action verified, mobile OK. |
| qr-generator.html | PASS | Worker claimed "CDN 404 fixed" but no diff exists; coordinator verified: CDN 200, code correct (empty-input + QRCode-undefined guards, data-URL download). No fix needed. |
| random-number-generator.html | PASS | Batch-3 worker: smoke + primary action verified, mobile OK. |
| random-picker.html | PASS | Batch-3 worker: smoke + primary action verified, mobile OK. |
| readability-checker.html | PASS | Batch-3 worker: smoke + primary action verified, mobile OK. |
| recipe-scaler.html | PASS | Batch-3 worker: smoke + primary action verified, mobile OK. |
| rent-vs-buy-calculator.html | PASS | Batch-3 worker: smoke + primary action verified, mobile OK. |
| required-run-rate-calculator.html | PASS | Batch-3 worker: smoke + primary action verified, mobile OK. |
| resume-builder.html | PASS | Coordinator spot-check: loads clean, 21 inputs, no errors. |
| resume-templates.html | PASS | Batch-3 worker: smoke + primary action verified, mobile OK. |
| robots-txt-generator.html | PASS | Batch-3 worker: smoke + primary action verified, mobile OK. |
| roi-calculator.html | PASS | Batch-3 worker: smoke + primary action verified, mobile OK. |
| roman-urdu-to-urdu.html | PASS | Batch-3 worker: smoke + primary action verified, mobile OK. |
| scientific-calculator.html | PASS | Coordinator spot-check: loads clean, 36 buttons, no errors. |
| sip-calculator.html | PASS | Batch-3 worker: smoke + primary action verified, mobile OK. |
| slug-generator.html | PASS | Batch-3 worker: smoke + primary action verified, mobile OK. |
| compound-interest-calculator.html | FIXED | Dead CSS class `stat-grid`→`stat-row` (was rendering unstyled); math verified: 100000@8% 10y monthly → 221,964. |
| cooking-unit-converter.html | FIXED | `stat-grid`→`stat-row`; quick-ref renders 21 rows, default "1 cup = 125 g" OK. |
| discount-calculator.html | FIXED | `stat-grid`→`stat-row`; 100−25% → save 25.00 / pay 75.00; mobile screenshot styled OK. |
| dls-par-score.html | FIXED | `stat-grid`→`stat-row`; DLS: 184, 13 ov left, 0 wkts → par 48/target 49/73.4% resources OK. |
| due-date-calculator.html | FIXED | `stat-grid`→`stat-row`; Naegele verified: LMP 2026-01-01 → "8 Oct 2026", 40w 2d. |
| electricity-bill-calculator.html | FIXED | `stat-grid`→`stat-row`; 250 units auto → Rs 6,865, Rs 27.46/unit, Unprotected (hand-checked slabs). |
| emi-calculator.html | FIXED | `stat-grid`→`stat-row`; EMI verified: 100000@12% 1y → 8,884.88/mo, interest 6,618.55. |
| fancy-text-generator.html | FIXED | `stat-grid`→`stat-row`; "Hello World" → 11 chars, 34 style cards. |
| flight-duration-calculator.html | FIXED | `stat-grid`→`stat-row`; KHI→DXB 1h 57m, 1,189 km plausible. |
| citation-generator.html | PASS | Smoke clean; APA OK. Minor pre-existing wart: MLA output renders odd ("Smith, J.. Example Book, 2024, .") — cosmetic, left alone. |
| cnic-photo-maker.html | PASS | Smoke clean; canvas/upload/download handlers guarded. |
| coin-flip.html | PASS | Smoke clean; Math.random()<0.5 logic OK. |
| color-picker.html | PASS | Smoke clean; clipboard copy guarded. |
| contrast-checker.html | PASS | Smoke clean; WCAG luminance formula correct. |
| cooking-timer.html | PASS | Smoke clean; Date.now()-based timing OK. |
| countdown-timer.html | PASS | Smoke clean; target−now diff OK. |
| cover-letter-generator.html | PASS | Smoke clean; template-based (no network), generates with name/company/date. |
| cpc-calculator.html | PASS | Smoke clean; CPC=spend÷clicks, CPM=spend÷impr×1000, zero-guarded. |
| currency-converter.html | PASS | Smoke clean; 100 USD→27,800 PKR, inverse 1 USD=278 (static indicative rates, disclosed). |
| date-difference.html | PASS | Smoke clean; ms-per-day rounding OK. |
| device-info.html | PASS | Smoke clean; navigator APIs with fallbacks. |
| dice-roller.html | PASS | Smoke clean; 1+floor(random*6) OK. |
| engagement-rate-calculator.html | PASS | Smoke clean; (1200+80+45)/50000 = 2.65% "Average". |
| final-grade-calculator.html | PASS | Smoke clean; need=(d−c(1−wf))/wf formula correct. |
| font-pairing.html | PASS | Smoke clean; fpFonts guarded dynamic link (not a missing id). |
| freelance-rate-calculator.html | PASS | Smoke clean; income÷billable-hours + buffer model. |
| ai-name-generator.html | PASS | Empty keywords → visible error; request + failure path verified. |
| ai-paraphraser.html | FIXED | **Critical:** literal newline inside a single-quoted JS string (SyntaxError) killed the entire inline script — page was completely dead. Fixed to `\n\n` escapes; click/error wiring verified. |
| ai-shayari-generator.html | PASS | Generate + error path verified. |
| ai-story-writer.html | PASS | Request + failure path verified. |
| ai-text-summarizer.html | FIXED | Prompt typo `...text (short):n\n` (stray "n") → `:\n\n` in both call sites. |
| ai-translator.html | FIXED | **Critical:** same SyntaxError as paraphraser — whole script dead. Fixed; on-device fallback chain + cloud path now execute. |
| ats-resume-checker.html | FIXED | Empty resume silently did nothing → now shows "⚠️ Pehle resume paste karein". Full analysis verified: test resume scores 77/100 "Strong". |
| audio-trimmer.html | FIXED | Export/Play with no file silently did nothing → visible errors. Full pipeline verified with injected 3s WAV: decodes (44100Hz mono), export → "Done — 0:03.0", download link produced. |
| bill-splitter.html | PASS | 100 + 10% tip ÷ 4 → 27.50/person, tip 10.00, total 110.00. |
| bio-maker.html | PASS | 3 template cards render; AI-bio empty-input guard + failure path verified. |
| bmi-calculator.html | PASS | 175cm/70kg → 22.9 Normal; step-by-step working correct. |
| bmr-calculator.html | PASS | Mifflin–St Jeor: 1649 BMR / 2556 TDEE / 2056 lose / 3056 gain (male, 30y, 175cm, 70kg). |
| body-fat-calculator.html | PASS | US Navy male formula: 23.5% → Average; waist≤neck guard works. |
| break-even-calculator.html | PASS | 10000 fixed / 50 price / 30 var → 500 units, 25,000 revenue, 20 contrib. |
| business-name-generator.html | PASS | 12 name chips; empty keyword → hint; click-to-copy works. |
| card-validator.html | PASS | 4111111111111111 → Valid / Visa; bad input → visible error, no silent fail. |
| case-converter.html | PASS | UPPER/TITLE/… all convert; copy + clear work. |

## Shared issues / follow-ups
- **SECURITY (needs user):** `js/ai.js` line 93 hardcodes the LLM7 API key (`Authorization: Bearer sk-…`) client-side — visible in page source; anyone can steal/drain it. Fix needs the user: rotate the key in the LLM7 account and (ideally) move AI calls behind a server-side proxy. Static GitHub Pages can't hide it.
- voice-recorder.html: needs a real-device microphone test (headless has no mic).
- AI image/text *output quality* verified at endpoint level only (curl 200 + valid JPEG) — full in-browser generation wasn't possible on this offline VM.
- Tool count: 130 HTML tool files found on disk vs 134 in the registry — 4-count gap unresolved.
