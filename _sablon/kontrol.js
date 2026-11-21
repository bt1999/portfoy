// Proje dosyasını tarayıcısız çalıştırır, sahneyi JSON'a döker ve sayfa betiğinin sözdizimini kontrol eder.
// Kullanım: node _sablon/kontrol.js <proje.js> <cikti.json> [sayfa.html]
const fs = require('fs');
const [proj, outp, page] = process.argv.slice(2);
eval(fs.readFileSync(proj, 'utf8') + ';globalThis.PROJE=PROJE;globalThis.buildOffice=buildOffice;');
const out = []; const T = [{x: 0, y: 0, a: 0}];
const cur = () => T[T.length - 1];
const w = (lx, ly) => { const t = cur(), c = Math.cos(t.a), s = Math.sin(t.a); return [t.x + lx * c + ly * s, t.y - lx * s + ly * c]; };
const H = PROJE.tavan;
const A = {
  box(x0, y0, x1, y1, z0, z1, m) { const p = [w(x0, y0), w(x1, y1)];
    out.push({k: 'b', x0: Math.min(p[0][0], p[1][0]), y0: Math.min(p[0][1], p[1][1]), x1: Math.max(p[0][0], p[1][0]), y1: Math.max(p[0][1], p[1][1]), z0, z1, m}); },
  cyl(cx, cy, r, z0, z1, m) { const p = w(cx, cy); out.push({k: 'c', x: p[0], y: p[1], r, z0, z1, m}); },
  sphere(cx, cy, cz, r, m) { const p = w(cx, cy); out.push({k: 'c', x: p[0], y: p[1], r, z0: cz, z1: cz, m}); },
  push(x, y, d) { const p = w(x, y); T.push({x: p[0], y: p[1], a: cur().a + d * Math.PI / 180}); }, pop() { T.pop(); },
  floor(x0, y0, x1, y1, m, o) { A.box(x0, y0, x1, y1, -10, o || 0, m); },
  rug(x0, y0, x1, y1, m) { A.box(x0, y0, x1, y1, .5, 1.6, m); },
  wall(x0, y0, x1, y1, z0 = 0, z1 = H) { A.box(x0, y0, x1, y1, z0, z1, 'wall'); },
  label(t, s, x, y) { out.push({k: 'l', t, x, y}); },
};
buildOffice(A);
for (const k of ['baslik', 'altBaslik', 'tavan', 'boyut', 'zonlar', 'not', 'gorunumler']) if (!(k in PROJE)) throw new Error('PROJE.' + k + ' eksik');
for (const z of PROJE.zonlar) if (z.gorunum && !PROJE.gorunumler[z.gorunum]) throw new Error('zon görünümü yok: ' + z.gorunum);
fs.writeFileSync(outp, JSON.stringify({boyut: PROJE.boyut, items: out}));
console.log(out.length, 'öğe');
if (page) {
  const html = fs.readFileSync(page, 'utf8');
  const mod = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
  fs.writeFileSync('/tmp/_kp_mod.mjs', mod);
  require('child_process').execFileSync(process.execPath, ['--check', '/tmp/_kp_mod.mjs'], {stdio: 'inherit'});
  const b = html.match(/<script id="build">([\s\S]*?)<\/script>/)[1];
  new Function(b); // classic script syntax
  console.log('sayfa sözdizimi tamam');
}
