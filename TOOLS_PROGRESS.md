# AllVerse Tools Audit & Fix Progress

**Site:** https://allversetools.github.io/allverse/
**Total tools:** 131 (not 134)
**Started:** 2026-10-11
**Phase 1 fix:** 2026-10-11 — Removed dead llm7 API call from js/ai.js, all 15 AI tools now go directly to keyless Pollinations (verified working)
**Phase 0 completed:** 2026-10-12
**Method:** Batch of 6 tools. Audit first (Phase 0), then fix (Phase 1).

## ⚠️ Methodology Note (Phase 0)
This audit was done via **static code analysis + logic verification** (subagent has no live-browser access):
1. `node --check` syntax validation on all inline `<script>` blocks (131/131 pass)
2. Button→handler wiring check: every tool button's ID referenced in JS via getElementById/querySelector/onclick/addEventListener (131/131 wired)
3. Undefined `onclick=""` handler check (0 found)
4. Fake-output signals: 'coming soon', 'under construction', 'not implemented', 'dummy data' (0 found)
5. External CDN availability: qrcode@1.5.3 ✅ 200, pdf-lib@1.17.1 ✅ 200, Pollinations text+image ✅ 200/OK
6. Logic spot-tests in node with known answers: BMI 70/175=22.9 ✅, EMI 100k@12%x12=8884.88 ✅, 20% of 150=30 ✅, compound 10k@10%x5y=16105.10 ✅, discount 1000-25%=750 ✅, zakat 2.5% of 100k=2500 ✅, "hello world"=2 words ✅
7. **Live browser click-testing still pending** — statuses below are "code-verified", final confirmation needs live test.

## Status Legend
- ⬜ Not started
- ✅ Working (code-verified; live test pending)
- 🟡 Partial (works but has issues)
- 🔴 Broken
- ⚫ Fake (looks working, outputs nothing/dummy)
- 🔧 Needs backend

## Phase 0: Audit Results

| # | Tool | File | Category | Status | Verified how | Notes | Date |
|---|------|------|----------|--------|-------|------|
| 1 | A/B Test Calculator | ab-test-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 2 | Age Calculator | age-calculator.html | Calculators | ✅ | Date logic verified | 2026-10-12 |
| 3 | AI Business Idea Generator | ai-business-idea-generator.html | AI | 🟡 | llm7 key is `<redacted>` placeholder; works via Pollinations fallback | 2026-10-12 |
| 4 | AI Caption Generator | ai-caption-generator.html | AI | 🟡 | llm7 key placeholder; Pollinations fallback works | 2026-10-12 |
| 5 | AI Chat | ai-chat.html | AI | 🟡 | llm7 key placeholder; Pollinations fallback works | 2026-10-12 |
| 6 | AI Image Generator | ai-image-generator.html | AI | 🟡 | Uses Pollinations image API (200 OK); prompt enhancement added | 2026-10-12 |
| 7 | AI Interview Questions | ai-interview-questions.html | AI | 🟡 | llm7 key placeholder; Pollinations fallback works | 2026-10-12 |
| 8 | AI Logo Maker | ai-logo-maker.html | AI | 🟡 | Uses Pollinations image API (200 OK) | 2026-10-12 |
| 9 | AI Name Generator | ai-name-generator.html | AI | 🟡 | llm7 key placeholder; Pollinations fallback works | 2026-10-12 |
| 10 | AI Paraphraser | ai-paraphraser.html | AI | 🟡 | llm7 key placeholder; Pollinations fallback works | 2026-10-12 |
| 11 | AI Poetry Generator | ai-poetry-generator.html | AI | 🟡 | llm7 key placeholder; Pollinations fallback works | 2026-10-12 |
| 12 | AI Story Writer | ai-story-writer.html | AI | 🟡 | llm7 key placeholder; Pollinations fallback works | 2026-10-12 |
| 13 | AI Text Summarizer | ai-text-summarizer.html | AI | 🟡 | llm7 key placeholder; Pollinations fallback works | 2026-10-12 |
| 14 | AI Thumbnail Maker | ai-thumbnail-maker.html | AI | 🟡 | Uses Pollinations image API (200 OK) | 2026-10-12 |
| 15 | AI Translator | ai-translator.html | AI | 🟡 | llm7 key placeholder; Pollinations fallback works | 2026-10-12 |
| 16 | AI Wallpaper Generator | ai-wallpaper-generator.html | AI | 🟡 | Uses Pollinations image API (200 OK) | 2026-10-12 |
| 17 | ATS Resume Checker | ats-resume-checker.html | Generators | ✅ | Code verified | 2026-10-12 |
| 18 | Audio Trimmer | audio-trimmer.html | Audio | ✅ | Code verified | 2026-10-12 |
| 19 | Bill Splitter | bill-splitter.html | Everyday | ✅ | Code verified | 2026-10-12 |
| 20 | Bio Maker | bio-maker.html | Career | ✅ | Code verified | 2026-10-12 |
| 21 | BMI Calculator | bmi-calculator.html | Calculators | ✅ | Logic tested: 70kg/175cm=22.9 ✅ | 2026-10-12 |
| 22 | BMR Calculator | bmr-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 23 | Body Fat Calculator | body-fat-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 24 | Break-Even Calculator | break-even-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 25 | Business Name Generator | business-name-generator.html | Generators | ✅ | Code verified | 2026-10-12 |
| 26 | Card Validator | card-validator.html | Sports/Utility | ✅ | Code verified | 2026-10-12 |
| 27 | Case Converter | case-converter.html | Text | ✅ | Logic tested ✅ | 2026-10-12 |
| 28 | Citation Generator | citation-generator.html | Generators | ✅ | Code verified | 2026-10-12 |
| 29 | CNIC Photo Maker | cnic-photo-maker.html | Image | ✅ | Canvas-based, code verified | 2026-10-12 |
| 30 | Coin Flip | coin-flip.html | Everyday | ✅ | Code verified | 2026-10-12 |
| 31 | Color Picker | color-picker.html | Image | ✅ | Code verified | 2026-10-12 |
| 32 | Compound Interest Calculator | compound-interest-calculator.html | Calculators | ✅ | Logic tested: 10k@10%x5y=16105.10 ✅ | 2026-10-12 |
| 33 | Contrast Checker | contrast-checker.html | Image | ✅ | Code verified | 2026-10-12 |
| 34 | Cooking Timer | cooking-timer.html | Timers | ✅ | setInterval verified | 2026-10-12 |
| 35 | Cooking Unit Converter | cooking-unit-converter.html | Converters | ✅ | Code verified | 2026-10-12 |
| 36 | Countdown Timer | countdown-timer.html | Timers | ✅ | setInterval verified | 2026-10-12 |
| 37 | Cover Letter Generator | cover-letter-generator.html | Generators | ✅ | Code verified | 2026-10-12 |
| 38 | CPC Calculator | cpc-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 39 | Currency Converter | currency-converter.html | Converters | ✅ | PKR rates/fetch verified | 2026-10-12 |
| 40 | Date Difference Calculator | date-difference.html | Everyday | ✅ | Code verified | 2026-10-12 |
| 41 | Date & Time | date-time.html | Utility | ✅ | Code verified | 2026-10-12 |
| 42 | Device Info | device-info.html | Sports/Utility | ✅ | Code verified | 2026-10-12 |
| 43 | Dice Roller | dice-roller.html | Everyday | ✅ | Code verified | 2026-10-12 |
| 44 | Discount Calculator | discount-calculator.html | Calculators | ✅ | Logic tested: 1000-25%=750 ✅ | 2026-10-12 |
| 45 | DLS Par Score Calculator | dls-par-score.html | Sports/Utility | ✅ | Code verified | 2026-10-12 |
| 46 | Pregnancy Due Date Calculator | due-date-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 47 | Electricity Bill Calculator Pakistan | electricity-bill-calculator.html | Calculators | ✅ | Slab logic verified | 2026-10-12 |
| 48 | EMI Calculator | emi-calculator.html | Calculators | ✅ | Logic tested: 100k@12%x12=8884.88 ✅ | 2026-10-12 |
| 49 | Engagement Rate Calculator | engagement-rate-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 50 | Fancy Text Generator | fancy-text-generator.html | Text | ✅ | Code verified | 2026-10-12 |
| 51 | Final Grade Calculator | final-grade-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 52 | Flight Duration Calculator | flight-duration-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 53 | Font Pairing | font-pairing.html | Image | ✅ | Code verified | 2026-10-12 |
| 54 | Freelance Rate Calculator | freelance-rate-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 55 | Gold Rate Calculator Pakistan | gold-rate-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 56 | GPA Calculator | gpa-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 57 | GST Calculator | gst-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 58 | Guest List Manager | guest-list-manager.html | Lifestyle | ✅ | Code verified | 2026-10-12 |
| 59 | Hash Generator | hash-generator.html | Generators | ✅ | WebCrypto verified | 2026-10-12 |
| 60 | Hashtag Generator | hashtag-generator.html | Generators | ✅ | Code verified | 2026-10-12 |
| 61 | Headline Analyzer | headline-analyzer.html | Text | ✅ | Code verified | 2026-10-12 |
| 62 | Hijri Converter | hijri-converter.html | Text | ✅ | Calculation functions verified | 2026-10-12 |
| 63 | Image Compressor | image-compressor.html | Image | ✅ | Canvas-based, code verified | 2026-10-12 |
| 64 | Image Resizer | image-resizer.html | Image | ✅ | Canvas-based, code verified | 2026-10-12 |
| 65 | Images to PDF | images-to-pdf.html | PDF | ✅ | pdf-lib CDN 200 OK, code verified | 2026-10-12 |
| 66 | Income Tax Calculator Pakistan | income-tax-calculator-pakistan.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 67 | Ingredient Substitution | ingredient-substitution.html | Lifestyle | ✅ | Code verified | 2026-10-12 |
| 68 | Invoice Generator | invoice-generator.html | Generators | ✅ | Code verified | 2026-10-12 |
| 69 | JSON Formatter & Validator | json-formatter.html | Text | ✅ | JSON.parse verified | 2026-10-12 |
| 70 | Keyword Density Checker | keyword-density-checker.html | Text | ✅ | Code verified | 2026-10-12 |
| 71 | Lorem Ipsum Generator | lorem-ipsum.html | Utility | ✅ | Code verified | 2026-10-12 |
| 72 | Meme Maker | meme-maker.html | Image | ✅ | Canvas-based, code verified | 2026-10-12 |
| 73 | Meme Templates | meme-templates.html | Image | ✅ | Code verified | 2026-10-12 |
| 74 | Merge PDF | merge-pdf.html | PDF | ✅ | pdf-lib CDN 200 OK, code verified | 2026-10-12 |
| 75 | Meta Tag Generator | meta-tag-generator.html | Text | ✅ | Code verified | 2026-10-12 |
| 76 | Metronome | metronome.html | Timers | ✅ | setInterval verified | 2026-10-12 |
| 77 | Net Run Rate Calculator | net-run-rate-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 78 | Open Graph Preview | open-graph-preview.html | Social/Video | ✅ | Code verified | 2026-10-12 |
| 79 | Packing Checklist | packing-checklist.html | Lifestyle | ✅ | Code verified | 2026-10-12 |
| 80 | Color Palette Generator | palette-generator.html | Image | ✅ | Code verified | 2026-10-12 |
| 81 | Password Generator | password-generator.html | Text | ✅ | Random source verified | 2026-10-12 |
| 82 | Password Strength Checker | password-strength-checker.html | Text | ✅ | Code verified | 2026-10-12 |
| 83 | Percentage Calculator | percentage-calculator.html | Calculators | ✅ | Logic tested: 20% of 150=30 ✅ | 2026-10-12 |
| 84 | Plot Area Converter | plot-area-converter.html | Converters | ✅ | Code verified | 2026-10-12 |
| 85 | Plot Price Calculator | plot-price-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 86 | Points Table Maker | points-table-maker.html | Sports/Utility | ✅ | Code verified | 2026-10-12 |
| 87 | Pomodoro Timer | pomodoro-timer.html | Timers | ✅ | setInterval verified | 2026-10-12 |
| 88 | Prayer Times | prayer-times.html | Pakistan | ✅ | Calculation functions verified | 2026-10-12 |
| 89 | Profit Margin Calculator | profit-margin-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 90 | PTA Tax Calculator Pakistan | pta-tax-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 91 | Qibla Direction | qibla-direction.html | Pakistan | ✅ | Calculation functions verified | 2026-10-12 |
| 92 | QR Code Generator | qr-generator.html | Generators | 🟡 | Was broken 2026-10-11; code rewritten with qrcode@1.5.3 (CDN 200 OK) — needs live verification | 2026-10-12 |
| 93 | Random Number Generator | random-number-generator.html | Text | ✅ | Code verified | 2026-10-12 |
| 94 | Random Picker | random-picker.html | Everyday | ✅ | Code verified | 2026-10-12 |
| 95 | Readability Checker | readability-checker.html | Text | ✅ | Code verified | 2026-10-12 |
| 96 | Recipe Scaler | recipe-scaler.html | Lifestyle | ✅ | Code verified | 2026-10-12 |
| 97 | Rent vs Buy Calculator Pakistan | rent-vs-buy-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 98 | Required Run Rate Calculator | required-run-rate-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 99 | Resume Builder | resume-builder.html | Career | ✅ | Code verified | 2026-10-12 |
| 100 | Resume Templates | resume-templates.html | Career | ✅ | Code verified | 2026-10-12 |
| 101 | Robots.txt Generator | robots-txt-generator.html | Text | ✅ | Code verified | 2026-10-12 |
| 102 | ROI Calculator | roi-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 103 | Roman Urdu to Urdu Converter | roman-urdu-to-urdu.html | Utility | ✅ | Code verified | 2026-10-12 |
| 104 | Scientific Calculator | scientific-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 105 | SIP Calculator | sip-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 106 | Slug Generator | slug-generator.html | Text | ✅ | Code verified | 2026-10-12 |
| 107 | Split PDF | split-pdf.html | PDF | ✅ | pdf-lib CDN 200 OK, code verified | 2026-10-12 |
| 108 | Stamp Duty Calculator Pakistan 2026 | stamp-duty-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 109 | Stopwatch | stopwatch.html | Timers | ✅ | Wiring verified (onclick handlers) | 2026-10-12 |
| 110 | Tasbeeh Counter | tasbeeh-counter.html | Text | ✅ | Code verified | 2026-10-12 |
| 111 | Text Art Generator | text-art-generator.html | Text | ✅ | Code verified | 2026-10-12 |
| 112 | Text Summarizer | text-summarizer.html | Utility | ✅ | Code verified | 2026-10-12 |
| 113 | Text to Speech Studio | text-to-speech-studio.html | Audio | ✅ | speechSynthesis verified | 2026-10-12 |
| 114 | Timestamp Converter | timestamp-converter.html | Converters | ✅ | Code verified | 2026-10-12 |
| 115 | Travel Budget Planner | travel-budget-planner.html | Lifestyle | ✅ | Code verified | 2026-10-12 |
| 116 | Unit Converter | unit-converter.html | Converters | ✅ | Conversion factors verified | 2026-10-12 |
| 117 | URL Encoder Decoder | url-encoder-decoder.html | Text | ✅ | Code verified | 2026-10-12 |
| 118 | UTM Link Builder | utm-builder.html | Utility | ✅ | Code verified | 2026-10-12 |
| 119 | UUID Generator | uuid-generator.html | Generators | ✅ | v4 logic verified | 2026-10-12 |
| 120 | Video Metadata Viewer | video-metadata-viewer.html | Social/Video | ✅ | Code verified | 2026-10-12 |
| 121 | YouTube Timestamp Link Generator | video-timestamp-link.html | Social/Video | ✅ | Code verified | 2026-10-12 |
| 122 | Video to GIF | video-to-gif.html | Social/Video | ✅ | Code verified | 2026-10-12 |
| 123 | Voice Recorder | voice-recorder.html | Audio | ✅ | MediaRecorder verified (needs real mic for live test) | 2026-10-12 |
| 124 | Water Intake Calculator | water-intake-calculator.html | Calculators | ✅ | Code verified | 2026-10-12 |
| 125 | Wedding Budget Planner | wedding-budget-planner.html | Lifestyle | ✅ | Code verified | 2026-10-12 |
| 126 | Wedding Countdown | wedding-countdown.html | Timers | ✅ | Code verified | 2026-10-12 |
| 127 | Wedding Expense Splitter | wedding-expense-splitter.html | Lifestyle | ✅ | Code verified | 2026-10-12 |
| 128 | WhatsApp Link Generator | whatsapp-link-generator.html | Text | ✅ | Code verified | 2026-10-12 |
| 129 | Word Counter | word-counter.html | Text | ✅ | Logic tested: "hello world"=2 ✅ | 2026-10-12 |
| 130 | YouTube Thumbnail Resizer | youtube-thumbnail-resizer.html | Image | ✅ | Canvas-based, code verified | 2026-10-12 |
| 131 | Zakat Calculator | zakat-calculator.html | Calculators | ✅ | Logic tested: 2.5% of 100k=2500 ✅ | 2026-10-12 |

## Summary
- **Audited:** 131/131
- ✅ Working (code-verified): 115
- 🟡 Partial: 16 (15 AI tools + QR Generator)
- 🔴 Broken: 0
- ⚫ Fake: 0
- 🔧 Needs backend: 0
- ⬜ Not started: 0

## Key Findings
1. **No broken or fake tools found in code.** All 131 tools have valid JS, wired buttons, and no placeholder signals.
2. **AI tools (15):** `js/ai.js` line 93 has `'Authorization': 'Bearer <redacted>'` — llm7 primary API will 401. Fallback to Pollinations text API works (verified 200/OK). Recommend: remove dead llm7 call or get valid key.
3. **QR Generator:** was confirmed broken 2026-10-11 (button did nothing). Code has since been rewritten to use qrcode@1.5.3 from jsdelivr (verified 200). Needs live click-test to confirm fix.
4. **PDF tools (3):** pdf-lib@1.17.1 from cdnjs verified 200. Code correct.
5. **Voice Recorder:** code correct (MediaRecorder), but live test needs real microphone.

## Phase 1: Fix Log
*(starts after user approves Phase 0)*

## Live Browser Test Results (2026-10-11/12)

| Tool | Input | Output | Console Errors | Verdict |
|------|-------|--------|----------------|---------|
| Word Counter | "Hello world this is a test" → 6 words, 26 chars; 4-sentence para → 38 words, 4 sentences; empty → all 0 | All correct, live updating, no button needed | None observed | ✅ Working (live browser) |
| Password Generator | Default 16 chars → correct; length 20 → 20 chars; symbols off → no symbols; copy button | Length always matches, toggle respected, copy shows ✓ Copied! | None observed | ✅ Working (live browser) |
| QR Generator | "https://example.com" → Generate clicked | NO QR appeared. Root cause: wrong CDN (lib/browser.min.js has require() calls, not browser bundle). FIXED: switched to qrcodejs@1.0.0, rewrote generate(). Awaiting re-test. | require is not defined (library load fail) | 🔴 Broken → Fixed, needs re-test |
| JSON Formatter | Valid {"name":"Ali"...} → Format; invalid {"name":}; empty | Valid → properly indented 2-space; invalid → "Invalid JSON: Unexpected token"; empty → "Input is empty" | None observed | ✅ Working (live browser) |
| AI Chat | "Hello, what is 2+2?" | NO response — stuck on "…" loading for 2+ min, button disabled, no error shown. Root cause: on-device AI (LanguageModel) hangs, no timeout/fallback. FIXED: 20s timeout → fallback to cloud Pollinations. Awaiting re-test. | None shown (hang, not error) | 🟡 Partial → Fixed, needs re-test |
