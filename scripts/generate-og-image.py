"""Generate a deterministic 1200x630 OG image (public/og.png).

Pure stdlib (zlib/struct) PNG writer; geometric SIM-card motif, no text,
no AI, no network. Re-runnable: identical bytes every run.
"""

import math
import struct
import zlib
from pathlib import Path

W, H = 1200, 630

# Palette (Tailwind-ish)
BG = (15, 23, 42)          # slate-900
GLOW = (30, 47, 78)        # soft radial glow
CARD = (30, 41, 59)        # slate-800
CARD_EDGE = (52, 68, 100)  # slate-700 inner edge
BORDER = (16, 185, 129)    # emerald-500
GOLD = (217, 174, 94)
FAINT = (71, 85, 105)      # slate-500
BRIGHT = (110, 231, 183)   # emerald-300

CENTER = (W // 2, H // 2)


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def in_rounded_rect(x, y, x0, y0, x1, y1, r):
    """Point-inside test for a rectangle with chamfered (rounded) corners."""
    if x < x0 or x > x1 or y < y0 or y > y1:
        return False
    cx = min(max(x, x0 + r), x1 - r)
    cy = min(max(y, y0 + r), y1 - r)
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r


def in_circle(x, y, cx, cy, rr):
    return (x - cx) ** 2 + (y - cy) ** 2 <= rr * rr


def main():
    grid = [[BG] * W for _ in range(H)]

    # Soft radial glow behind the card.
    bgx, bgy = CENTER
    for y in range(H):
        row = grid[y]
        for x in range(W):
            d = math.hypot(x - bgx, y - bgy) / 620.0
            if d < 1.0:
                t = (1.0 - d) ** 2 * 0.55
                row[x] = lerp(BG, GLOW, t)

    # Faint dot grid (destinations motif), drawn before the card.
    for y in range(40, H - 30, 56):
        for x in range(40, W - 30, 56):
            grid[y][x] = FAINT
            grid[y + 1][x] = FAINT

    # SIM card body.
    card = (400, 90, 800, 540)  # x0,y0,x1,y1
    r = 48
    for y in range(card[1], card[3]):
        row = grid[y]
        for x in range(card[0], card[2]):
            if in_rounded_rect(x, y, *card, r):
                edge = in_rounded_rect(x, y, card[0] + 6, card[1] + 6, card[2] - 6, card[3] - 6, r - 6)
                row[x] = CARD_EDGE if not edge else CARD

    # Emerald border.
    for y in range(card[1], card[3]):
        row = grid[y]
        for x in range(card[0], card[2]):
            if in_rounded_rect(x, y, *card, r) and not in_rounded_rect(x, y, card[0] + 4, card[1] + 4, card[2] - 4, card[3] - 4, r - 4):
                row[x] = BORDER

    # Gold chip (top-left area of the card).
    chip = (card[0] + 52, card[1] + 48, card[0] + 164, card[1] + 160)
    for y in range(chip[1], chip[3]):
        row = grid[y]
        for x in range(chip[0], chip[2]):
            if in_rounded_rect(x, y, *chip, 18):
                row[x] = GOLD
    # Chip inner grooves (two emerald lines).
    g1 = (chip[0] + 24, chip[2] - 24) if False else (0, 0)
    _ = g1
    for y in (chip[1] + 34, chip[3] - 34):
        for x in range(chip[0] + 20, chip[2] - 20):
            grid[y][x] = CARD if in_rounded_rect(x, y, chip[0], chip[1], chip[2], chip[3], 18) else grid[y][x]

    # Gold pin rail along the bottom-right of the card.
    pin_x0 = card[2] - 72
    pin_x1 = card[2] - 30
    for i in range(7):
        y0 = card[1] + 92 + i * 56
        y1 = y0 + 30
        for y in range(y0, y1):
            for x in range(pin_x0, pin_x1):
                grid[y][x] = GOLD if in_rounded_rect(x, y, pin_x0, y0, pin_x1, y1, 8) else grid[y][x]

    # Signal arcs (bottom-left of card, emerald).
    sig_cx = card[0] + 64
    sig_cy = card[3] - 52
    for r_ in (18, 34, 50):
        for y in range(sig_cy - r_ - 2, sig_cy + r_ + 2):
            for x in range(sig_cx - r_ - 2, sig_cx + r_ + 2):
                d = math.hypot(x - sig_cx, y - sig_cy)
                if r_ - 2 <= d <= r_:
                    grid[y][x] = BORDER
    for y in range(sig_cy - 8, sig_cy + 9):
        for x in range(sig_cx - 8, sig_cx + 9):
            if in_circle(x, y, sig_cx, sig_cy, 6):
                grid[y][x] = BRIGHT

    # Bottom strip of the card: data columns motif.
    for col in range(6):
        x0 = card[0] + 56 + col * 42
        x1 = x0 + 12
        y1 = card[3] - 32
        for i in range(3):
            y0 = y1 - 12 - i * 24
            for y in range(y0, y1):
                for x in range(x0, x1):
                    grid[y][x] = BORDER if in_rounded_rect(x, y, x0, y0, x1, y1, 4) else grid[y][x]

    # Encode PNG.
    raw = bytearray()
    for row in grid:
        raw.append(0)
        for px in row:
            raw.extend(px)

    def chunk(tag, data):
        c = tag + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c))

    ihdr = struct.pack(">IIBBBBB", W, H, 8, 2, 0, 0, 0)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )

    out = Path(__file__).resolve().parent.parent / "public" / "og.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(png)
    print(f"wrote {out} ({len(png)} bytes)")


if __name__ == "__main__":
    main()