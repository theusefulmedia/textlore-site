"""Makes the site's screenshots, icons and favicons.

Run with a Python that has Pillow (11 or later, for AVIF):
    python tools/images.py [screens folder]

The screens folder holds <name>.png and <name>-dark.png at 2x. Each one becomes
img/shots/<name>-<light|dark>-<width>.avif and .webp at the widths below. A name with no
dark file uses the light one for both. Icons come from img/src/icon-1024.png.
"""
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SCREENS = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "img" / "src"
OUT = ROOT / "img" / "shots"

# name: widths in pixels (the larger is for 2x screens)
SHOTS = {
    "main-window": (960, 1600),
    "search": (720, 1280),
    "quick-search": (720, 1280),
    "attachments": (720, 1280),
    "export-confirmation": (560, 1000),
    "lore": (720, 1280),
    "ask-ai": (720, 1280),
    "help-install": (640, 1200),
}


def save(img, stem, width):
    h = round(img.height * width / img.width)
    small = img.resize((width, h), Image.LANCZOS)
    small.save(OUT / f"{stem}-{width}.avif", quality=62, speed=4)
    small.convert("RGB").save(OUT / f"{stem}-{width}.webp", quality=82, method=6)
    return h


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, widths in SHOTS.items():
        light = SCREENS / f"{name}.png"
        if not light.exists():
            print(f"missing {light.name}, skipped")
            continue
        dark = SCREENS / f"{name}-dark.png"
        for scheme, src in (("light", light), ("dark", dark if dark.exists() else light)):
            img = Image.open(src).convert("RGBA")
            for w in widths:
                h = save(img, f"{name}-{scheme}", w)
            print(f"{name}-{scheme}: {img.width}x{img.height} -> {widths} (last {w}x{h})")

    icon = Image.open(ROOT / "img" / "src" / "icon-1024.png").convert("RGBA")
    icon.resize((180, 180), Image.LANCZOS).save(ROOT / "apple-touch-icon.png", optimize=True)
    icon.resize((32, 32), Image.LANCZOS).save(ROOT / "favicon.png", optimize=True)
    icon.save(ROOT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    for size in (96, 192):
        icon.resize((size, size), Image.LANCZOS).save(ROOT / "img" / f"icon-{size}.webp", quality=90, method=6)
    print("icons written")


if __name__ == "__main__":
    main()
