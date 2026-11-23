"""Textlore price change approved by Raja 24 Nov 2026 (option B):
$20 launch price ends 1 Dec 2026, then $29 from 2 Dec, then $35 and $39 after every 20 sales. Forever stays $79.

  python3 tools/price_switch.py phase1   # now: replace the '15 licences left' ladder copy with the 1 Dec end date
  python3 tools/price_switch.py phase2   # 2 Dec: $20 becomes $29 everywhere

Edits built pages and page sources in place (a full rebuild would drop hand edits on index.html).
"""
import glob, sys, re

P1 = [
    ("15 licences left at $20. Then $25, rising $5 every 20 sales up to $39.", "$20 until 1 December. Then $29, rising to $35 and $39 after every 20 sales."),
    ("Free for 14 days, then $20, 15 left at this price", "Free for 14 days, then $20 until 1 Dec"),
    ("$20, 15 left at this price", "$20 until 1 Dec"),
    ("15 left at $20, then $25", "$20 until 1 Dec, then $29"),
    ("$20 once for the next 15 licences, then $25", "$20 once until 1 December, then $29"),
    ("$20 for the next 15 licences, then $25", "$20 until 1 December, then $29"),
    ("$20 for the next 15 licences", "$20 until 1 December"),
    ("Textlore's price rises $5 after every 20 sales, up to $39.", "Textlore's price goes to $29 on 2 December, then $35 and $39."),
]
P2 = [
    ("$20 until 1 December. Then $29, rising to $35 and $39 after every 20 sales.", "$29 today. Then $35 and $39, rising after every 20 sales."),
    ("Free for 14 days, then $20 until 1 Dec", "Free for 14 days, then $29 once"),
    ("$20 until 1 Dec, then $29", "$29, then $35 after 20 sales"),
    ("$20 once until 1 December, then $29", "$29 once"),
    ("$20 until 1 December, then $29", "$29"),
    ("$20 until 1 December", "$29"),
    ("$20 until 1 Dec", "$29 once"),
    ("Textlore's price goes to $29 on 2 December, then $35 and $39.", "Textlore's price rises to $35 and $39 after every 20 sales."),
    ("Buy Textlore, $20", "Buy Textlore, $29"),
    ("Buy $20", "Buy $29"),
    ("Or the standard licence, $20", "Or the standard licence, $29"),
    ("What you earn on a $20 licence today", "What you earn on a $29 licence today"),
    ("$6 on today's $20 licence", "$8.70 on today's $29 licence"),
    ("Worked out on today's $20 price", "Worked out on today's $29 price"),
    (">$6</b>", ">$8.70</b>"),
    ("var cut=6;", "var cut=8.7;"),
    (">$20<", ">$29<"),
    ("then keep it for $20.", "then keep it for $29."),
    ('"price":"20"', '"price":"29"'),
]
phase = sys.argv[1]
reps = P1 if phase == "phase1" else P2
total = 0
for f in glob.glob("**/*.html", recursive=True) + glob.glob("tools/pages/*.txt") + ["llms.txt"]:
    try: s = open(f).read()
    except FileNotFoundError: continue
    o = s
    for a, b in reps:
        if phase == "phase2" and a.startswith(">$20<") and "/affiliates/" in f: continue
        s = s.replace(a, b)
    if s != o:
        open(f, "w").write(s); total += 1
print(phase, "changed", total, "files")

if phase == "phase2":
    import json
    L = json.load(open("tools/ladder.json"))
    L.update(price=29, next=35, left=20, note=L["note"] + " Changed 2 Dec 2026 (Raja, option B on 24 Nov): $29, then $35, then $39.")
    L["forever"] += " From 2 Dec 2026 the Forever additional amount is $50 ($29 + $50 = $79)."
    json.dump(L, open("tools/ladder.json", "w"), indent=2)
