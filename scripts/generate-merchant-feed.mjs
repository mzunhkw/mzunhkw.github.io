// ملف منتجات Google Merchant Center للقطع الجاهزة (طلب المالك 2026-11-27):
// «ليتعرف جوجل على المنتجات كمنتجات جاهزة وتظهر في بطاقات بحث جوجل».
// يُكتب إلى public/merchant-feed.xml قبل كل بناء، فأي قطعة تُضاف أو يتغير سعرها تنعكس تلقائيًا.
// يُضاف رابطه https://mazunhkw.com/merchant-feed.xml في Merchant Center (المنتجات › مصادر البيانات).
// القيم نفسها المرسلة في بيانات Product المنظمة بصفحة المنتج (السعر، التوفر، الحالة، التوصيل)
// حتى لا يظهر أي تعارض بين الصفحة والملف في Merchant Center.
import { readFileSync, writeFileSync } from 'node:fs';

const SITE = 'https://mazunhkw.com';
// التوصيل خلال يومين (تأكيد المالك 2026-11-27): تجهيز يوم + توصيل يوم — نفس deliveryTime في صفحة المنتج
const HANDLING_DAYS = 1;
const TRANSIT_DAYS = 1;
const GROUP_NAMES = {
  tables: 'طاولات ومكاتب',
  storage: 'خزائن وبوفيهات',
  lighting: 'إضاءة وثريات',
  heating: 'مدافئ',
  outdoor: 'رحلات وكشتة',
  'bath-kitchen': 'حمام ومطبخ',
  'smart-home': 'أقفال وأجراس',
};

const products = JSON.parse(readFileSync(new URL('../src/data/products.json', import.meta.url), 'utf8'));
const today = new Date().toISOString().slice(0, 10);

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
const abs = (u) => (/^https?:\/\//.test(u) ? u : SITE + (u.startsWith('/') ? u : `/${u}`));
const money = (n) => `${(Math.round(n * 1000) / 1000).toFixed(3)} KWD`;
const refNum = (p) => Number((p.ref || '').replace(/\D/g, '')) || 0;

const ready = products
  .filter(
    (p) =>
      p.published &&
      (!p.publishDate || p.publishDate <= today) &&
      p.availability === 'ready-piece' &&
      p.ref &&
      p.price > 0 &&
      p.images?.length
  )
  .sort((a, b) => refNum(a) - refNum(b));

const items = ready.map((p) => {
  const [first, ...rest] = p.images.map(abs);
  const desc = (p.description || p.shortDescription || p.title).slice(0, 5000);
  return `    <item>
      <g:id>${esc(p.ref)}</g:id>
      <g:title>${esc(p.title.slice(0, 150))}</g:title>
      <g:description>${esc(desc)}</g:description>
      <g:link>${esc(abs(`/products/${p.slug}/`))}</g:link>
      <g:image_link>${esc(first)}</g:image_link>
${rest.slice(0, 10).map((u) => `      <g:additional_image_link>${esc(u)}</g:additional_image_link>`).join('\n')}
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:price>${money(p.price)}</g:price>
      ${p.brand ? `<g:brand>${esc(p.brand)}</g:brand>` : ''}
      <g:identifier_exists>no</g:identifier_exists>
      <g:min_handling_time>${HANDLING_DAYS}</g:min_handling_time>
      <g:max_handling_time>${HANDLING_DAYS}</g:max_handling_time>
      <g:product_type>${esc(`قطع جاهزة > ${GROUP_NAMES[p.group] || 'أخرى'}`)}</g:product_type>
      <g:shipping>
        <g:country>KW</g:country>
        <g:price>${money(p.deliveryFee ?? 0)}</g:price>
        <g:min_transit_time>${TRANSIT_DAYS}</g:min_transit_time>
        <g:max_transit_time>${TRANSIT_DAYS}</g:max_transit_time>
      </g:shipping>
    </item>`.replace(/\n\s*\n/g, '\n');
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>مزونة — قطع جاهزة للتوصيل في الكويت</title>
    <link>${SITE}/category/ready-pieces/</link>
    <description>قطع جاهزة بسعر نهائي ورسوم توصيل داخل الكويت</description>
${items.join('\n')}
  </channel>
</rss>
`;

writeFileSync(new URL('../public/merchant-feed.xml', import.meta.url), xml);
console.log(`✓ merchant-feed.xml: ${items.length} قطعة جاهزة`);
