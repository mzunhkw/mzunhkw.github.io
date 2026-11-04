// تحويلات دائمة للصفحات المُزالة نهائيًا (src/data/retired-redirects.json).
// الموقع ثابت على GitHub Pages (لا يدعم 301 من الخادم)، فنكتب لكل رابط قديم صفحة تحويل فوري:
// meta refresh بزمن 0 (يعامله جوجل كتحويل دائم 301) + canonical للصفحة الجديدة + تحويل JS احتياطي.
// النتيجة: الروابط القديمة في جوجل والروابط الخارجية تنقل قوتها لأقرب صفحة قائمة بدل 404.
// يفشل البناء لو: الوجهة غير موجودة، أو الرابط القديم ما زال صفحة حقيقية، أو الرابط غير لاتيني.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SITE = 'https://mazunhkw.com';
const OUT = 'out';
const rows = JSON.parse(readFileSync('src/data/retired-redirects.json', 'utf8'));
const PATH_RE = /^\/[a-z0-9\-/]+\/$/;
const errors = [];
const page = (p) => join(OUT, p, 'index.html');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

for (const { from, to } of rows) {
  if (!PATH_RE.test(from) || !PATH_RE.test(to)) { errors.push(`مسار غير صالح: ${from} → ${to}`); continue; }
  if (!existsSync(page(to))) { errors.push(`الوجهة غير موجودة بالموقع: ${to} (من ${from})`); continue; }
  if (existsSync(page(from))) { errors.push(`الرابط القديم ما زال صفحة حقيقية: ${from}`); continue; }
  const url = esc(SITE + to);
  mkdirSync(join(OUT, from), { recursive: true });
  writeFileSync(
    page(from),
    `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تم نقل الصفحة — منجرة مزونة</title>` +
      `<link rel="canonical" href="${url}"><meta http-equiv="refresh" content="0; url=${url}">` +
      `<script>location.replace(${JSON.stringify(SITE + to)})</script></head>` +
      `<body><p>تم نقل هذه الصفحة إلى <a href="${url}">${url}</a></p></body></html>`
  );
}

if (errors.length) {
  console.error('✖ تحويلات الصفحات المُزالة:\n' + errors.join('\n'));
  process.exit(1);
}
console.log(`✓ تحويلات دائمة: ${rows.length}`);
