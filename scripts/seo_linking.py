#!/usr/bin/env python3
"""STEP 5 — Internal linking for AllVerse.

1. Visible breadcrumb nav on hub + static pages that lack it
   (Home > Category / Home > Label). Idempotent: skips pages that
   already contain class="crumbs".
2. Ensures every non-top-20 tool page has >=2 same-category sibling
   links in its "more-tools" grid (appends up to 6 total links).
   Idempotent via <!-- seo-siblings --> marker.

Hub pages already link all their tools (verified) — nothing to do there.
Never touches google4dbd6ae1567ddd05.html.
"""
import html as htmlmod
import json
import os
import re
import sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GSC = "google4dbd6ae1567ddd05.html"
SIB_MARKER = "<!-- seo-siblings -->"

CAT_LABELS = {
    "image-tools.html": "Image Tools", "text-tools.html": "Text Tools",
    "calculators.html": "Calculators", "converters.html": "Converters",
    "generators.html": "Generators", "developer-tools.html": "Developer Tools",
    "color-tools.html": "Color Tools", "date-time.html": "Date & Time",
    "social-media.html": "Social Media", "fun-tools.html": "Fun Tools",
    "seo-tools.html": "SEO Tools", "finance-tools.html": "Finance Tools",
    "health-tools.html": "Health Tools", "pdf-tools.html": "PDF Tools",
    "writing-tools.html": "Writing Tools", "marketing-tools.html": "Marketing Tools",
    "education-tools.html": "Education Tools", "security-tools.html": "Security Tools",
    "business-tools.html": "Business Tools", "everyday-tools.html": "Everyday Tools",
    "pakistan-tools.html": "Pakistan Utilities", "islamic-tools.html": "Islamic Tools",
    "ai-tools.html": "AI Tools", "cooking-tools.html": "Cooking Tools",
    "sports-tools.html": "Sports Tools", "wedding-tools.html": "Wedding Tools",
    "real-estate-tools.html": "Real Estate Tools", "travel-tools.html": "Travel Tools",
    "meme-tools.html": "Meme Tools", "font-tools.html": "Font Tools",
    "audio-tools.html": "Audio Tools", "video-tools.html": "Video Tools",
    "resume-tools.html": "Resume Tools",
}
STATIC_LABELS = {
    "about.html": "About", "contact.html": "Contact",
    "privacy.html": "Privacy Policy", "terms.html": "Terms of Service",
    "changelog.html": "Changelog",
}

_label_cache = {}


def label_for(fname):
    if fname not in _label_cache:
        html = open(os.path.join(ROOT, fname), encoding="utf-8").read()
        m = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S)
        txt = re.sub(r"<[^>]+>", "", m.group(1)).strip() if m else fname
        _label_cache[fname] = htmlmod.unescape(txt)
    return _label_cache[fname]


def load_tool2cat():
    tool2cat = {}
    reg = open(os.path.join(ROOT, "TOOLS-REGISTRY.md"), encoding="utf-8").read()
    for m in re.finditer(
        r"^\| ([a-z0-9-]+\.html) \| ([a-z0-9-]+\.html) \| ([a-z0-9-]+\.html) \|",
        reg, re.M,
    ):
        tool2cat[m.group(1)] = m.group(3)
    return tool2cat


def crumbs_nav(trail):
    """trail: list of (label, href-or-None)."""
    parts = []
    for i, (label, href) in enumerate(trail):
        if href and i < len(trail) - 1:
            parts.append(f'<a href="{href}">{htmlmod.escape(label)}</a><span>›</span>')
        elif href:
            parts.append(f'<a href="{href}">{htmlmod.escape(label)}</a>')
        else:
            parts.append(f"<span>{htmlmod.escape(label)}</span>")
    return '<nav class="crumbs" aria-label="Breadcrumb">' + "".join(parts) + "</nav>"


def add_visible_crumbs():
    """Add crumbs nav to hub + static pages missing it."""
    targets = {}
    for hub, label in CAT_LABELS.items():
        targets[hub] = [("Home", "index.html"), (label, None)]
    for page, label in STATIC_LABELS.items():
        targets[page] = [("Home", "index.html"), (label, None)]
    added = 0
    for fname, trail in sorted(targets.items()):
        path = os.path.join(ROOT, fname)
        if not os.path.exists(path):
            continue
        html = open(path, encoding="utf-8").read()
        if 'class="crumbs"' in html:
            continue
        nav = crumbs_nav(trail)
        m = re.search(r"<main[^>]*>", html)
        if not m:
            continue
        html = html[: m.end()] + "\n" + nav + html[m.end():]
        open(path, "w", encoding="utf-8").write(html)
        added += 1
    return added


def add_sibling_links(tool2cat):
    """Ensure >=2 sibling links in each non-top-20 tool's more-tools grid."""
    try:
        top20 = set(json.load(open(os.path.join(ROOT, "scripts", "seo_top20.json"), encoding="utf-8")))
    except FileNotFoundError:
        top20 = set()
    cat2tools = defaultdict(list)
    for t, c in tool2cat.items():
        cat2tools[c].append(t)
    fixed = 0
    for tool in sorted(tool2cat):
        if tool in top20:
            continue
        path = os.path.join(ROOT, tool)
        html = open(path, encoding="utf-8").read()
        if SIB_MARKER in html:
            continue
        m = re.search(r'(<section class="more-tools">.*?<div class="mini-grid">)(.*?)(</div></section>)', html, re.S)
        if not m:
            continue
        existing = re.findall(r'href="([a-z0-9-]+\.html)"', m.group(2))
        cat = tool2cat[tool]
        sibs_here = [l for l in existing if tool2cat.get(l) == cat and l != tool]
        if len(sibs_here) >= 2:
            continue
        need = 2 - len(sibs_here)
        candidates = [s for s in cat2tools[cat] if s != tool and s not in existing]
        # prefer siblings not already saturated; keep deterministic order
        add = candidates[: max(need, 0)]
        # top up to 6 total with any same-category tools
        while len(existing) + len(add) < 6 and len(add) < len(candidates):
            add.append(candidates[len(add)])
        if not add:
            continue
        links = "".join(
            f'\n<a class="mini-tool" href="{s}"><span>{htmlmod.escape(label_for(s))}</span><span class="mini-go">→</span></a>'
            for s in add
        )
        new_grid = m.group(1) + m.group(2) + links + "\n" + SIB_MARKER + m.group(3)
        html = html[: m.start()] + new_grid + html[m.end():]
        open(path, "w", encoding="utf-8").write(html)
        fixed += 1
    return fixed


def main():
    tool2cat = load_tool2cat()
    crumbs = add_visible_crumbs()
    sibs = add_sibling_links(tool2cat)
    print(f"Visible breadcrumb nav added to: {crumbs} pages")
    print(f"Tool pages gaining sibling links: {sibs}")


if __name__ == "__main__":
    main()
