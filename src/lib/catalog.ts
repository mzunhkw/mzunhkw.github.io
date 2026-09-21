import type { Product } from './types';

// المنتج «ظاهر» بالموقع فقط إذا كان منشورًا وغير مؤرشف.
// كل الصفحات والـ sitemap تعتمد على هذي الدالة عشان ما يصير تعارض بينها.
export const isVisible = (p: Product) => p.published && p.availability !== 'archived';

export const formatPrice = (n: number) => String(Math.round(n * 1000) / 1000);
