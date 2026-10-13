"""Logs the running download count of every release file to stats/downloads.csv.

    python3 tools/downloads.py

Textlore.dmg is what the site's Download button gives (new people trying Textlore).
Textlore-<version>.dmg is what Sparkle fetches (existing users updating).
One row per file per day: date, tag, file, total downloads so far.
The app itself sends nothing; these are GitHub's public counts.
"""
import csv, datetime, json, os, urllib.request
from pathlib import Path

REPO = "theusefulmedia/textlore-site"
OUT = Path(__file__).resolve().parent.parent / "stats" / "downloads.csv"


def main():
    req = urllib.request.Request(f"https://api.github.com/repos/{REPO}/releases?per_page=100",
                                 headers={"Accept": "application/vnd.github+json"})
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    releases = json.load(urllib.request.urlopen(req, timeout=30))
    today = datetime.date.today().isoformat()
    rows = [(today, r["tag_name"], a["name"], a["download_count"]) for r in releases for a in r["assets"]]
    new = not OUT.exists()
    OUT.parent.mkdir(exist_ok=True)
    kept = []
    if not new:
        with OUT.open() as f:
            kept = [row for row in csv.reader(f)][1:]
        kept = [row for row in kept if row[0] != today]  # one row per file per day
    with OUT.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["date", "tag", "file", "total"])
        w.writerows(kept + [list(map(str, r)) for r in rows])
    for r in rows:
        print(*r)


if __name__ == "__main__":
    main()
