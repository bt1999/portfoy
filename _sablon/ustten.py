#!/usr/bin/env python3
"""kontrol.js çıktısından üstten görünüş PNG'si çizer (çakışma kontrolü için).
Kullanım: python3 _sablon/ustten.py <sahne.json> <cikti.png>"""
import json, sys
from PIL import Image, ImageDraw

d = json.load(open(sys.argv[1]))
W, D = d['boyut']; s = min(1400 / W, 1000 / D)
im = Image.new('RGB', (int(W * s) + 20, int(D * s) + 20), 'white'); g = ImageDraw.Draw(im)
col = {'wall': (90, 85, 80), 'glass': (120, 190, 220), 'frame': (40, 40, 40), 'oak': (225, 205, 175),
       'screed': (225, 222, 215), 'tile': (235, 235, 240), 'frost': (180, 210, 225)}
P = lambda v: v * s + 10
for i in sorted([i for i in d['items'] if i['k'] != 'l'], key=lambda i: i['z1']):
    if i['k'] == 'b':
        c = col.get(i['m'], (200, 120, 90) if i['z1'] > 2 else (210, 190, 170))
        g.rectangle([P(i['x0']), P(i['y0']), P(i['x1']), P(i['y1'])], fill=c, outline=(0, 0, 0) if i['z0'] >= 0 else None)
    else:
        r = i['r'] * s; g.ellipse([P(i['x']) - r, P(i['y']) - r, P(i['x']) + r, P(i['y']) + r], outline=(0, 110, 0))
for i in d['items']:
    if i['k'] == 'l':
        g.text((P(i['x']), P(i['y'])), i['t'].encode('ascii', 'replace').decode(), fill=(200, 0, 0))
im.save(sys.argv[2]); print(sys.argv[2])
