import type { Product } from './types';
import { isHiddenCategory } from '@/data/hidden-sections';

// المنتج «ظاهر» بالموقع فقط إذا كان منشورًا وغير مؤرشف.
// كل الصفحات والـ sitemap تعتمد على هذي الدالة عشان ما يصير تعارض بينها.
// ولا ينتمي لقسم مخفي مؤقتًا (src/data/hidden-sections.ts).
// النشر المجدول (طلب المالك 2026-11-23، قبل سفره شهرين): publishDate قادم = مخفي تمامًا (لا صفحة ولا قوائم
// ولا sitemap) حتى يحين يومه بتوقيت الكويت؛ البناء اليومي (depoloy.yml) يُظهره دون تدخل.
export const todayKuwait = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuwait', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export const isDue = (publishDate?: string) => !publishDate || publishDate.slice(0, 10) <= todayKuwait();
export const isVisible = (p: Product) =>
  p.published && isDue(p.publishDate) && p.availability !== 'archived' && !isHiddenCategory(p.categorySlug);

export const formatPrice = (n: number) => String(Math.round(n * 1000) / 1000);

// نص السعر للمنتج غير المُسعّر بالخامة: سعر 0 = «السعر حسب الطلب»، ووحدة المتر تُضاف من حقل المقاس.
export const priceText = (p: { price: number; size?: string }) => {
  if (!(p.price > 0)) return 'السعر حسب الطلب';
  const unit = /مربع/.test(p.size || '') ? '/م²' : /للمتر/.test(p.size || '') ? '/م' : '';
  return `${formatPrice(p.price)} د.ك${unit}`;
};
