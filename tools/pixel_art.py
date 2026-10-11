"""Genera los sprites pixel art del hero de MONTEVER.

Se dibuja a resolución nativa (sin antialias) y el CSS los escala con
image-rendering: pixelated, así se mantienen nítidos a cualquier tamaño.
"""
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)

T = (0, 0, 0, 0)
NAVY = (20, 42, 92, 255)
TIRE = (24, 32, 62, 255)
RIM = (205, 214, 232, 255)
HUB = (88, 104, 140, 255)
GLASS = (36, 66, 138, 255)
GLASS_HI = (110, 156, 222, 255)
Y = (245, 194, 27, 255)
Y_DARK = (205, 148, 10, 255)
Y_LIGHT = (255, 228, 122, 255)
GREY = (138, 151, 181, 255)
WHITE = (250, 248, 240, 255)
RED = (226, 85, 63, 255)
SHADOW = (60, 96, 150, 90)


def rueda(d, cx, cy):
    d.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=TIRE)
    d.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=RIM)
    d.ellipse([cx - 1, cy - 1, cx + 1, cy + 1], fill=HUB)


def pickup():
    W, H = 130, 52
    im = Image.new('RGBA', (W, H), T)
    d = ImageDraw.Draw(im)

    # Sombra
    d.ellipse([10, 46, 124, 51], fill=SHADOW)

    # Cajón (bed)
    d.rectangle([6, 23, 60, 40], fill=Y)
    # Cabina + capó
    d.polygon([(58, 40), (58, 10), (62, 6), (85, 6), (92, 10), (100, 22),
               (121, 24), (124, 28), (124, 38), (121, 40)], fill=Y)

    # Luces y sombras del cuerpo
    d.rectangle([6, 36, 124, 40], fill=Y_DARK)
    d.line([(6, 23), (57, 23)], fill=Y_LIGHT)
    d.line([(62, 6), (85, 6)], fill=Y_LIGHT)
    d.line([(101, 22), (120, 24)], fill=Y_LIGHT)
    d.line([(6, 24), (6, 40)], fill=Y_DARK)
    d.line([(9, 25), (9, 34)], fill=Y_DARK)  # tapa del cajón

    # Ventanas
    d.polygon([(62, 10), (75, 10), (75, 21), (61, 21)], fill=GLASS)
    d.polygon([(78, 10), (89, 10), (97, 21), (78, 21)], fill=GLASS)
    d.line([(79, 11), (79, 15)], fill=GLASS_HI)
    d.line([(63, 11), (63, 14)], fill=GLASS_HI)
    # Rótulo "SE VENDE" en la ventana trasera
    d.rectangle([64, 13, 72, 19], fill=WHITE)
    d.line([(65, 15), (71, 15)], fill=NAVY)
    d.line([(65, 17), (69, 17)], fill=RED)

    # Puerta, manija, espejo
    d.line([(77, 22), (77, 37)], fill=Y_DARK)
    d.line([(58, 22), (58, 37)], fill=Y_DARK)
    d.rectangle([80, 25, 83, 26], fill=Y_DARK)
    d.rectangle([96, 17, 98, 20], fill=NAVY)

    # Luces y parachoques
    d.rectangle([118, 27, 123, 29], fill=WHITE)
    d.rectangle([5, 25, 7, 30], fill=RED)
    d.rectangle([119, 34, 126, 39], fill=GREY)
    d.rectangle([3, 35, 8, 39], fill=GREY)
    d.rectangle([40, 40, 86, 41], fill=GREY)  # estribo

    # Guardabarros: recorta el arco y dibuja la llanta
    for cx in (30, 100):
        d.ellipse([cx - 10, 31, cx + 10, 51], fill=T)
        d.arc([cx - 11, 30, cx + 11, 52], 180, 360, fill=Y_DARK)
        rueda(d, cx, 41)

    im.save(OUT / 'carro.png')


def sedan():
    """Sedán blanco estacionado mirando a la izquierda, segundo plano."""
    W, H = 110, 40
    im = Image.new('RGBA', (W, H), T)
    d = ImageDraw.Draw(im)
    body = (226, 236, 248, 255)
    body_dark = (170, 192, 222, 255)
    d.ellipse([8, 35, 104, 39], fill=SHADOW)
    d.polygon([(4, 30), (4, 22), (20, 19), (34, 8), (70, 8), (86, 18), (104, 20),
               (106, 25), (106, 31)], fill=body)
    d.rectangle([4, 27, 106, 31], fill=body_dark)
    d.polygon([(36, 10), (52, 10), (52, 18), (26, 18)], fill=GLASS)
    d.polygon([(55, 10), (69, 10), (80, 18), (55, 18)], fill=GLASS)
    d.line([(37, 11), (40, 11)], fill=GLASS_HI)
    d.line([(53, 19), (53, 28)], fill=body_dark)
    d.rectangle([4, 21, 7, 23], fill=WHITE)
    d.rectangle([102, 21, 105, 23], fill=RED)
    for cx in (24, 86):
        d.ellipse([cx - 8, 23, cx + 8, 39], fill=T)
        d.ellipse([cx - 6, 25, cx + 6, 37], fill=TIRE)
        d.ellipse([cx - 3, 28, cx + 3, 34], fill=RIM)
    im.save(OUT / 'sedan.png')


def escena():
    """Volcán, colinas, palmeras y poste de luz, todo en azules."""
    W, H = 320, 112
    im = Image.new('RGBA', (W, H), T)
    d = ImageDraw.Draw(im)
    far = (178, 216, 242, 255)
    volcan = (140, 190, 232, 255)
    mid = (128, 184, 228, 255)
    near = (98, 160, 214, 255)
    poste = (72, 122, 186, 255)

    # Volcán con fumarola
    d.polygon([(40, 104), (92, 30), (100, 30), (160, 104)], fill=volcan)
    d.polygon([(92, 30), (100, 30), (104, 38), (88, 38)], fill=far)
    for i, (x, y) in enumerate([(96, 26), (100, 21), (106, 17), (113, 15)]):
        r = 2 + i
        d.ellipse([x - r, y - r, x + r, y + r], fill=(236, 244, 251, 255))

    # Colinas lejanas y cercanas (bandas sinusoidales)
    for x in range(W):
        y1 = int(84 + 6 * math.sin(x / 23) + 3 * math.sin(x / 7.3))
        d.line([(x, y1), (x, H)], fill=far)
    for x in range(W):
        y2 = int(95 + 5 * math.sin(x / 31 + 1.7) + 2 * math.sin(x / 9.1))
        d.line([(x, y2), (x, H)], fill=mid)
    for x in range(W):
        y3 = int(103 + 3 * math.sin(x / 19 + 0.4))
        d.line([(x, y3), (x, H)], fill=near)

    # Palmeras
    def palmera(bx, by, alto, inclinacion):
        pts = []
        for i in range(alto):
            pts.append((bx + int(inclinacion * (i / alto) ** 2), by - i))
        for p in pts:
            d.point(p, fill=poste)
            d.point((p[0] + 1, p[1]), fill=poste)
        tx, ty = pts[-1]
        for ang, largo in [(-160, 12), (-130, 10), (-95, 7), (-50, 10), (-20, 12), (10, 9), (170, 9)]:
            for k in range(largo):
                a = math.radians(ang)
                caida = (k / largo) ** 2 * 5
                d.point((tx + int(k * math.cos(a)), ty + int(k * math.sin(a) + caida)), fill=poste)
                d.point((tx + int(k * math.cos(a)), ty + int(k * math.sin(a) + caida) + 1), fill=poste)

    palmera(22, 104, 40, 6)
    palmera(205, 104, 46, -8)
    palmera(216, 105, 32, 5)

    # Poste de luz con cables
    px = 268
    d.rectangle([px, 14, px + 2, 106], fill=poste)
    d.rectangle([px - 12, 20, px + 14, 21], fill=poste)
    d.rectangle([px - 8, 28, px + 10, 29], fill=poste)
    for ix in (px - 12, px - 4, px + 6, px + 14):
        d.rectangle([ix, 18, ix, 19], fill=poste)

    def cable(x0, y0, x1, y1, sag):
        pts = []
        for i in range(61):
            t = i / 60
            pts.append((round(x0 + (x1 - x0) * t), round(y0 + (y1 - y0) * t + sag * 4 * t * (1 - t))))
        d.line(pts, fill=poste, width=1)

    cable(px - 12, 19, 0, 34, 10)
    cable(px - 4, 19, 0, 44, 12)
    cable(px + 14, 19, W - 1, 30, 4)
    cable(px + 6, 19, W - 1, 38, 5)

    im.save(OUT / 'escena.png')


def nube(nombre, bloques):
    W = max(x + w for x, y, w, h in bloques)
    H = max(y + h for x, y, w, h in bloques)
    im = Image.new('RGBA', (W, H), T)
    d = ImageDraw.Draw(im)
    for x, y, w, h in bloques:
        d.rectangle([x, y, x + w - 1, y + h - 1], fill=(255, 255, 255, 255))
    im.save(OUT / nombre)


pickup()
sedan()
escena()
nube('nube-1.png', [(6, 4, 10, 4), (2, 6, 24, 4), (0, 9, 34, 4), (16, 2, 8, 4)])
nube('nube-2.png', [(4, 3, 8, 3), (0, 5, 22, 4), (10, 1, 6, 4)])
print('ok')
