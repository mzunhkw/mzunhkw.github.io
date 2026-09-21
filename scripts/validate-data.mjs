// يفحص ملفات البيانات قبل كل بناء (npm run build يشغّله تلقائيًا عبر prebuild).
// لو فيه خطأ يفشل البناء بدل ما ينشر موقع مكسور — والنسخة المنشورة الحالية تبقى شغالة.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const AVAILABILITY = ['custom-order', 'ready-piece', 'temporarily-unavailable', 'archived'];
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);

function load(rel) {
  try {
    const data = JSON.parse(readFileSync(join(root, rel), 'utf8'));
    if (!Array.isArray(data)) {
      err(`${rel}: لازم يكون قائمة (Array).`);
      return [];
    }
    return data;
  } catch (e) {
    err(`${rel}: تعذّرت القراءة أو JSON غير صالح — ${e.message}`);
    return [];
  }
}

const isStr = (v) => typeof v === 'string';
const categories = load('src/data/categories.json');
const products = load('src/data/products.json');

// ---- التصنيفات
const catSlugs = new Set();
categories.forEach((c, i) => {
  const at = `categories[${i}]`;
  if (!isStr(c.slug) || !SLUG_RE.test(c.slug)) err(`${at}: slug غير صالح (${JSON.stringify(c.slug)}).`);
  if (catSlugs.has(c.slug)) err(`${at}: slug مكرر «${c.slug}».`);
  catSlugs.add(c.slug);
  if (!isStr(c.name) || !c.name.trim()) err(`${at}: الاسم فارغ.`);
});

// ---- المنتجات
const seen = new Set();
products.forEach((p, i) => {
  const at = `products[${i}]${isStr(p.slug) ? ` («${p.slug}»)` : ''}`;
  if (!isStr(p.slug) || !SLUG_RE.test(p.slug)) err(`${at}: slug لازم يكون حروف إنجليزية صغيرة وأرقام وشرطات فقط.`);
  if (seen.has(p.slug)) err(`${at}: slug مكرر.`);
  seen.add(p.slug);
  if (!isStr(p.title) || !p.title.trim()) err(`${at}: العنوان فارغ.`);
  if (!catSlugs.has(p.categorySlug)) err(`${at}: categorySlug «${p.categorySlug}» غير موجود بالتصنيفات.`);
  if (typeof p.price !== 'number' || !Number.isFinite(p.price) || p.price < 0) err(`${at}: السعر لازم يكون رقمًا صحيحًا ≥ 0.`);
  if (!isStr(p.size)) err(`${at}: size لازم نص.`);
  if (!isStr(p.region)) err(`${at}: region لازم نص.`);
  if (!AVAILABILITY.includes(p.availability)) err(`${at}: availability غير صالحة «${p.availability}».`);
  if (!isStr(p.description) || !p.description.trim()) err(`${at}: الوصف فارغ.`);
  if (p.shortDescription !== undefined && !isStr(p.shortDescription)) err(`${at}: shortDescription لازم نص.`);
  if (p.materials !== undefined && !(Array.isArray(p.materials) && p.materials.every(isStr))) err(`${at}: materials لازم قائمة نصوص.`);
  if (typeof p.published !== 'boolean') err(`${at}: published لازم true/false.`);
  if (p.featured !== undefined && typeof p.featured !== 'boolean') err(`${at}: featured لازم true/false.`);
  if (!Array.isArray(p.images) || !p.images.every(isStr)) {
    err(`${at}: images لازم قائمة نصوص.`);
  } else {
    for (const url of p.images) {
      if (!url.startsWith('/images/') || url.includes('..')) err(`${at}: مسار الصورة «${url}» لازم يبدأ بـ /images/.`);
      else if (!existsSync(join(root, 'public', url))) err(`${at}: ملف الصورة غير موجود بالمستودع: public${url}`);
    }
  }
});

// ---- تنبيهات (ما توقف البناء)
try {
  const cfg = readFileSync(join(root, 'src/data/site-config.ts'), 'utf8');
  if (/whatsappNumber:\s*'96500000000'/.test(cfg)) warnings.push('رقم واتساب ما زال الرقم التجريبي 96500000000 — عدّله بـ src/data/site-config.ts.');
} catch {
  /* ignore */
}
if (products.some((p) => /^sample-/.test(p.slug))) warnings.push('فيه منتجات تجريبية (sample-…) — احذفها من اللوحة قبل الإطلاق.');

warnings.forEach((w) => console.warn(`⚠️  ${w}`));
if (errors.length) {
  console.error(`\n❌ فشل فحص البيانات (${errors.length}):`);
  errors.forEach((e) => console.error(` • ${e}`));
  process.exit(1);
}
console.log(`✅ فحص البيانات: ${categories.length} تصنيف، ${products.length} منتج — سليم.`);
