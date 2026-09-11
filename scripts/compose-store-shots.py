#!/usr/bin/env python3
"""App Store frames: promise → proof, not a UI tour."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path("/Users/fulanodetal/Developer/qual-carro")
W, H = 1320, 2868
ASPHALT = (36, 31, 27)
ASPHALT2 = (46, 41, 36)
ENAMEL = (243, 234, 220)
MUTED = (183, 168, 154)
RED = (208, 18, 18)
BOLD = str(ROOT / "node_modules/@expo-google-fonts/archivo/700Bold/Archivo_700Bold.ttf")
REG = str(ROOT / "node_modules/@expo-google-fonts/archivo/400Regular/Archivo_400Regular.ttf")
SRC = ROOT / "screenshots/store"
OUT = ROOT / "screenshots/store/framed"

# Captions are the pitch. The crop is the proof that must be on-screen.
SHOTS = [
    {
        "src": "02-integracao.png",
        "out": "01-promise.png",
        "tag": "O CARRO CERTO",
        "title": "Não atravessa\na plataforma.",
        "sub": "Na Sé, entra no 3 ou no 4.",
        "crop": (0, 1248, 1320, 2264),
    },
    {
        "src": "02-integracao.png",
        "out": "02-proof.png",
        "tag": "CONFIRMADO",
        "title": "5 de 5 no meio.\nPara de perguntar.",
        "sub": "Confirmado neste sentido. Não precisamos mais dessa plataforma.",
        "crop": (0, 1636, 1320, 2368),
    },
    {
        "src": "03-rota.png",
        "out": "03-loop.png",
        "tag": "A ROTA",
        "title": "Sacomã pra Sé.\nQualquer carro.",
        "sub": "Integração paralela. O carro quase não muda a caminhada.",
        "crop": (0, 640, 1320, 2060),
    },
]


def font(path, size):
    return ImageFont.truetype(path, size)


def wrap(draw, text, fnt, max_w):
    words = text.split()
    lines, cur = [], ""
    for word in words:
        trial = (cur + " " + word).strip()
        if draw.textbbox((0, 0), trial, font=fnt)[2] <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def round_clip(im, radius, round_bottom=False):
    mask = Image.new("L", im.size, 0)
    d = ImageDraw.Draw(mask)
    if round_bottom:
        d.rounded_rectangle((0, 0, im.width - 1, im.height - 1), radius=radius, fill=255)
    else:
        d.rounded_rectangle((0, 0, im.width - 1, im.height + radius), radius=radius, fill=255)
    out = im.convert("RGBA")
    out.putalpha(mask)
    return out


def compose(shot):
    canvas = Image.new("RGB", (W, H), ASPHALT)
    draw = ImageDraw.Draw(canvas)
    pad = 72
    max_w = W - pad * 2

    brand_f = font(BOLD, 22)
    pill_f = font(BOLD, 20)
    title_f = font(BOLD, 118)
    sub_f = font(REG, 40)

    y = 80
    draw.text((pad, y), "QUAL CARRO?", font=brand_f, fill=MUTED)
    tag = shot["tag"]
    tw = draw.textbbox((0, 0), tag, font=pill_f)[2]
    px1, py1 = W - pad - tw - 36, y - 8
    px2, py2 = W - pad, y + 36
    draw.rounded_rectangle((px1, py1, px2, py2), radius=18, outline=RED, width=2)
    draw.text((px1 + 18, y - 2), tag, font=pill_f, fill=ENAMEL)

    y = 200
    for line in shot["title"].split("\n"):
        draw.text((pad, y), line, font=title_f, fill=ENAMEL)
        y += 114
    y += 18
    for line in wrap(draw, shot["sub"], sub_f, max_w):
        draw.text((pad, y), line, font=sub_f, fill=MUTED)
        y += 52

    stage_top = y + 48
    enclosure_x = 48
    enclosure_w = W - enclosure_x * 2
    max_card_h = H - stage_top - 64
    radius = 44
    inset = 12

    src = Image.open(SRC / shot["src"]).convert("RGB")
    l, t, r, b = shot["crop"]
    crop = src.crop((l, t, r, b))
    screen_w = enclosure_w - inset * 2
    scale = screen_w / crop.width
    card_h = int(crop.height * scale)
    if card_h > max_card_h - inset * 2:
        scale = (max_card_h - inset * 2) / crop.height
        screen_w = int(crop.width * scale)
        card_h = int(crop.height * scale)
        enclosure_w = screen_w + inset * 2
        enclosure_x = (W - enclosure_w) // 2
    crop = crop.resize((screen_w, card_h), Image.Resampling.LANCZOS)

    enclosure_h = card_h + inset * 2
    shell = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shd = ImageDraw.Draw(shadow)
    shd.rounded_rectangle(
        (enclosure_x, stage_top + 16, enclosure_x + enclosure_w, stage_top + enclosure_h + 16),
        radius=radius,
        fill=(0, 0, 0, 120),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(20))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), shadow)

    sd = ImageDraw.Draw(shell)
    sd.rounded_rectangle(
        (enclosure_x, stage_top, enclosure_x + enclosure_w, stage_top + enclosure_h),
        radius=radius,
        fill=ASPHALT2 + (255,),
        outline=(90, 82, 74, 255),
        width=3,
    )
    screen = round_clip(crop, 36, round_bottom=True)
    shell.alpha_composite(screen, (enclosure_x + inset, stage_top + inset))
    canvas.alpha_composite(shell)

    rgb = Image.new("RGB", (W, H), ASPHALT)
    rgb.paste(canvas.convert("RGB"))
    dest = OUT / shot["out"]
    rgb.save(dest, "PNG", optimize=True)
    print("wrote", dest, rgb.size, rgb.mode)
    return dest


def compose_splash():
    src = ROOT / "assets/brand/kv/splash-raw.png"
    if not src.exists():
        src = ROOT / "assets/splash.png"
    raw = Image.open(src).convert("RGB")
    target_w, target_h = 1284, 2778
    scale = max(target_w / raw.width, target_h / raw.height)
    resized = raw.resize((int(raw.width * scale), int(raw.height * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - target_w) // 2
    top = (resized.height - target_h) // 2
    canvas = resized.crop((left, top, left + target_w, top + target_h))
    draw = ImageDraw.Draw(canvas)
    title_f = font(BOLD, 82)
    promise_f = font(BOLD, 36)
    next_f = font(REG, 32)
    title = "Qual carro?"
    promise = "Pra não andar a plataforma inteira."
    nxt = "Fala onde desce. A gente mostra o carro."
    tw = draw.textbbox((0, 0), title, font=title_f)[2]
    pw = draw.textbbox((0, 0), promise, font=promise_f)[2]
    nw = draw.textbbox((0, 0), nxt, font=next_f)[2]
    draw.text(((target_w - tw) / 2, 220), title, font=title_f, fill=ENAMEL)
    draw.text(((target_w - pw) / 2, 330), promise, font=promise_f, fill=ENAMEL)
    draw.text(((target_w - nw) / 2, 386), nxt, font=next_f, fill=MUTED)
    dest = ROOT / "assets/splash.png"
    canvas.save(dest, "PNG", optimize=True)
    print("wrote", dest, canvas.size, canvas.mode)
    return dest


def contact_sheet(paths):
    thumbs = []
    tw = 360
    for p in paths:
        im = Image.open(p).convert("RGB")
        th = int(im.height * tw / im.width)
        thumbs.append(im.resize((tw, th), Image.Resampling.LANCZOS))
    gap = 24
    sheet = Image.new("RGB", (tw * 3 + gap * 4, thumbs[0].height + gap * 2), (20, 18, 16))
    x = gap
    for th in thumbs:
        sheet.paste(th, (x, gap))
        x += tw + gap
    dest = ROOT / "screenshots/store/_contact.png"
    sheet.save(dest, "PNG", optimize=True)
    print("wrote", dest)
    return dest


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*.png"):
        old.unlink()
    contact = ROOT / "screenshots/store/_contact.png"
    if contact.exists():
        contact.unlink()
    paths = [compose(shot) for shot in SHOTS]
    compose_splash()
    contact_sheet(paths)


if __name__ == "__main__":
    import sys

    if sys.argv[1:] == ["splash"]:
        compose_splash()
    else:
        main()
