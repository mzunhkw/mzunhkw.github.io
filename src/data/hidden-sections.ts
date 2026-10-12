import productsData from './products.json';
import categoriesData from './categories.json';

// إخفاء مؤقت لأقسام كاملة من الموقع ومن جوجل.
// المصدر: الحقل hidden في categories.json — يُغيَّر من لوحة الإدارة (تبويب التصنيفات ← «إخفاء من الموقع» / «إظهار بالموقع»).
// القسم المخفي: لا تُبنى صفحته ولا صفحات منتجاته، ويخرج من القوائم والرئيسية والتذييل والروابط الداخلية
// وخريطة الموقع والعروض — فتختفي صفحاته من نتائج البحث مع الوقت. المنتجات نفسها تبقى محفوظة كما هي.
// (طلب المالك 2026-10-12: أخفى طاولات الطعام وأسرّة الأطفال والكونسول وطاولات القهوة لأنها تجلب زبائن غير جديين.)
export const HIDDEN_CATEGORY_SLUGS: string[] = (categoriesData as { slug: string; hidden?: boolean }[])
  .filter((c) => c.hidden === true)
  .map((c) => c.slug);

export const isHiddenCategory = (slug: string) => HIDDEN_CATEGORY_SLUGS.includes(slug);

// مقالات موضوعها بالكامل عن قسم معيّن: تُخفى معه وتعود معه تلقائيًا
const ARTICLE_TOPIC_CATEGORY: Record<string, string> = {
  'coffee-table-size-guide': 'coffee-tables',
  'bunk-bed-kids-kuwait': 'kids-beds',
  'kids-bedroom-kuwait': 'kids-beds',
};
export const HIDDEN_ARTICLE_SLUGS: string[] = Object.entries(ARTICLE_TOPIC_CATEGORY)
  .filter(([, cat]) => isHiddenCategory(cat))
  .map(([slug]) => slug);

const hiddenProductSlugs = new Set(
  (productsData as { slug: string; categorySlug: string }[]).filter((p) => isHiddenCategory(p.categorySlug)).map((p) => p.slug)
);

export const isHiddenProductSlug = (slug?: string) => !!slug && hiddenProductSlugs.has(slug);

// هل يشير الرابط الداخلي إلى صفحة مخفية؟ (قسم أو منتج أو مقال)
export function isHiddenHref(href: string): boolean {
  const m = href.match(/^\/(category|products|articles)\/([^/?#]+)\/?/);
  if (!m) return false;
  if (m[1] === 'category') return isHiddenCategory(m[2]);
  if (m[1] === 'products') return isHiddenProductSlug(m[2]);
  return HIDDEN_ARTICLE_SLUGS.includes(m[2]);
}
