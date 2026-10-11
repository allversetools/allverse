#!/usr/bin/env python3
"""STEP 1 — Schema patch for AllVerse.

- Converts SoftwareApplication JSON-LD -> WebApplication (idempotent:
  skips pages that already declare WebApplication).
- Adds BreadcrumbList JSON-LD to pages missing it (derived from the
  visible crumbs nav, else from the registry map).
- Adds Organization JSON-LD to the homepage (after WebSite block).

Never touches google4dbd6ae1567ddd05.html (GSC verification).
Safe to re-run: every patch checks for existing markup first.
"""
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://allversetools.github.io/allverse"
GSC = "google4dbd6ae1567ddd05.html"

# category file -> label (from TOOLS-REGISTRY.md)
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

# static pages: file -> crumb label (parent = Home)
STATIC_CRUMBS = {
    "about.html": "About", "contact.html": "Contact",
    "privacy.html": "Privacy Policy", "terms.html": "Terms of Service",
    "changelog.html": "Changelog", "404.html": "Page Not Found",
}


def load_tool2cat():
    tool2cat = {}
    reg = open(os.path.join(ROOT, "TOOLS-REGISTRY.md"), encoding="utf-8").read()
    for m in re.finditer(
        r"^\| ([a-z0-9-]+\.html) \| ([a-z0-9-]+\.html) \| ([a-z0-9-]+\.html) \|",
        reg, re.M,
    ):
        tool2cat[m.group(1)] = m.group(2)
    return tool2cat


def has_webapp(html):
    return '"WebApplication"' in html


def patch_webapp(html):
    """Convert SoftwareApplication block to WebApplication. Returns (html, changed)."""
    if has_webapp(html):
        return html, False
    if '"SoftwareApplication"' not in html:
        return html, False
    html = html.replace('"@type": "SoftwareApplication"', '"@type": "WebApplication"')
    html = html.replace('"@type":"SoftwareApplication"', '"@type":"WebApplication"')
    html = html.replace('"operatingSystem": "All"', '"operatingSystem": "Any"')
    html = html.replace('"operatingSystem":"All"', '"operatingSystem":"Any"')
    return html, True


def parse_crumbs_nav(html):
    m = re.search(r'<nav class="crumbs"[^>]*>(.*?)</nav>', html, re.S)
    if not m:
        return None
    items = []
    for a in re.finditer(r'<a href="([^"]+)">([^<]+)</a>', m.group(1)):
        items.append((a.group(2).strip(), a.group(1).strip()))
    tail = re.findall(r"</a><span[^>]*>.*?</span><span>([^<]+)</span>", m.group(1))
    if tail:
        items.append((tail[-1].strip(), None))
    else:
        # fallback: last <span> without link
        spans = re.findall(r"<span>([^<]+)</span>", m.group(1))
        if spans:
            items.append((spans[-1].strip(), None))
    return items or None


def h1_text(html):
    m = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S)
    if not m:
        return None
    return re.sub(r"<[^>]+>", "", m.group(1)).strip()


def breadcrumb_jsonld(items):
    els = []
    for i, (name, href) in enumerate(items, 1):
        el = {"@type": "ListItem", "position": i, "name": name}
        if href:
            el["item"] = href if href.startswith("http") else BASE + "/" + href
        els.append(el)
    data = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": els,
    }
    return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + "</script>"


def ensure_breadcrumb(fname, html, tool2cat):
    if '"BreadcrumbList"' in html:
        return html, False
    items = parse_crumbs_nav(html)
    if not items:
        if fname == "index.html":
            return html, False  # homepage: no breadcrumbs needed
        if fname in STATIC_CRUMBS:
            items = [("Home", "index.html"), (STATIC_CRUMBS[fname], None)]
        elif fname in CAT_LABELS:
            items = [("Home", "index.html"), (CAT_LABELS[fname], None)]
        elif fname in tool2cat:
            cat = tool2cat[fname]
            name = h1_text(html) or fname.replace(".html", "").replace("-", " ").title()
            items = [("Home", "index.html"),
                     (CAT_LABELS.get(cat, cat), cat),
                     (name, None)]
        else:
            name = h1_text(html) or fname.replace(".html", "").replace("-", " ").title()
            items = [("Home", "index.html"), (name, None)]
    block = breadcrumb_jsonld(items)
    html = html.replace("</head>", block + "\n</head>", 1)
    return html, True


ORG_BLOCK = (
    '<script type="application/ld+json">'
    '{"@context":"https://schema.org","@type":"Organization",'
    '"name":"AllVerse","url":"' + BASE + '/",'
    '"logo":"' + BASE + '/images/icon-192.png",'
    '"sameAs":["https://github.com/allversetools/allverse"]}'
    "</script>"
)


def ensure_organization(html):
    if '"Organization"' in html:
        return html, False
    # insert right after the WebSite JSON-LD block
    m = re.search(
        r'(<script type="application/ld\+json">\{"@context":"https://schema.org","@type":"WebSite".*?</script>)',
        html, re.S,
    )
    if m:
        html = html.replace(m.group(1), m.group(1) + "\n" + ORG_BLOCK, 1)
    else:
        html = html.replace("</head>", ORG_BLOCK + "\n</head>", 1)
    return html, True


def main():
    tool2cat = load_tool2cat()
    stats = {"webapp": 0, "breadcrumb": 0, "org": 0, "files": 0}
    for path in sorted(glob.glob(os.path.join(ROOT, "*.html"))):
        fname = os.path.basename(path)
        if fname == GSC:
            continue
        html = open(path, encoding="utf-8").read()
        orig = html
        html, c = patch_webapp(html)
        stats["webapp"] += c
        if fname == "index.html":
            html, c = ensure_organization(html)
            stats["org"] += c
        html, c = ensure_breadcrumb(fname, html, tool2cat)
        stats["breadcrumb"] += c
        if html != orig:
            open(path, "w", encoding="utf-8").write(html)
            stats["files"] += 1
    print(f"WebApplication conversions: {stats['webapp']}")
    print(f"BreadcrumbList added: {stats['breadcrumb']}")
    print(f"Organization added: {stats['org']}")
    print(f"Files modified: {stats['files']}")


if __name__ == "__main__":
    sys.exit(main())
