from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parent / 'cosmos.ico'
S = 256
img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Deep obsidian rounded badge
draw.rounded_rectangle((8, 8, S - 8, S - 8), radius=54, fill=(6, 12, 26, 255), outline=(56, 189, 248, 190), width=4)

# Soft cosmic glow
glow = Image.new('RGBA', (S, S), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.ellipse((46, 46, S - 46, S - 46), fill=(14, 165, 233, 95))
gd.ellipse((78, 72, S - 78, S - 84), fill=(250, 204, 21, 110))
glow = glow.filter(ImageFilter.GaussianBlur(18))
img = Image.alpha_composite(img, glow)
draw = ImageDraw.Draw(img)

# Planet core
draw.ellipse((72, 72, S - 72, S - 72), fill=(30, 64, 175, 255))
draw.ellipse((80, 78, S - 92, S - 92), fill=(56, 189, 248, 220))
draw.ellipse((98, 92, 134, 124), fill=(254, 240, 138, 210))

# Tilted orbital ring
ring = Image.new('RGBA', (S, S), (0, 0, 0, 0))
rd = ImageDraw.Draw(ring)
rd.ellipse((24, 92, S - 24, S - 92), outline=(253, 224, 71, 245), width=8)
rd.ellipse((34, 100, S - 34, S - 100), outline=(125, 211, 252, 210), width=4)
ring = ring.rotate(-26, resample=Image.Resampling.BICUBIC)
img = Image.alpha_composite(img, ring)

# Sparkles
draw = ImageDraw.Draw(img)
for x, y, r in [(54, 58, 4), (204, 62, 5), (198, 196, 4), (58, 192, 3)]:
    draw.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255, 240))

img.save(OUT, format='ICO', sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])
print('Generated icon:', OUT, OUT.stat().st_size, 'bytes')
