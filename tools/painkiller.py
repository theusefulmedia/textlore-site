"""Writes the 10 'painkiller' guide pages (approved by Raja 18 Nov 2026) into tools/pages/.

    python3 tools/painkiller.py && python3 tools/build.py

Each page: hero, quick answer with a table, steps, a real Textlore screenshot, the Textlore Forever card
(shown only on these pages), questions, and a final call to action. The head file carries breadcrumb,
HowTo-free Article and FAQPage data for search engines.
"""
import json
from pathlib import Path

PAGES = Path(__file__).resolve().parent / "pages"
UPDATED = "24 November 2026"

FOREVER_CARD = """
<div class="forever" id="forever">
  <svg class="forever__rings" data-rings="art" viewBox="0 0 600 600" aria-hidden="true"></svg>
  <div class="forever__text">
    <p class="forever__tag">{{icon:keep}} Textlore Forever</p>
    <h3>For texts you need to keep for years.</h3>
    <p>{fv} Textlore Forever is the same app with every future major version included: 2.0, 3.0 and on, for as long as Textlore is made. One payment, 2 Macs, no subscription.</p>
    <ul class="forever__list">
      <li>{{icon:check}} Every 1.x update, like the standard licence</li>
      <li>{{icon:check}} Every future major version, free</li>
      <li>{{icon:check}} The same 14-day free trial first</li>
    </ul>
  </div>
  <div class="forever__buy">
    <p class="forever__price"><b>$79</b><span>once</span></p>
    <a class="btn btn--big btn--amber btn--shine buy magnet" href="{{FOREVER}}"><span class="btn__two"><span>Get Textlore Forever</span><small>All future versions</small></span></a>
    <a class="forever__alt" href="{{BUY}}">{{lp:Or the standard licence, $20|Or the standard licence, $39}}</a>
  </div>
</div>
"""

CTA = """
  <div class="guide-cta">
    <img src="/img/icon-192.webp" width="64" height="64" alt="" loading="lazy">
    <div class="guide-cta__text">
      <b>{cta}</b>
      <span>Every feature is free for 14 days. No account, no email, no card.</span>
    </div>
    <div class="btns">
      <a class="btn btn--big download magnet" href="{{{{DOWNLOAD}}}}">{{{{icon:apple}}}}<span class="btn__two">Download free<small>14 days, no account</small></span></a>
      <a class="btn btn--big btn--ghost magnet" href="#forever">See Textlore Forever</a>
    </div>
  </div>
"""

TEXTLORE_FACTS = "Textlore is a Mac app that reads your whole Messages history at once. It only reads: it never sends, edits or deletes a message, and nothing leaves your Mac."

LEGAL = "This guide is practical help, not legal advice. Ask your lawyer or the court what they accept, because rules differ between courts and countries."


def table(rows, head=("Way", "Best for", "Catch")):
    h = "".join(f'<th scope="col">{c}</th>' for c in head)
    b = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows)
    return f'<table class="table guide-table"><thead><tr>{h}</tr></thead><tbody>{b}</tbody></table>'


def shot(name, alt):
    return f'<div class="showcase" data-scheme="auto"><div class="frame__win">{{{{shot:{name}|(max-width: 960px) calc(100vw - 32px), 760px|{alt}}}}}</div></div>'


def page(p):
    toc = "".join(f'<a href="#{s["id"]}">{s["toc"]}</a>' for s in p["sections"]) + '<a href="#forever">Textlore Forever</a><a href="#faq">Questions</a>'
    secs = ""
    for s in p["sections"]:
        secs += f'\n<section id="{s["id"]}">\n  <h2><span class="ic">{{{{icon:{s["icon"]}}}}}</span>{s["h2"]}</h2>\n{s["html"]}\n</section>\n'
    faq = "".join(f"<details><summary>{q}</summary><div><p>{a}</p></div></details>" for q, a in p["faq"])
    body = f"""<!--
path: guides/{p['slug']}/index.html
title: {p['title']}
description: {p['desc']}
head: guide-{p['slug']}-head.txt
dlbar: yes
-->
<main id="main">

<section class="page-hero guide-hero">
  <div class="wrap page-hero__grid">
    <div>
      <p class="eyebrow"><a href="/guides/">Guides</a></p>
      <h1>{p['h1']} <em>{p['em']}</em></h1>
      <p class="lede">{p['lede']}</p>
      <p class="guide-meta">Updated {UPDATED}. For Messages on macOS 26 and later.</p>
    </div>
    <svg class="page-hero__art" data-rings="art" viewBox="0 0 600 600" aria-hidden="true"></svg>
  </div>
</section>

<div class="doc">
  <div class="wrap doc__grid">
    <nav class="toc" aria-label="On this page">
      <p>On this page</p>
      <a href="#quick-answer">Quick answer</a>{toc}
    </nav>
    <div class="prose">

<section id="quick-answer">
  <h2><span class="ic">{{{{icon:doc}}}}</span>Quick answer</h2>
  <p class="aside">{p['quick']}</p>
  {table(p['table'], p.get('thead', ('Way', 'Best for', 'Catch')))}
</section>
{secs}
<section id="buy">
{FOREVER_CARD.replace('{fv}', p.get('fv', 'Cases can run for years.'))}
{CTA.format(cta=p['cta'])}
</section>

<section id="faq" class="guide-faq faq">
  <h2><span class="ic">{{{{icon:help}}}}</span>Questions</h2>
  <div class="faq__list">
    {faq}
  </div>
</section>
    </div>
  </div>
</div>

<section class="final" aria-labelledby="final-title">
  <svg class="final__rings" data-rings="final" viewBox="0 0 600 600" aria-hidden="true"></svg>
  <div class="wrap">
    <h2 id="final-title" class="rise">{p['final']}</h2>
    <p class="rise">Download Textlore and try every feature free for 14 days.</p>
    <div class="btns rise">
      <a class="btn btn--big btn--amber btn--shine download magnet" href="{{{{DOWNLOAD}}}}">{{{{icon:apple}}}}<span class="btn__two">Download free<small>14 days, no account</small></span></a>
      <a class="btn btn--big btn--ghost buy magnet" href="{{{{FOREVER}}}}">Textlore Forever, $79</a>
    </div>
  </div>
</section>

</main>
"""
    url = f"https://textlore.app/guides/{p['slug']}/"
    crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Textlore", "item": "https://textlore.app/"},
        {"@type": "ListItem", "position": 2, "name": "Guides", "item": "https://textlore.app/guides/"},
        {"@type": "ListItem", "position": 3, "name": p["title"], "item": url}]}
    article = {"@context": "https://schema.org", "@type": "Article", "headline": p["title"], "description": p["desc"], "url": url,
               "dateModified": "2026-11-24", "author": {"@type": "Organization", "name": "The Useful Media Co."},
               "publisher": {"@type": "Organization", "name": "The Useful Media Co.", "url": "https://theusefulmedia.com/"}}
    faqld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": strip(a)}} for q, a in p["faq"]]}
    offer = {"@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Textlore", "operatingSystem": "macOS 26 or later",
             "applicationCategory": "UtilitiesApplication", "url": "https://textlore.app/",
             "offers": [{"@type": "Offer", "name": "Textlore Forever", "price": "79", "priceCurrency": "USD"}]}
    head = f'<meta property="og:url" content="{url}">\n<meta property="og:image:alt" content="Textlore: your whole texting life, on your Mac. Tree rings, one for every year of texting.">\n'
    for ld in (crumbs, article, faqld, offer):
        head += '<script type="application/ld+json">\n' + json.dumps(ld, ensure_ascii=False) + "\n</script>\n"
    (PAGES / f"guide-{p['slug']}.html").write_text(body)
    (PAGES / f"guide-{p['slug']}-head.txt").write_text(head)
    print("wrote", p["slug"])


def strip(html):
    import re
    return re.sub(r"<[^>]+>", "", html)


P = []

# ---------- Evidence and lawyers (5) ----------
P.append(dict(
    slug="save-text-messages-as-evidence-mac",
    title="How to save text messages as evidence on a Mac (step by step)",
    desc="Save iMessages and texts as evidence from your Mac: stop them being deleted, keep the originals, and export a dated PDF with phone numbers and times on every message.",
    h1="How to save text messages as evidence on a Mac,", em="before anything is lost.",
    lede="If texts might matter in a dispute, the first job is to stop them disappearing. The second is a clean copy that shows who sent each message and when. Here is the order to do it in.",
    quick="Turn off auto-delete in Messages on your Mac and iPhone first. Keep the phone and the original conversation. Then export the conversation as a dated PDF that shows the phone number and time of every message. " + LEGAL,
    table=[("Print from Messages", "A short chat, free", "No time on every message."),
           ("Screenshots", "A few key messages", "Easy to question. Slow for long chats."),
           ("Textlore export", "A dated PDF with numbers and times", "Paid app after a 14-day trial.")],
    sections=[
        dict(id="stop", toc="1. Stop deletion", icon="shield", h2="1. Stop the texts being deleted", html="""
  <p>Messages can delete old texts on its own. Switch that off on every device before you do anything else.</p>
  <ol>
    <li>On your Mac, open <strong>Messages &gt; Settings &gt; General</strong> and set <strong>Keep messages</strong> to <strong>Forever</strong>.</li>
    <li>On your iPhone, open <strong>Settings &gt; Apps &gt; Messages &gt; Keep Messages</strong> and choose <strong>Forever</strong>.</li>
    <li>Leave <strong>Messages in iCloud</strong> on, so the Mac has the same history as the phone.</li>
  </ol>
  <p>Don't delete the conversation, and don't edit or crop out messages you don't like. A complete record is worth more than a tidy one.</p>"""),
        dict(id="what", toc="2. What it must show", icon="doc", h2="2. Know what a useful copy shows", html="""
  <ul>
    <li><strong>Who sent each message.</strong> The phone number or email, not only a contact name.</li>
    <li><strong>When.</strong> The date and time of every message.</li>
    <li><strong>Context.</strong> The messages before and after the key ones.</li>
    <li><strong>Photos and files</strong> that were part of the conversation.</li>
  </ul>
  <p>Messages on a Mac prints times only between groups of messages, and shows names in place of numbers. That's why a plain printout often falls short.</p>"""),
        dict(id="export", toc="3. Export a dated PDF", icon="export", h2="3. Export a dated PDF with Textlore", html=f"""
  <p>{TEXTLORE_FACTS}</p>
  <ol>
    <li><strong>Install Textlore</strong> and switch on Full Disk Access when it asks. About 100,000 messages import in under a minute.</li>
    <li><strong>Open the conversation</strong> and choose the date range, or press <kbd>⇧⌘E</kbd> for the whole chat.</li>
    <li><strong>Pick PDF and the plain transcript.</strong> Turn on timestamps and date headings, and switch on phone numbers and emails. They are hidden by default.</li>
    <li><strong>Check the live preview</strong>, then export. Send the PDF to your lawyer, or print it.</li>
  </ol>
  {shot('export-options', 'The Textlore export sheet with timestamps, names and a live preview of the PDF.')}
  <p>Export the same range as CSV too if your lawyer wants to sort the messages in Numbers or Excel.</p>"""),
        dict(id="keep", toc="4. Keep a copy safe", icon="keep", h2="4. Keep a second copy safe", html="""
  <ul>
    <li>Save the PDF in 2 places, for example your Mac and an external drive.</li>
    <li>Keep Textlore's archive on. It keeps its own copy of every message and every photo that reaches the Mac, even if Messages later deletes or offloads them.</li>
    <li>Note the date you made the export in the file name, like <em>Texts with J, Jan to Nov 2026, exported 24 Nov.pdf</em>.</li>
  </ul>"""),
    ],
    faq=[("Can I use text messages as evidence?", "Often yes, but it depends on the court and country, and the other side can challenge them. Ask your lawyer what format they need."),
         ("Do screenshots count as evidence?", "They can, but cropped images are easy to question. A full export that shows numbers and times is harder to dispute."),
         ("Will exporting change the messages?", "No. Textlore only reads a copy of your Messages database. It never edits, sends or deletes a message."),
         ("What if I already deleted some texts?", "Check Messages on every device you use, and Recently Deleted in Messages, which keeps deleted texts for up to 30 days. Your lawyer can advise on other ways to get them."),
         ("Does my data leave my Mac?", "No. Textlore makes no network calls with your messages. The export file stays wherever you save it.")],
    cta="Export a dated, complete record in a few minutes.",
    final="Keep the record <em>complete and dated.</em>",
))

P.append(dict(
    slug="send-text-messages-to-a-lawyer",
    title="How to send text messages to your lawyer from a Mac",
    desc="Your lawyer asked for the texts. Send iMessages as a dated PDF with phone numbers and times, plus a CSV they can sort, straight from your Mac.",
    h1="Your lawyer asked for the texts.", em="Here is how to send them.",
    lede="Forwarding screenshots one by one is slow, and they rarely show what a lawyer needs. A single dated file is faster for you and cheaper for them to review.",
    quick="Ask your lawyer which dates and people they need, and whether they want PDF or a spreadsheet. Export just that range with times and phone numbers on, and send it as 1 file. " + LEGAL,
    table=[("Screenshots by email", "1 or 2 messages", "No numbers, slow, easy to question."),
           ("Print to PDF in Messages", "A short chat", "Times only between groups. No date range."),
           ("Textlore PDF plus CSV", "Long chats, date ranges, group chats", "Paid app after a 14-day trial.")],
    sections=[
        dict(id="ask", toc="1. Ask first", icon="mail", h2="1. Ask your lawyer 4 things", html="""
  <ol>
    <li>Which conversations, and which people?</li>
    <li>Which dates?</li>
    <li>PDF to read, a spreadsheet to sort, or both?</li>
    <li>Do they need the phone itself as well?</li>
  </ol>
  <p>Sending only what they ask for keeps their review time, and your bill, down.</p>"""),
        dict(id="export", toc="2. Export the range", icon="export", h2="2. Export exactly that range", html=f"""
  <p>{TEXTLORE_FACTS}</p>
  <ol>
    <li>Open the conversation in Textlore and choose the start and end dates.</li>
    <li>Choose PDF, plain transcript, timestamps on, date headings on, names in full, phone numbers and emails on.</li>
    <li>Export once more as CSV if they want to sort or filter.</li>
  </ol>
  {shot('selecting', 'Selecting a run of messages in Textlore with Shift-click before exporting.')}
  <p>To send only a few key messages with context, click Select, Shift-click to pick a run, and press <kbd>⌘E</kbd>.</p>"""),
        dict(id="send", toc="3. Send it safely", icon="lock", h2="3. Send it safely", html="""
  <ul>
    <li>Use the secure upload link your lawyer's office gives you, if they have one.</li>
    <li>Name the file clearly: who, which dates, and the day you exported it.</li>
    <li>Keep your own copy, and keep the original conversation and phone.</li>
  </ul>"""),
    ],
    faq=[("What format do lawyers want for text messages?", "Most ask for a PDF that shows who sent each message and when. Some also want a CSV to sort. Ask yours first."),
         ("Can I send a group chat?", "Yes. Textlore exports group chats with every sender's name, and their number if you switch numbers on."),
         ("Can I leave out other people's numbers?", "Yes. Phone numbers and emails are hidden by default, so you choose when to show them."),
         ("Do I need to send photos too?", "Ask your lawyer. Textlore can include photos full size, small, or not at all."),
         ("Is Textlore a forensic tool?", "No. It makes clear, dated copies from your own Mac. If your lawyer needs a forensic extraction from the phone, they will use a specialist.")],
    cta="Send your lawyer 1 clear, dated file.",
    final="1 file, <em>dated and complete.</em>",
))

P.append(dict(
    slug="text-messages-for-divorce-custody",
    title="How to save text messages for a divorce or custody case",
    desc="Save co-parenting and divorce texts from your Mac: keep every message, export a dated timeline by date range, and find the messages about pickups, payments and promises.",
    h1="Saving text messages for a divorce or custody case,", em="calmly and completely.",
    lede="In family cases, texts about pickups, payments and promises often matter. A full, dated record helps your lawyer, and it saves you scrolling through years of messages at a hard time.",
    quick="Keep every message, turn off auto-delete, and export the co-parenting conversation as a dated PDF for the period your lawyer asks about. Use search to pull out messages about specific dates, payments or pickups. " + LEGAL,
    table=[("Scroll and screenshot", "A handful of messages", "Hours of scrolling. Easy to miss things."),
           ("Co-parenting app", "Future messages", "Doesn't cover texts you already sent."),
           ("Textlore", "Years of existing texts, by date and topic", "Paid app after a 14-day trial.")],
    sections=[
        dict(id="keep", toc="1. Keep everything", icon="shield", h2="1. Keep everything, from today", html="""
  <ul>
    <li>Set <strong>Keep messages</strong> to <strong>Forever</strong> in Messages on your Mac and iPhone.</li>
    <li>Don't delete or edit anything, even messages that make you look bad. Your lawyer needs the whole picture.</li>
    <li>Keep Textlore's archive on, so photos and messages stay saved on your Mac even if Messages offloads them.</li>
  </ul>"""),
        dict(id="find", toc="2. Find what matters", icon="search", h2="2. Find the messages that matter", html="""
  <p>Textlore searches years of texts as you type. Filters help you get to the point:</p>
  <ul>
    <li><kbd>from:</kbd> a person, and a date like <em>after:March 2025</em>.</li>
    <li>Words like <em>pickup</em>, <em>school</em>, <em>payment</em>, <em>weekend</em> or <em>doctor</em>.</li>
    <li><strong>Promises</strong> lists commitments made in your chats, like "I'll pay you back Friday", with the date.</li>
  </ul>
  {shot}""".replace("{shot}", shot('search', 'Textlore search results with matching words highlighted in amber.'))),
        dict(id="export", toc="3. Export a timeline", icon="export", h2="3. Export a dated timeline", html="""
  <ol>
    <li>Open the conversation and choose the period your lawyer asked about.</li>
    <li>Export as PDF with timestamps, date headings and phone numbers on.</li>
    <li>Export as CSV too, if your lawyer wants to sort by date.</li>
  </ol>
  <p>Textlore exports WhatsApp chats you import as well, if your co-parent also messages you there.</p>"""),
    ],
    faq=[("How far back can Textlore go?", "As far as your Messages history on the Mac goes. With Messages in iCloud, that is usually years."),
         ("Can I export only messages about the children?", "Search for the words that matter, then select those messages with their context and export them. Your lawyer may still want the full conversation."),
         ("Will the other person know I exported the texts?", "No. Textlore never sends anything and makes no network calls with your messages."),
         ("Can I include photos they sent?", "Yes, when the photos are on your Mac. Textlore can include them full size or small."),
         ("Is this legal advice?", "No. It is practical help. Your lawyer decides what to use and how.")],
    cta="Turn years of texts into a dated record, calmly.",
    final="A full record, <em>without the scrolling.</em>",
))

P.append(dict(
    slug="document-harassing-text-messages",
    title="How to keep a record of harassing text messages on a Mac",
    desc="Document harassing or threatening texts: keep them instead of deleting, block safely, and export a dated record with the sender's number for the police, a lawyer or a court.",
    h1="How to keep a record of harassing text messages,", em="without reading them again and again.",
    lede="Deleting abusive texts is the natural reaction, but a record is what police, lawyers and courts usually ask for. You can keep the record without having to scroll through it.",
    quick="Don't delete the messages. Block the sender if you want, but keep the conversation. Export it as a dated PDF with the sender's number on every message, and store the file somewhere safe. If you are in danger, contact the police now.",
    table=[("Delete and block", "Peace of mind today", "The record is gone."),
           ("Screenshots", "A few messages", "No number on each one. Slow."),
           ("Keep, block, export with Textlore", "A dated record with the number", "Paid app after a 14-day trial.")],
    sections=[
        dict(id="safe", toc="1. Stay safe first", icon="shield", h2="1. Stay safe first", html="""
  <p>If you feel unsafe, call your local emergency number. Police can tell you what they need from the texts.</p>
  <p>You can block the sender in Messages and still keep what they already sent. Blocking stops new messages. It does not delete the old ones.</p>"""),
        dict(id="keep", toc="2. Keep the texts", icon="keep", h2="2. Keep the texts, out of sight", html="""
  <ul>
    <li>Set <strong>Keep messages</strong> to <strong>Forever</strong> on your Mac and iPhone.</li>
    <li>Don't reply, and don't delete. Mute the conversation if you don't want to see it.</li>
    <li>Install Textlore and leave its archive on. It keeps a copy of every message on your Mac, so the record survives even if the conversation is deleted later.</li>
  </ul>"""),
        dict(id="export", toc="3. Export the record", icon="export", h2="3. Export a dated record", html=f"""
  <p>{TEXTLORE_FACTS}</p>
  <ol>
    <li>Open the conversation in Textlore. You don't need to read it: choose the date range or press <kbd>⇧⌘E</kbd> for all of it.</li>
    <li>Choose PDF, timestamps on, phone numbers and emails on.</li>
    <li>Save the PDF in 2 safe places. Add new messages by exporting again later.</li>
  </ol>
  {shot('export-confirmation', 'The Textlore export confirmation showing how many messages were exported and where the file was saved.')}"""),
    ],
    faq=[("Should I delete harassing texts?", "Most guidance says keep them, because they are your record. You can block and mute the sender so you don't see new ones."),
         ("Does blocking delete old messages?", "No. Blocking stops new messages. The old conversation stays until you delete it."),
         ("Can I export messages from several numbers?", "Yes. Export each conversation, or search across all chats with a date range and export the results you select."),
         ("Can the sender see that I exported?", "No. Textlore only reads your Mac's copy and sends nothing."),
         ("Who should I give the record to?", "The police, a lawyer, your employer or school, depending on the case. They will tell you what format they need.")],
    cta="Keep the record, without living in it.",
    final="Keep the record. <em>Not the stress.</em>",
))

P.append(dict(
    slug="text-messages-for-small-claims-court",
    title="Text messages for small claims court: landlord, contractor and buyer disputes",
    desc="Use text messages in a small claims or deposit dispute: find the messages about money, dates and promises, and export them as a dated PDF from your Mac.",
    h1="Text messages for small claims court,", em="landlords, contractors and buyers.",
    lede="Deposits, unpaid invoices, a job left half done: the agreement often lives in a text thread. Here is how to find the messages that prove it and hand them over cleanly.",
    quick="Search the conversation for amounts, dates and words like deposit, paid or refund. Export those messages with their context as a dated PDF with the other person's number shown. Bring the full conversation too, in case it's asked for. " + LEGAL,
    table=[("Screenshots", "1 clear agreement", "No number or time on each one."),
           ("Print from Messages", "A short thread", "Prints everything from your scroll point."),
           ("Textlore", "Find money and dates, export a range", "Paid app after a 14-day trial.")],
    sections=[
        dict(id="find", toc="1. Find the proof", icon="search", h2="1. Find the messages that prove it", html="""
  <ul>
    <li>Search for amounts like <em>$1,200</em> or <em>1200</em>, and words like <em>deposit</em>, <em>paid</em>, <em>refund</em>, <em>invoice</em> or <em>finish</em>.</li>
    <li>Use <strong>Promises</strong> to list commitments with dates, like "I'll return the deposit by the 15th".</li>
    <li>Use <kbd>has:photo</kbd> to find the photos of the damage or the work.</li>
  </ul>
  {shot}""".replace("{shot}", shot('promises', 'Textlore Promises listing commitments from chats with their dates.'))),
        dict(id="export", toc="2. Export it", icon="export", h2="2. Export them with context", html="""
  <ol>
    <li>Select the key messages and the ones around them with Shift-click, then press <kbd>⌘E</kbd>.</li>
    <li>Choose PDF, timestamps on, phone numbers on, photos full size.</li>
    <li>Export the whole conversation as a second file, in case the court or the other side asks for it.</li>
  </ol>"""),
        dict(id="bring", toc="3. Bring it", icon="doc", h2="3. What to bring", html="""
  <ul>
    <li>The printed PDF, with a copy for the other side if your court asks for one.</li>
    <li>Your phone, with the original conversation still on it.</li>
    <li>Any receipts, contracts or bank records that match the messages.</li>
  </ul>"""),
    ],
    faq=[("Are text messages enough to win a small claims case?", "They can help a lot, but the judge looks at all the evidence. Courts and countries differ, so check your court's guidance."),
         ("Can I export only the messages about money?", "Yes. Search, select the messages with their context, and export the selection."),
         ("What if the landlord texted from 2 numbers?", "Export each conversation, or search across all chats for the dates you need."),
         ("Can I include photos?", "Yes, when they are on your Mac. Textlore includes them in the PDF."),
         ("Does Textlore work with WhatsApp?", "Yes. Import a WhatsApp chat export and search and export it the same way.")],
    cta="Find the proof in minutes, not evenings.",
    final="The proof is in the thread. <em>Find it fast.</em>",
))

# ---------- Loved ones (3) ----------
P.append(dict(
    slug="save-text-messages-from-someone-who-died",
    fv="Their words matter for life.",
    title="How to save text messages from someone who died",
    desc="Save a loved one's text messages, photos and voice messages on your Mac so they are never lost, then keep them as a PDF or a keepsake you can read for years.",
    h1="How to save text messages from someone who died,", em="so they are never lost.",
    lede="Their texts can feel like the last place you hear their voice. Phones get replaced and settings delete old messages, so it's worth saving them properly, once, when you're ready.",
    quick="Set Messages to keep messages forever on your Mac and iPhone, so nothing deletes on its own. Then save the conversation as a PDF with photos, and keep a copy of the voice messages and pictures. Do it when you feel able. There is no rush once auto-delete is off.",
    table=[("Leave them on the phone", "Today", "Lost when the phone is replaced or reset."),
           ("Screenshots", "A few favourite messages", "Slow, and misses voice messages."),
           ("Textlore", "The whole conversation, photos and all", "Paid app after a 14-day trial.")],
    thead=("Way", "Good for", "Catch"),
    sections=[
        dict(id="first", toc="1. The 1 thing to do now", icon="shield", h2="1. The 1 thing to do now", html="""
  <p>Make sure nothing deletes on its own. That is all that needs doing today.</p>
  <ol>
    <li>On your iPhone: <strong>Settings &gt; Apps &gt; Messages &gt; Keep Messages &gt; Forever</strong>.</li>
    <li>On your Mac: <strong>Messages &gt; Settings &gt; General &gt; Keep messages &gt; Forever</strong>.</li>
  </ol>
  <p>Don't delete the conversation, even by accident while tidying. Muting it is fine.</p>"""),
        dict(id="save", toc="2. Save the conversation", icon="keep", h2="2. Save the whole conversation", html=f"""
  <p>{TEXTLORE_FACTS}</p>
  <ol>
    <li>Install Textlore and leave its archive on. It keeps its own copy of every message and every photo or voice message that is on your Mac.</li>
    <li>Open their conversation and press <kbd>⇧⌘E</kbd>. Choose PDF with the bubble style, so it looks like your phone, and photos full size.</li>
    <li>Save the PDF in 2 places, for example your Mac and iCloud Drive or a USB drive.</li>
  </ol>
  {shot('main-window', 'A conversation open in Textlore, with years of messages kept on the Mac.')}"""),
        dict(id="family", toc="3. Share with family", icon="person", h2="3. Share with family, gently", html="""
  <ul>
    <li>Export a shorter PDF of a favourite year or a special day to share with family.</li>
    <li>Leave out phone numbers, which Textlore hides by default.</li>
    <li>If you want a printed book, see <a href="/guides/print-text-messages-as-a-book/">how to turn texts into a keepsake book</a>.</li>
  </ul>"""),
    ],
    faq=[("Will their messages disappear if their phone number is cancelled?", "Messages already on your devices stay. What deletes them is your Keep Messages setting, or deleting the conversation. Set it to Forever."),
         ("Can I get messages from their phone or iCloud?", "That depends on Apple's rules. Apple's Digital Legacy lets a chosen Legacy Contact request access. Textlore works with the messages on your own Mac."),
         ("Can I save their voice messages?", "Yes, the ones on your Mac. Textlore keeps a copy in its archive, and you can find them in Attachments. See our guide to <a href='/guides/save-photos-and-voice-messages-from-texts/'>saving photos and voice messages</a>."),
         ("Can I do this later?", "Yes. Once Keep Messages is set to Forever, nothing deletes on its own. Save the conversation when you feel ready."),
         ("Does anything get uploaded?", "No. Textlore never sends your messages anywhere.")],
    cta="Keep their words, safely, on your Mac.",
    final="Their words, <em>kept for good.</em>",
))

P.append(dict(
    slug="print-text-messages-as-a-book",
    fv="A keepsake should outlast your Mac.",
    title="How to turn a loved one's text messages into a keepsake book",
    desc="Make a printed book or PDF keepsake of text messages from a parent, partner or friend: export the chat with photos from your Mac in a clean bubble style, then print it.",
    h1="How to turn text messages into a keepsake book,", em="from your Mac.",
    lede="Years of good mornings, jokes and photos make a beautiful book. You can make a clean PDF from your Mac in a few minutes and print it at home or with a photo book service.",
    quick="Export the conversation from Textlore as a PDF in bubble style, with date headings and photos full size. Pick a year or the whole chat. Print it at home, or upload the PDF to a print-on-demand book service.",
    table=[("Screenshot every screen", "A short chat", "Hundreds of images to arrange."),
           ("Print from Messages", "A few weeks", "No date range, photos hit and miss."),
           ("Textlore PDF", "Years, with photos and dates", "Paid app after a 14-day trial.")],
    thead=("Way", "Good for", "Catch"),
    sections=[
        dict(id="choose", toc="1. Choose what goes in", icon="rings", h2="1. Choose what goes in", html="""
  <ul>
    <li><strong>The whole conversation</strong> for a full record, or <strong>1 year</strong> for a lighter book.</li>
    <li><strong>A few special days</strong>: select them with Shift-click and export only those.</li>
    <li>Use search to find favourites, like <em>love you</em>, <em>proud of you</em> or a nickname.</li>
  </ul>"""),
        dict(id="export", toc="2. Make the PDF", icon="export", h2="2. Make the PDF", html=f"""
  <ol>
    <li>Open the conversation in Textlore and pick the dates.</li>
    <li>Choose PDF, <strong>bubble style</strong>, light, date headings on, photos full size, phone numbers off.</li>
    <li>Check the live preview, then export.</li>
  </ol>
  {shot('export-options', 'The Textlore export options with a bubble-style preview of the conversation.')}"""),
        dict(id="print", toc="3. Print it", icon="doc", h2="3. Print it", html="""
  <ul>
    <li><strong>At home:</strong> print double-sided and put it in a ring binder or a simple folder.</li>
    <li><strong>As a book:</strong> most print-on-demand services take a PDF upload. Check their page size, and choose a matching size in the print dialog.</li>
    <li>Keep the PDF too. A file outlasts paper.</li>
  </ul>"""),
    ],
    faq=[("Can I include photos and stickers?", "Photos that are on your Mac go in. Textlore keeps its own copy of photos from the day you install it."),
         ("Will phone numbers show in the book?", "Not unless you switch them on. They are hidden by default."),
         ("Can I make a book from a group chat?", "Yes. Each person's name shows above their messages."),
         ("Can I make a book from WhatsApp messages?", "Yes. Import the WhatsApp chat export into Textlore and export it the same way."),
         ("How long does it take?", "A few minutes for the PDF. Printing depends on the service you choose.")],
    cta="Make a keepsake PDF in a few minutes.",
    final="Years of texts, <em>in your hands.</em>",
))

P.append(dict(
    slug="save-photos-and-voice-messages-from-texts",
    fv="Their words matter for life.",
    title="How to save the photos and voice messages a loved one sent you",
    desc="Find and save every photo, video and voice message someone sent you in iMessage on your Mac, and keep a copy that survives Messages offloading them to iCloud.",
    h1="Save the photos and voice messages they sent you,", em="before Messages clears them.",
    lede="Messages quietly moves older photos and voice messages to iCloud to save space, and some never come back the same. Here's how to find them all and keep your own copy.",
    quick="Open the conversation's details in Messages and save the photos you see. For everything at once, Textlore shows every photo, video and voice message from that person in 1 grid, and keeps its own copy of each file that is on your Mac.",
    table=[("Messages details view", "Recent photos", "Old files may be in iCloud only."),
           ("Drag to Finder 1 by 1", "A few files", "Slow for years of photos."),
           ("Textlore Attachments", "Every file from 1 person, kept", "Paid app after a 14-day trial.")],
    thead=("Way", "Good for", "Catch"),
    sections=[
        dict(id="messages", toc="1. In Messages", icon="bubble", h2="1. Save them in Messages", html="""
  <ol>
    <li>Open the conversation, click the name at the top, and open <strong>Photos</strong>.</li>
    <li>Select the photos you want and drag them into a folder in Finder.</li>
    <li>For a voice message, Control-click it and choose <strong>Save to Downloads</strong> if your Mac offers it, or keep it in the conversation.</li>
  </ol>
  <p>Old files with a cloud badge are stored in iCloud. Open them once so the Mac downloads them.</p>"""),
        dict(id="textlore", toc="2. All at once", icon="photo", h2="2. Find every file at once with Textlore", html=f"""
  <p>{TEXTLORE_FACTS}</p>
  <ul>
    <li><strong>Attachments</strong> shows every photo, video, voice note and file in a grid, by person and date.</li>
    <li>The archive copies each file into Textlore's own folder the moment it's on your Mac, so it stays even if Messages later offloads it.</li>
    <li>Files that are only in iCloud show as a placeholder with an <strong>Open in Messages</strong> button, so you can bring them back.</li>
  </ul>
  {shot('attachments', 'The Textlore Attachments grid showing photos and files from one person by date.')}"""),
        dict(id="backup", toc="3. Back them up", icon="keep", h2="3. Back them up", html="""
  <ul>
    <li>Copy the folder to an external drive or iCloud Drive.</li>
    <li>Turn on Time Machine if you haven't, so your Mac and Textlore's archive are both backed up.</li>
  </ul>"""),
    ],
    faq=[("Why do old photos in Messages look blurry or missing?", "With Messages in iCloud, your Mac removes local copies when space runs low and keeps a small preview. Opening the photo downloads it again."),
         ("Does Textlore download photos from iCloud?", "No. It keeps every file that is on your Mac. Use Open in Messages to bring an iCloud-only file back, and Textlore keeps it from then on."),
         ("Can I save voice messages?", "Yes, the ones on your Mac. Textlore lists them with the other attachments and keeps a copy."),
         ("Does Textlore keep files after I delete the conversation?", "Its archive keeps what it has already saved, unless you switch the archive off or delete Textlore's data."),
         ("Does any of this leave my Mac?", "No. Everything stays on your Mac.")],
    cta="Keep every photo and voice message they sent.",
    final="Every photo, <em>every voice.</em>",
))

# ---------- General (2) ----------
P.append(dict(
    slug="keep-text-messages-forever-mac",
    fv="Your history grows every year.",
    title="How to keep your text messages forever on a Mac",
    desc="Stop Messages deleting old texts and photos: set Keep Messages to Forever, understand Messages in iCloud, and keep your own archive of every message on your Mac.",
    h1="How to keep your text messages forever,", em="on your Mac.",
    lede="Messages can delete texts after 30 days or a year, and Messages in iCloud removes local copies of photos when space runs low. Here are the settings that stop it, and a copy that's yours.",
    quick="Set Keep Messages to Forever on your Mac and iPhone. Leave Messages in iCloud on. For a copy that never depends on iCloud or a setting, keep an archive with Textlore and back up your Mac with Time Machine.",
    table=[("Keep Messages: Forever", "Stops auto-delete", "Doesn't stop space-saving offloads."),
           ("Time Machine", "A full Mac backup", "Hard to browse old messages."),
           ("Textlore archive", "Every message and file, searchable", "Paid app after a 14-day trial.")],
    thead=("Way", "Does", "Catch"),
    sections=[
        dict(id="settings", toc="1. The settings", icon="shield", h2="1. Change 2 settings", html="""
  <ol>
    <li>Mac: <strong>Messages &gt; Settings &gt; General &gt; Keep messages &gt; Forever</strong>.</li>
    <li>iPhone: <strong>Settings &gt; Apps &gt; Messages &gt; Keep Messages &gt; Forever</strong>.</li>
  </ol>
  <p>Check the same setting on any iPad too. With Messages in iCloud, deleting on 1 device deletes everywhere.</p>"""),
        dict(id="icloud", toc="2. iCloud catch", icon="cloud", h2="2. Know the iCloud catch", html="""
  <p>With Messages in iCloud on, your Mac may remove local copies of old photos and files to save space. They stay in iCloud, but only while your iCloud account and storage plan stay the same.</p>"""),
        dict(id="archive", toc="3. Your own archive", icon="keep", h2="3. Keep your own archive", html=f"""
  <p>{TEXTLORE_FACTS}</p>
  <ul>
    <li>The archive keeps every message and every attachment file it finds, even after Messages deletes or offloads them.</li>
    <li>It respects "Delete verification codes after use", so 1-time codes are not kept.</li>
    <li>Search years of texts in milliseconds, and export any conversation to PDF, HTML, text, Markdown or CSV.</li>
  </ul>
  {shot('lore', 'Textlore Your Lore page with tree rings, one ring for every year of texting.')}"""),
    ],
    faq=[("Does Messages delete old texts by default?", "Keep Messages can be set to 30 days, 1 year or Forever. Check it, because some setups use a shorter time."),
         ("Is Messages in iCloud a backup?", "Not quite. It syncs. Delete a conversation on 1 device and it goes on all of them."),
         ("How much space does Textlore's archive use?", "It depends on your photos. Textlore shows the archive's size and warns you when your Mac is low on space."),
         ("Can I switch the archive off?", "Yes, in Settings > Archive."),
         ("What does Textlore Forever mean?", "It is a licence that includes every future major version of Textlore, so your archive app stays current for years.")],
    cta="Keep every message, for good.",
    final="Your texts, <em>kept for good.</em>",
))

P.append(dict(
    slug="save-text-messages-before-switching-phones",
    fv="Your history grows every year.",
    title="How to save your text messages before you switch phones",
    desc="Switching from iPhone to Android, or to a new iPhone? Save your iMessages to your Mac first, export the ones that matter, and turn off iMessage so new texts reach you.",
    h1="Save your text messages before you switch phones,", em="not after.",
    lede="A new iPhone usually brings your messages over. A move to Android doesn't. Either way, a copy on your Mac means years of texts don't depend on 1 transfer going right.",
    quick="Before you switch, make sure Messages in iCloud has synced to your Mac. Keep a copy of the history with Textlore or export the conversations that matter. If you move to Android, turn off iMessage first so texts reach your new phone.",
    table=[("Quick Start to a new iPhone", "iPhone to iPhone", "Nothing to read on a Mac if it fails."),
           ("Android transfer tools", "iPhone to Android", "Often skips photos and group chats."),
           ("Textlore on your Mac", "A searchable copy you keep", "Paid app after a 14-day trial.")],
    sections=[
        dict(id="sync", toc="1. Sync to your Mac", icon="laptop", h2="1. Get everything onto your Mac", html="""
  <ol>
    <li>On the iPhone: <strong>Settings &gt; your name &gt; iCloud &gt; Show All</strong>, and turn on <strong>Messages in iCloud</strong>.</li>
    <li>On the Mac: <strong>Messages &gt; Settings &gt; iMessage</strong>, tick <strong>Enable Messages in iCloud</strong>, and click <strong>Sync Now</strong>.</li>
    <li>Wait until old conversations show on the Mac. A big history can take hours.</li>
  </ol>"""),
        dict(id="copy", toc="2. Keep a copy", icon="keep", h2="2. Keep a copy that's yours", html=f"""
  <p>{TEXTLORE_FACTS}</p>
  <ul>
    <li>Install Textlore and let it import. Its archive keeps every message and file on your Mac, whatever happens on the new phone.</li>
    <li>Export the conversations that matter most as PDF, so you can read them anywhere.</li>
  </ul>
  {shot('quick-search', 'Textlore quick search panel finding an old message from anywhere on the Mac.')}"""),
        dict(id="android", toc="3. Moving to Android", icon="out", h2="3. Moving to Android? Turn off iMessage", html="""
  <ul>
    <li>Before you move your SIM, open <strong>Settings &gt; Apps &gt; Messages</strong> and turn off <strong>iMessage</strong>.</li>
    <li>If you already switched, use Apple's Deregister iMessage page with your phone number.</li>
    <li>Otherwise texts from iPhone friends can keep going to iMessage and never reach you.</li>
  </ul>"""),
    ],
    faq=[("Will my texts move to Android?", "Some transfer tools move texts, but often without photos, reactions or group chats. A copy on your Mac is a safe extra."),
         ("Do I need to keep my old iPhone?", "Keep it until you've checked that everything is on your Mac and the new phone."),
         ("Can I still search old iMessages after moving to Android?", "Yes, on your Mac with Textlore, as long as the history is on the Mac."),
         ("What about WhatsApp?", "Export your WhatsApp chats and import them into Textlore to search them in the same place."),
         ("Is a Mac needed?", "Yes. Textlore is a Mac app that reads the Messages history on your Mac.")],
    cta="Switch phones without losing a single text.",
    final="New phone. <em>Same history.</em>",
))

if __name__ == "__main__":
    for p in P:
        page(p)
    print(len(P), "pages")
