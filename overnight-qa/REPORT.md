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
