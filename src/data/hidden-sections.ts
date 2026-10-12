import productsData from './products.json';

// إخفاء مؤقت لأقسام كاملة من الموقع ومن جوجل (طلب المالك 2026-10-12: تجلب زبائن غير جديين).
// التركيز الآن على: الكنب، غرف النوم، المجالس، المساند.
//
// القسم المخفي: لا تُبنى صفحته ولا صفحات منتجاته، ويخرج من القوائم والرئيسية والتذييل
// والروابط الداخلية وخريطة الموقع وبيانات جوجل — فتختفي صفحاته من نتائج البحث مع الوقت.
// المنتجات نفسها تبقى محفوظة في products.json كما هي.
//
// لإرجاع قسم: احذف اسمه من القائمة فقط، فيعود كل شيء تلقائيًا.
export const HIDDEN_CATEGORY_SLUGS: string[] = ['tables', 'kids-beds', 'decor', 'coffee-tables'];

// مقالات موضوعها بالكامل عن الأقسام المخفية (تجلب نفس نوع الزبائن)
export const HIDDEN_ARTICLE_SLUGS: string[] = ['coffee-table-size-guide', 'bunk-bed-kids-kuwait', 'kids-bedroom-kuwait'];

export const isHiddenCategory = (slug: string) => HIDDEN_CATEGORY_SLUGS.includes(slug);

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
