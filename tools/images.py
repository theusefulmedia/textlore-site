"""Makes the site's screenshots, photo tiles and icons.

    python tools/images.py

img/src holds <name>.png and <name>-dark.png, captured at 2x from the demo library
(TEXTLORE_DEMO=1), never from real history. Each becomes img/shots/<name>-<light|dark>-<width>.avif
and .webp at the widths below. Icons come from img/src/icon-1024.png.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "img" / "src"
OUT = ROOT / "img" / "shots"
WIDTHS = (1000, 1600, 2400)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for light in sorted(SRC.glob("*.png")):
        name = light.stem
        if name.endswith("-dark") or name.startswith("icon"):
            continue
        for scheme, src in (("light", light), ("dark", SRC / f"{name}-dark.png")):
            img = Image.open(src).convert("RGB")
            for w in WIDTHS:
                if w > img.width:
                    w = img.width
                h = round(img.height * w / img.width)
                small = img.resize((w, h), Image.LANCZOS)
                small.save(OUT / f"{name}-{scheme}-{w}.avif", quality=70, speed=4)
                small.save(OUT / f"{name}-{scheme}-{w}.webp", quality=86, method=6)
            print(f"{name}-{scheme}: {img.width}x{img.height}")

    icon = Image.open(SRC / "icon-1024.png").convert("RGBA")
    icon.resize((180, 180), Image.LANCZOS).save(ROOT / "apple-touch-icon.png", optimize=True)
    icon.resize((32, 32), Image.LANCZOS).save(ROOT / "favicon.png", optimize=True)
    icon.save(ROOT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    for size in (96, 192, 384):
        icon.resize((size, size), Image.LANCZOS).save(ROOT / "img" / f"icon-{size}.webp", quality=90, method=6)


if __name__ == "__main__":
    main()
