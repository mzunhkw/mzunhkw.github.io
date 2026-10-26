import { Offer } from '@/lib/types';
import offersData from './offers.json';
import { isHiddenProductSlug } from './hidden-sections';
import { isFocusCategory } from './focus';
import { products } from './products';

// المصدر الحقيقي للبيانات هو offers.json — يتم تعديله تلقائيًا من لوحة
// الإدارة (admin.html)، أو يدويًا من GitHub إذا حبيت.
export const offers: Offer[] = offersData as Offer[];

// العروض الظاهرة للزوار فقط (منشورة).
// العروض الظاهرة للزوار فقط (منشورة، وليست لمنتج في قسم مخفي).
export const visibleOffers: Offer[] = offers.filter((o) => o.published && !isHiddenProductSlug(o.productSlug));

// عروض الرئيسية: فقط العروض المرتبطة بمنتج من أقسام التركيز (غرف نوم، كنب، مجالس، مساند)،
// حتى لا تجلب عروض القطع الصغيرة (طاولات جانبية…) اتصالات لأعمال بسيطة. العروض الأخرى تبقى في صفحات منتجاتها.
export const focusOffers: Offer[] = visibleOffers.filter((o) => {
  const p = products.find((x) => x.slug === o.productSlug);
  return !!p && isFocusCategory(p.categorySlug);
});
