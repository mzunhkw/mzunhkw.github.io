// IndexNow: يرسل إلى Bing (ومحركات IndexNow) الصفحات الجديدة أو المعدّلة فقط بعد كل نشر.
// prepare: يقارن بصمة كل صفحة في out/ مع آخر نشر (.indexnow/hashes.json في ذاكرة Actions)
// submit:  يرسل .indexnow/urls.txt — ملف المفتاح public/b2d8868cb882f5eef07a6f07a0ad398b.txt
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
const KEY = 'b2d8868cb882f5eef07a6f07a0ad398b';
const HOST = 'mazunhkw.com';
const mode = process.argv[2];
mkdirSync('.indexnow', { recursive: true });
if (mode === 'prepare') {
  const sm = readFileSync('out/sitemap.xml', 'utf8');
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  const prev = existsSync('.indexnow/hashes.json') ? JSON.parse(readFileSync('.indexnow/hashes.json', 'utf8')) : {};
  const next = {}; const changed = [];
  for (const u of urls) {
    let p = new URL(u).pathname; if (!p.endsWith('/')) p += '/';
    const file = join('out', p, 'index.html');
    if (!existsSync(file)) continue;
    const html = readFileSync(file, 'utf8').replace(/\/_next\/[^"' )]+/g, '');
    const h = createHash('sha1').update(html).digest('hex');
    next[u] = h; if (prev[u] !== h) changed.push(u);
  }
  writeFileSync('.indexnow/hashes.json', JSON.stringify(next));
  writeFileSync('.indexnow/urls.txt', changed.join('\n'));
  console.log('IndexNow: ' + changed.length + ' متغير من ' + urls.length);
} else if (mode === 'submit') {
  const urlList = existsSync('.indexnow/urls.txt') ? readFileSync('.indexnow/urls.txt', 'utf8').split('\n').filter(Boolean) : [];
  if (!urlList.length) { console.log('IndexNow: لا جديد'); process.exit(0); }
  const res = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: 'https://' + HOST + '/' + KEY + '.txt', urlList }) });
  console.log('IndexNow: أُرسل ' + urlList.length + ' — ' + res.status);
  if (res.status >= 400 && res.status !== 429) console.log('::warning title=IndexNow::' + res.status);
}
