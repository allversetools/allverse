# AllVerse CDN / External Dependency Audit — 2026-10-12

Method: full-tree grep of https?:// URLs in *.html/*.js/*.css + scan for
dynamic import(), script injection, Workers, CSS @import.

## External JS libraries (only 2 in entire repo)
| Library | URL | Version pinned | Browser-ready file | Global |
|---|---|---|---|---|
| pdf-lib | https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js | 1.17.1 exact | UMD min build | window.PDFLib |
| qrcodejs | https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js | 1.0.0 exact | browser build | window.QRCode |

Used by: merge-pdf.html, split-pdf.html, images-to-pdf.html (pdf-lib);
qr-generator.html (qrcodejs). All flows live-verified 2026-10-12.

## Other external runtime endpoints
- https://text.pollinations.ai/ — free AI text API, no key (14 AI text tools)
- https://image.pollinations.ai/prompt/ — free AI image API, no key (ai-image-generator, ai-logo-maker, ai-thumbnail-maker, ai-wallpaper-generator)
- https://fonts.googleapis.com/css2 — fonts only (Inter + IBM Plex Mono), via <link> and CSS @import
- https://www.youtube.com/embed/ — only in video-timestamp-link.html, embeds user-supplied video URLs (functional, not a library)

## Not present
- No dynamic import() of external modules
- No Workers loading external code
- No JS-injected external <script> tags (pjax.js re-executes same-page inline scripts only)
- No other CDN JS libraries anywhere in the tree

## Honesty note
Browser automation cannot read the DevTools console directly; live tests report
"no visible errors observed; console not directly available".
