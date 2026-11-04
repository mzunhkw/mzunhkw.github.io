// معرّفات المنتج في بيانات Google المنظّمة (sku / productGroupID / inProductGroupWithID).
// Google Merchant يرفض أي معرّف أطول من 50 حرفًا («طول السلسلة غير صالح»)، وروابط بعض المنتجات
// (slug) تصل إلى 70 حرفًا. لذلك المعرّف = الـ slug نفسه إذا كان قصيرًا، وإلا اختصار ثابت منه
// + بصمة من 8 خانات تمنع التكرار. المعرّف ثابت لكل منتج ما دام رابطه لم يتغيّر.
// الحد 36 حرفًا يترك مكانًا لِلاحقة الخامة في المتغيّرات (مثل -painted-wood) دون تجاوز 50.
const MAX_BASE = 36;
export const MAX_ID = 50;

function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function productId(slug: string): string {
  if (slug.length <= MAX_BASE) return slug;
  const head = slug.slice(0, MAX_BASE - 9).replace(/-+$/, '');
  return `${head}-${fnv1a(slug)}`;
}

export function variantSku(slug: string, variantId: string): string {
  const sku = `${productId(slug)}-${variantId}`;
  if (sku.length > MAX_ID) throw new Error(`معرّف المتغيّر أطول من ${MAX_ID} حرفًا: ${sku}`);
  return sku;
}
