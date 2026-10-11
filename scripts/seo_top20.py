#!/usr/bin/env python3
"""STEP 4 — Per-tool SEO content for the top-20 tools (scripts/seo_top20.json).

For each tool page:
  - keyword-led <title> (+ og/twitter titles)
  - ~150-char meta description (+ og/twitter descriptions + schema description)
  - "How to use" section + "Why use this tool" bullets (before FAQ section)
  - "More free tools" grid upgraded to 5-6 curated related links

Idempotent: skips pages containing the <!-- seo-top20 --> marker
(unless --force is passed). Never touches google4dbd6ae1567ddd05.html.
Reuses existing .faq-section / .more-tools / .mini-grid CSS classes —
no stylesheet changes needed.
"""
import html as htmlmod
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MARKER = "<!-- seo-top20 -->"
FORCE = "--force" in sys.argv

DATA = json.load(open(os.path.join(ROOT, "scripts", "seo_top20.json"), encoding="utf-8"))

_label_cache = {}


def label_for(fname):
    if fname not in _label_cache:
        html = open(os.path.join(ROOT, fname), encoding="utf-8").read()
        m = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S)
        txt = re.sub(r"<[^>]+>", "", m.group(1)).strip() if m else fname
        _label_cache[fname] = htmlmod.unescape(txt)
    return _label_cache[fname]


def esc(s):
    return htmlmod.escape(s, quote=True)


def build_sections(d):
    steps = "\n".join(f"<li>{esc(s)}</li>" for s in d["howto"])
    bullets = "\n".join(f"<li>{esc(s)}</li>" for s in d["why"])
    return (
        f"{MARKER}\n"
        f'<section class="faq-section"><h2>How to use</h2>\n<ol class="seo-steps">\n{steps}\n</ol></section>\n'
        f'<section class="faq-section"><h2>Why use this tool?</h2>\n<ul class="seo-why">\n{bullets}\n</ul></section>\n'
    )


def build_more_tools(d):
    links = "\n".join(
        f'<a class="mini-tool" href="{r}"><span>{esc(label_for(r))}</span><span class="mini-go">→</span></a>'
        for r in d["related"]
    )
    return (
        f'<section class="more-tools">{MARKER}<h2>More free tools</h2>\n'
        f'<div class="mini-grid">\n{links}\n</div></section>'
    )


def patch_page(fname, d):
    path = os.path.join(ROOT, fname)
    html = open(path, encoding="utf-8").read()
    if MARKER in html and not FORCE:
        return False

    # --- title ---
    html = re.sub(r"<title>.*?</title>", f"<title>{esc(d['title'])}</title>", html, count=1)
    html = re.sub(
        r'(<meta property="og:title" content=")[^"]*(">)',
        lambda m: m.group(1) + esc(d["title"]) + m.group(2), html, count=1)
    html = re.sub(
        r'(<meta name="twitter:title" content=")[^"]*(">)',
        lambda m: m.group(1) + esc(d["title"]) + m.group(2), html, count=1)

    # --- meta description (+ og/twitter + schema) ---
    desc = esc(d["desc"])
    html = re.sub(
        r'(<meta name="description" content=")[^"]*(">)',
        lambda m: m.group(1) + desc + m.group(2), html, count=1)
    html = re.sub(
        r'(<meta property="og:description" content=")[^"]*(">)',
        lambda m: m.group(1) + desc + m.group(2), html, count=1)
    html = re.sub(
        r'(<meta name="twitter:description" content=")[^"]*(">)',
        lambda m: m.group(1) + desc + m.group(2), html, count=1)
    # schema description inside WebApplication JSON-LD
    html = re.sub(
        r'("WebApplication".*?"description": ")[^"]*(")',
        lambda m: m.group(1) + d["desc"].replace('"', '\\"') + m.group(2),
        html, count=1, flags=re.S)

    # --- strip previously injected blocks when re-running with --force ---
    if FORCE:
        html = html.replace(MARKER + "\n", "")
        html = re.sub(
            r'<section class="faq-section"><h2>How to use</h2>.*?</section>\n'
            r'<section class="faq-section"><h2>Why use this tool\?</h2>.*?</section>\n',
            "", html, flags=re.S)
        # more-tools grid will be replaced below (it no longer has the marker)

    # --- insert How to use / Why sections before FAQ (or before more-tools) ---
    sections = build_sections(d)
    if '<section class="faq-section">' in html:
        html = html.replace('<section class="faq-section">', sections + '<section class="faq-section">', 1)
    elif '<section class="more-tools">' in html:
        html = html.replace('<section class="more-tools">', sections + '<section class="more-tools">', 1)
    else:
        html = html.replace("</main>", sections + "</main>", 1)

    # --- upgrade more-tools grid ---
    if '<section class="more-tools">' in html:
        html = re.sub(
            r'<section class="more-tools">.*?</section>',
            build_more_tools(d), html, count=1, flags=re.S)
    else:
        html = html.replace("</main>", build_more_tools(d) + "\n</main>", 1)

    open(path, "w", encoding="utf-8").write(html)
    return True


def main():
    done, skipped = 0, 0
    for fname, d in sorted(DATA.items()):
        if patch_page(fname, d):
            done += 1
        else:
            skipped += 1
    print(f"SEO content applied: {done}, skipped (already done): {skipped}")


if __name__ == "__main__":
    main()
