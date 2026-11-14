#!/usr/bin/env python3
"""Sayfayı başsız Chrome'da, sahte (mock) three.js ile çalıştırır: betik hatası, arayüz, düğmeler ve 3 günlük süre dolumu.
Gerçek 3D çizimi test etmez (sandbox'tan CDN'e erişim yok).
Kullanım: python3 _sablon/test/tarayici_testi.py <slug>/index.html"""
import os, re, subprocess, sys, tempfile, shutil, time
from playwright.sync_api import sync_playwright
here = os.path.dirname(os.path.abspath(__file__)); page = os.path.abspath(sys.argv[1])
work = tempfile.mkdtemp(); shutil.copytree(here, work, dirs_exist_ok=True)
s = open(page, encoding='utf-8').read()
s = s.replace('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js', 'http://localhost:8766/three.js')
s = s.replace('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/', 'http://localhost:8766/jsm/')
open(os.path.join(work, 'page.html'), 'w', encoding='utf-8').write(s)
open(os.path.join(work, 'expired.html'), 'w', encoding='utf-8').write(re.sub(r"const YAYIN_BITIS = '[^']*'", "const YAYIN_BITIS = '2020-01-01T00:00:00Z'", s))
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8766'], cwd=work, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
ok = True
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        for name, vp in [('page.html', (390, 800)), ('page.html', (1280, 800)), ('expired.html', (390, 800))]:
            pg = b.new_page(viewport={'width': vp[0], 'height': vp[1]}); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.route(re.compile(r'fonts\.(googleapis|gstatic)\.com'), lambda r: r.abort())
            pg.goto(f'http://localhost:8766/{name}'); pg.wait_for_timeout(1200)
            if name == 'expired.html':
                good = pg.is_visible('#expired'); print('süre dolumu:', 'tamam' if good else 'HATA'); ok &= good; continue
            for btn in pg.locator('#bar button').all(): btn.click(timeout=3000)
            pg.click('#bCut', timeout=3000); pg.click('#bLbl', timeout=3000); pg.click('#toggleLegend', timeout=3000)
            pg.wait_for_timeout(300)
            print(f'{vp[0]}px:', 'başlık=', pg.inner_text('#pTitle'), '| görünüm=', pg.locator('#bar button').count(),
                  '| etiket=', pg.locator('#labels .lbl').count(), '| hata=', errs or 'yok')
            pg.screenshot(path=f'/tmp/kp_ui_{vp[0]}.png'); ok &= not errs
        b.close()
finally:
    srv.terminate()
print('SONUÇ:', 'GEÇTİ' if ok else 'KALDI'); sys.exit(0 if ok else 1)
