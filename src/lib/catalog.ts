import type { Product } from './types';
import { isHiddenCategory } from '@/data/hidden-sections';

// المنتج «ظاهر» بالموقع فقط إذا كان منشورًا وغير مؤرشف.
// كل الصفحات والـ sitemap تعتمد على هذي الدالة عشان ما يصير تعارض بينها.
// ولا ينتمي لقسم مخفي مؤقتًا (src/data/hidden-sections.ts).
export const isVisible = (p: Product) => p.published && p.availability !== 'archived' && !isHiddenCategory(p.categorySlug);

export const formatPrice = (n: number) => String(Math.round(n * 1000) / 1000);
