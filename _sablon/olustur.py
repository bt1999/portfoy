#!/usr/bin/env python3
"""Kat planı 3D sayfası üretir ve yayin.json'a kaydeder.

Kullanım (repo kökünden):
  python3 _sablon/olustur.py --slug ofis-tasarim-3d-2 --proje /home/claude/proje.js \
      --baslik "Ofis Katı — 3D Mimari Çalışma" --aciklama "4 kişilik çalışma alanı, müdür odası ... · Berkay Tapan, RE/MAX İKON"

Sayfa <slug>/index.html olarak yazılır, 3 gün sonra kendi kendine "süresi doldu" ekranına geçer.
"""
import argparse, datetime, html, json, os, re, sys

ap = argparse.ArgumentParser()
ap.add_argument('--slug', required=True)
ap.add_argument('--proje', required=True, help='PROJE + buildOffice içeren .js dosyası')
ap.add_argument('--baslik', required=True)
ap.add_argument('--aciklama', required=True)
ap.add_argument('--gun', type=float, default=3)
a = ap.parse_args()

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if not re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)*', a.slug):
    sys.exit('slug yalnızca küçük harf, rakam ve tire içermeli')
if os.path.exists(os.path.join(root, a.slug)):
    sys.exit(f'{a.slug} zaten var: sonuna -2, -3 ekle')

tpl = open(os.path.join(root, '_sablon', 'kat-plani-3d.html'), encoding='utf-8').read()
proje = open(a.proje, encoding='utf-8').read()
if 'const PROJE' not in proje or 'function buildOffice' not in proje:
    sys.exit('proje dosyasında PROJE ve buildOffice olmalı')
if '</script' in proje.lower():
    sys.exit('proje dosyası </script içeremez')

now = datetime.datetime.now(datetime.timezone.utc)
bitis = (now + datetime.timedelta(days=a.gun)).strftime('%Y-%m-%dT%H:%M:%SZ')
esc = lambda t: html.escape(t, quote=True)
out = (tpl.replace('{{BASLIK}}', esc(a.baslik))
          .replace('{{ACIKLAMA}}', esc(a.aciklama))
          .replace('{{SLUG}}', a.slug)
          .replace('/*PROJE*/', f"const YAYIN_BITIS = '{bitis}';\n" + proje))
assert '{{' not in out.split('<script id="build">')[0], 'doldurulmamış yer tutucu kaldı'

os.makedirs(os.path.join(root, a.slug))
open(os.path.join(root, a.slug, 'index.html'), 'w', encoding='utf-8').write(out)

yp = os.path.join(root, 'yayin.json')
d = json.load(open(yp, encoding='utf-8'))
d[a.slug] = {'date': now.strftime('%Y-%m-%dT%H:%M:%S.') + f'{now.microsecond // 1000:03d}Z', 'title': a.baslik}
open(yp, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=1) + '\n')

print(f'https://bt1999.github.io/portfoy/{a.slug}/')
print('bitis', bitis)
