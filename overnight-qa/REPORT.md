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
<!-- filled below from batch reports -->
