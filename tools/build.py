"""Builds the site's HTML pages from tools/pages/*.html.

    python3 tools/build.py

Each page source starts with a comment block of settings:
    <!--
    path: help/index.html
    title: Help: Textlore
    description: ...
    nav: help            (which nav item is current; optional)
    scripts: home        (extra script in /assets; optional)
    dlbar: yes           (show the floating download bar; optional)
    -->
and may use these placeholders:
    {{icon:name}}                         an inline SVG icon from ICONS below
    {{shot:name|sizes|alt}}               a screenshot as a light and dark pair (img/shots)
    {{shothero:name|sizes|alt}}           the same, loaded straight away, for a screenshot at the top of a page
    {{shotdark:name|sizes|alt}}           the dark screenshot only
    {{rings:class}}                       the year rings drawing (filled in by site.js)
The output is plain static HTML; the site itself has no build step to serve.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT / "tools" / "pages"
SHOTS = ROOT / "img" / "shots"

DOWNLOAD = "https://github.com/theusefulmedia/textlore-site/releases/latest/download/Textlore.dmg"
BUY = "https://theusefultech.gumroad.com/l/textlore?wanted=true"

ICONS = {
    "bookmark": '<path d="M7 3h10a1 1 0 0 1 1 1v17l-6-4-6 4V4a1 1 0 0 1 1-1z"/>',
    "promise": '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8 5.2-5.6"/>',
    "download": '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
    "check": '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    "x": '<path d="M7 7l10 10M17 7L7 17"/>',
    "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "out": '<path d="M7 17L17 7M9 7h8v8"/>',
    "search": '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    "keep": '<path d="M4 7h16v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M3 4h18v3H3zM10 11h4"/>',
    "rings": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="2" fill="currentColor"/>',
    "spark": '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z"/>',
    "lock": '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    "shield": '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
    "sun": '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    "moon": '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    "left": '<path d="M15 5l-7 7 7 7"/>',
    "right": '<path d="M9 5l7 7-7 7"/>',
    "play": '<path d="M7 4l13 8-13 8z" fill="currentColor" stroke="none"/>',
    "pause": '<path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor" stroke="none"/>',
    "bubble": '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4 3v-3h.5A2.5 2.5 0 0 1 4 14.5z"/>',
    "mail": '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 6 8-6"/>',
    "copy": '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    "help": '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 17h.01"/>',
    "install": '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M12 7v5M9.5 9.5 12 12l2.5-2.5"/>',
    "keyboard": '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
    "photo": '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="9.5" r="1.8"/><path d="M21 16l-5-5-8 8"/>',
    "cloud": '<path d="M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z"/>',
    "export": '<path d="M12 3v12M8 7l4-4 4 4M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
    "key": '<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2.5 2.5M14 9l2 2"/>',
    "refresh": '<path d="M20 11a8 8 0 0 0-14.6-4.5M4 4v3h3M4 13a8 8 0 0 0 14.6 4.5M20 20v-3h-3"/>',
    "wrench": '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.4 2.4-2.6-.6-.6-2.6z"/>',
    "bolt": '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
    "person": '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    "laptop": '<rect x="4" y="5" width="16" height="11" rx="2"/><path d="M2 19h20"/>',
    "infinity": '<path d="M7 9a3 3 0 1 0 0 6c3 0 7-6 10-6a3 3 0 1 1 0 6c-3 0-7-6-10-6z"/>',
    "doc": '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
    "eye-off": '<path d="M3 3l18 18M10.6 6.1A9.7 9.7 0 0 1 12 6c5 0 9 6 9 6a15 15 0 0 1-2.6 3.2M6.6 6.6C4.4 8 3 12 3 12s4 6 9 6a9 9 0 0 0 4.4-1.1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    "apple": '<path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.8zM14.1 5.8c.6-.8 1.1-1.8 1-2.8-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.7-1 2.7 1 .1 2-.5 2.7-1.3z" fill="currentColor" stroke="none"/>',
    # Social
    "instagram": '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/>',
    "youtube": '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" stroke="none"/>',
    "medium": '<ellipse cx="7.5" cy="12" rx="5" ry="5.2" fill="currentColor" stroke="none"/><ellipse cx="16" cy="12" rx="2.4" ry="4.9" fill="currentColor" stroke="none"/><ellipse cx="20.3" cy="12" rx=".9" ry="4.4" fill="currentColor" stroke="none"/>',
    "discord": '<path d="M8.5 6.5C6.6 7 5.3 7.7 5.3 7.7 3.8 10 3.2 12.9 3.4 16.3c1.6 1.2 3.2 1.9 4.7 2.3l1-1.6M15.5 6.5c1.9.5 3.2 1.2 3.2 1.2 1.5 2.3 2.1 5.2 1.9 8.6-1.6 1.2-3.2 1.9-4.7 2.3l-1-1.6M7.5 16c3 1.4 6 1.4 9 0M8.6 7.6c2.2-.6 4.6-.6 6.8 0"/><circle cx="9.3" cy="12.4" r="1.3" fill="currentColor" stroke="none"/><circle cx="14.7" cy="12.4" r="1.3" fill="currentColor" stroke="none"/>',
    "newsletter": '<path d="M4 5h13a3 3 0 0 1 3 3v11H7a3 3 0 0 1-3-3z"/><path d="M8 9h8M8 12.5h8M8 16h5"/>',
}


def icon(name, cls=""):
    c = f' class="{cls}"' if cls else ""
    return (f'<svg{c} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[name]}</svg>')


def widths(name, scheme):
    found = sorted({int(p.stem.rsplit("-", 1)[1]) for p in SHOTS.glob(f"{name}-{scheme}-*.webp")})
    if not found:
        raise SystemExit(f"no screenshot for {name}-{scheme}")
    return found


def picture(name, scheme, sizes, alt, cls, eager=False):
    ws = widths(name, scheme)
    big = ws[-1]
    w0 = big
    h0 = None
    from PIL import Image  # only for the intrinsic size
    with Image.open(SHOTS / f"{name}-{scheme}-{big}.webp") as im:
        w0, h0 = im.size
    avif = ", ".join(f"/img/shots/{name}-{scheme}-{w}.avif {w}w" for w in ws)
    webp = ", ".join(f"/img/shots/{name}-{scheme}-{w}.webp {w}w" for w in ws)
    return (f'<picture class="{cls}"><source type="image/avif" srcset="{avif}" sizes="{sizes}">'
            f'<img src="/img/shots/{name}-{scheme}-{ws[min(1, len(ws) - 1)]}.webp" srcset="{webp}" sizes="{sizes}" '
            f'width="{w0}" height="{h0}" loading="{"eager" if eager else "lazy"}" decoding="async" alt="{alt}"></picture>')


def shot(m, eager=False):
    name, sizes, alt = m.group(1).split("|")
    return ('<span class="duo">' + picture(name, "light", sizes, alt, "l", eager)
            + picture(name, "dark", sizes, alt + " Dark appearance.", "d", eager) + "</span>")


def shotdark(m):
    name, sizes, alt = m.group(1).split("|")
    return picture(name, "dark", sizes, alt, "")


NAV_ITEMS = [("features", "/#features", "Features"), ("lore", "/#relive", "Your Lore"),
             ("pricing", "/#pricing", "Pricing"), ("help", "/help/", "Help"), ("about", "/about/", "About")]


LAUNCH_ENDS = "2026-10-29T06:59:00Z"  # then the price goes from $20 to $39. The LAUNCH code on Gumroad ends at the same moment (28 Oct 23:59 Pacific, Gumroad account time)


def lp(during, after):
    """Text shown during the launch price, and the text that takes over when it ends (no rebuild needed)."""
    return f'<span class="l-on">{during}</span><span class="l-off">{after}</span>'


def nav(current, home):
    links = []
    for key, href, label in NAV_ITEMS:
        if home and href.startswith("/#"):
            href = href[1:]
        cur = ' aria-current="page"' if key == current else ""
        links.append(f'<li><a href="{href}"{cur}>{label}</a></li>')
    return f'''<header class="nav" aria-label="Main">
  <a class="nav__brand" href="/" aria-label="Textlore home"><img src="/img/icon-96.webp" width="32" height="32" alt=""><span>Textlore</span></a>
  <ul class="nav__links"><li class="nav__pill" aria-hidden="true"></li>{"".join(links)}</ul>
  <div class="nav__cta">
    <a class="btn btn--ghost download" href="{DOWNLOAD}">{icon("download")}Download</a>
    <a class="btn btn--amber btn--shine buy magnet" href="{BUY}">{lp("Buy $20", "Buy $39")}</a>
  </div>
  <button class="nav__menu" type="button" aria-label="Menu" aria-expanded="false"><span></span><span></span></button>
</header>'''


SOCIALS = [
    ("instagram", "https://www.instagram.com/theusefultech/", "The Useful Tech on Instagram"),
    ("youtube", "https://www.youtube.com/@theusefultech9850", "The Useful Tech on YouTube"),
    ("medium", "https://theusefultech.com", "The Useful Tech on Medium"),
    ("discord", "https://discord.gg/WjfenUSZp4", "The Useful Tech Club on Discord"),
    ("newsletter", "https://theusefulmedia.com/tech/", "The Useful Tech newsletter"),
]


def socials():
    return '<div class="socials">' + "".join(
        f'<a href="{u}" rel="noopener" aria-label="{label}" title="{label}">{icon(n)}</a>' for n, u, label in SOCIALS) + "</div>"


def footer(home):
    pre = "" if home else "/"
    return f'''<footer class="footer">
  <svg class="footer__rings" data-rings="footer" viewBox="0 0 600 600" aria-hidden="true"></svg>
  <div class="wrap">
    <div class="footer__top">
      <div class="footer__brand">
        <a class="logo" href="/"><img src="/img/icon-96.webp" width="44" height="44" alt="" loading="lazy">Textlore</a>
        <p>Recs, Promises, search and a lasting archive for your iMessage and WhatsApp history, privately on your Mac. Made in Chennai, India, by Raja at The Useful Media Co.</p>
        {socials()}
      </div>
      <div><h2 class="footer__h">Textlore</h2><ul>
        <li><a href="{pre}#features">Features</a></li>
        <li><a href="{pre}#relive">Your Lore</a></li>
        <li><a href="{pre}#pricing">Pricing</a></li>
        <li><a class="download" href="{DOWNLOAD}">Download</a></li>
      </ul></div>
      <div><h2 class="footer__h">Help</h2><ul>
        <li><a href="/help/">Help</a></li>
        <li><a href="/pricing/">Pricing</a></li>
        <li><a href="/guides/">Guides</a></li>
        <li><a href="/compare/">Compare</a></li>
        <li><a href="/support/">Support</a></li>
        <li><a href="/privacy/">Privacy</a></li>
        <li><a href="/terms/">Terms</a></li>
      </ul></div>
      <div><h2 class="footer__h">Company</h2><ul>
        <li><a href="/about/">About</a></li>
        <li><a href="https://theusefulmedia.com" rel="noopener">The Useful Media Co.</a></li>
        <li><a href="https://theusefulmedia.com/tech/" rel="noopener">Newsletter</a></li>
      </ul></div>
    </div>
    <div class="footer__cta">
      <div><b>Try every feature free for 14 days.</b><span>No account, no email. {lp("$20 until 28 October", "$39 once")} if you keep it.</span></div>
      <div class="btns"><a class="btn download magnet" href="{DOWNLOAD}">{icon("download")}Download free</a><a class="btn btn--amber buy magnet" href="{BUY}">{lp("Buy $20", "Buy $39")}</a></div>
    </div>
    <div class="footer__bottom">
      <span>&copy; 2026 The Useful Media Co. Chennai, India.</span>
      <button class="copy-mail" type="button" data-mail="raja@theusefultech.com">{icon("mail")}raja@theusefultech.com</button>
      <span>Textlore never sends, edits or deletes a message.</span>
    </div>
  </div>
</footer>'''


def dlbar():
    return f'''<div class="dlbar" aria-hidden="true">
  <img src="/img/icon-96.webp" width="38" height="38" alt="">
  <div><b>Textlore for Mac</b><span>Free for 14 days, then {lp("$20 until 28 Oct", "$39 once")}</span></div>
  <a class="btn btn--ghost buy" href="{BUY}" tabindex="-1">{lp("Buy $20", "Buy $39")}</a>
  <a class="btn download" href="{DOWNLOAD}" tabindex="-1">{icon("download")}Download</a>
</div>'''


HEAD = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{description}">
{canonical}
<meta name="theme-color" content="#F6F3EC" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0C0A1D" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Textlore">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:image" content="https://textlore.app/img/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="/assets/site.css">
<script>document.documentElement.classList.add('js');if(Date.now()>Date.parse('{launch_ends}'))document.documentElement.classList.add('launch-over')</script>
{org_ld}{extra_head}<script src="/assets/site.js" defer></script>
<script defer src="https://cloud.umami.is/script.js" data-website-id="15ada41b-1c57-4ce8-a23f-406f5de351a5" data-domains="textlore.app" data-do-not-track="true"></script>
{scripts}</head>
<body>
<a class="skip" href="#main">Skip to content</a>
'''


ORG_LD = """<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Organization","@id":"https://textlore.app/#organization","name":"The Useful Media Co.","url":"https://theusefulmedia.com","logo":"https://textlore.app/img/icon-384.webp","description":"The Useful Media Co. is a sole proprietorship in Chennai, India, that publishes The Useful Tech, The Useful Life, The Useful Creator and The Useful Gaming, and makes Textlore, a Mac app for iMessage and WhatsApp history.","founder":{"@type":"Person","name":"Raja","url":"https://textlore.app/about/"},"address":{"@type":"PostalAddress","addressLocality":"Chennai","addressCountry":"IN"},"contactPoint":{"@type":"ContactPoint","contactType":"customer support","email":"raja@theusefultech.com","url":"https://textlore.app/support/"},"sameAs":["https://www.instagram.com/theusefultech/","https://www.youtube.com/@theusefultech9850","https://theusefultech.com","https://theusefulmedia.com/tech/"]}
</script>
"""


def build(src):
    text = src.read_text()
    meta_block = re.match(r"<!--(.*?)-->\s*", text, re.S)
    meta = dict(line.split(":", 1) for line in meta_block.group(1).strip().splitlines())
    meta = {k.strip(): v.strip() for k, v in meta.items()}
    body = text[meta_block.end():]
    home = meta["path"] == "index.html"
    body = re.sub(r"\{\{icon:([\w-]+)\}\}", lambda m: icon(m.group(1)), body)
    body = re.sub(r"\{\{shothero:([^}]+)\}\}", lambda m: shot(m, True), body)
    body = re.sub(r"\{\{shot:([^}]+)\}\}", shot, body)
    body = re.sub(r"\{\{shotdark:([^}]+)\}\}", shotdark, body)
    body = re.sub(r"\{\{lp:(.*?)\|(.*?)\}\}", lambda m: lp(m.group(1), m.group(2)), body)
    body = body.replace("{{DOWNLOAD}}", DOWNLOAD).replace("{{BUY}}", BUY).replace("{{SOCIALS}}", socials())
    path = meta["path"]
    url = "https://textlore.app/" + path.replace("index.html", "")
    canonical = '<meta name="robots" content="noindex">' if path == "404.html" else f'<link rel="canonical" href="{url}">'
    scripts = "".join(f'<script src="/assets/{s.strip()}.js" defer></script>\n' for s in meta.get("scripts", "").split(",") if s.strip())
    extra = (ROOT / "tools" / "pages" / meta["head"]).read_text() if meta.get("head") else ""
    html = HEAD.format(launch_ends=LAUNCH_ENDS, title=meta["title"], description=meta["description"], canonical=canonical, scripts=scripts, extra_head=extra, org_ld=ORG_LD)
    html += nav(meta.get("nav", ""), home) + "\n\n" + body.strip() + "\n\n" + footer(home) + "\n"
    if meta.get("dlbar") == "yes":
        html += dlbar() + "\n"
    html += "</body>\n</html>\n"
    out = ROOT / path
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html)
    print("built", path)


MONTHS = {m: i for i, m in enumerate(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], 1)}
AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended"]


def lastmod(text):
    """The date a page says it was updated ('Updated 22 October 2026'), or its updated: setting."""
    m = re.search(r"^updated:\s*(\d{4}-\d{2}-\d{2})", text, re.M)
    if m:
        return m.group(1)
    m = re.search(r"Updated (\d{1,2}) (%s) (\d{4})" % "|".join(MONTHS), text)
    return f"{m.group(3)}-{MONTHS[m.group(2)]:02d}-{int(m.group(1)):02d}" if m else None


def sitemap():
    """sitemap.xml and robots.txt, so search engines and AI crawlers find every page."""
    urls = []
    for src in sorted(PAGES.glob("*.html")):
        text = src.read_text()
        m = re.search(r"^path:\s*(\S+)", text, re.M)
        if m and m.group(1) != "404.html":
            urls.append(("https://textlore.app/" + m.group(1).replace("index.html", ""), lastmod(text)))
    urls.sort(key=lambda u: (u[0].count("/"), u[0]))
    body = "".join(f"  <url><loc>{u}</loc>" + (f"<lastmod>{d}</lastmod>" if d else "") + "</url>\n" for u, d in urls)
    (ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + "</urlset>\n")
    # AI crawlers are named and allowed, with the same private paths closed as for everyone else.
    rules = "Allow: /\nDisallow: /stats/\nDisallow: /tools/\n"
    groups = "".join(f"User-agent: {b}\n{rules}\n" for b in AI_BOTS)
    (ROOT / "robots.txt").write_text(f"User-agent: *\n{rules}\n{groups}Sitemap: https://textlore.app/sitemap.xml\n")
    print("built sitemap.xml and robots.txt,", len(urls), "pages")


if __name__ == "__main__":
    for src in sorted(PAGES.glob("*.html")):
        build(src)
    sitemap()
