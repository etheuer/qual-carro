#!/usr/bin/env python3
"""Resize simulator PNGs to App Store 6.9\" 1320x2868 RGB, no alpha."""
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("pip install pillow")

OUT_W, OUT_H = 1320, 2868


def convert(src: Path, dest: Path) -> None:
    im = Image.open(src).convert("RGB")
    src_w, src_h = im.size
    scale = max(OUT_W / src_w, OUT_H / src_h)
    new = im.resize((round(src_w * scale), round(src_h * scale)), Image.Resampling.LANCZOS)
    left = (new.width - OUT_W) // 2
    top = (new.height - OUT_H) // 2
    crop = new.crop((left, top, left + OUT_W, top + OUT_H))
    dest.parent.mkdir(parents=True, exist_ok=True)
    crop.save(dest, "PNG", optimize=True)
    print(f"{src.name} {src_w}x{src_h} -> {dest} {OUT_W}x{OUT_H}")


def main() -> None:
    if len(sys.argv) < 3:
        sys.exit("usage: resize-store-shots.py SRC_DIR DEST_DIR")
    src_dir, dest_dir = Path(sys.argv[1]), Path(sys.argv[2])
    files = sorted(src_dir.glob("*.png"))
    if not files:
        sys.exit(f"no png in {src_dir}")
    for src in files:
        convert(src, dest_dir / src.name)


if __name__ == "__main__":
    main()
