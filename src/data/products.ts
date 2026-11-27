import { Product } from '@/lib/types';
import { isVisible } from '@/lib/catalog';
import productsData from './products.json';
import { sortByFocus } from './focus';

// المصدر الحقيقي للبيانات هو products.json — يتم تعديله تلقائيًا من لوحة
// الإدارة (admin.html)، أو يدويًا من GitHub إذا حبيت.
export const products: Product[] = productsData as Product[];

// المنتجات الظاهرة للزوار فقط (منشورة وغير مؤرشفة).
// مرتّبة حسب أقسام التركيز (focus.ts) حتى تظهر غرف النوم والكنب أولًا في كل القوائم
// والقطع الجاهزة (MZ-…) الأحدث أولًا حسب رقم القطعة (طلب المالك 2026-11-27: الأولوية للمنتجات الجديدة)
const refNum = (p: Product) => Number((p.ref || '').replace(/\D/g, '')) || 0;
export const visibleProducts: Product[] = sortByFocus(products.filter(isVisible), (p) => p.categorySlug)
  .map((p, i) => ({ p, i }))
  .sort((a, b) => (a.p.categorySlug === b.p.categorySlug ? refNum(b.p) - refNum(a.p) : 0) || a.i - b.i)
  .map(({ p }) => p);
