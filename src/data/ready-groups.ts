// أنواع القطع الجاهزة (طلب المالك 2026-11-27 — تصميم «سوق إلكتروني»):
// تُعرض دوائر في الرئيسية وفلترًا في صفحة المنتجات (/products/?type=…).
// أي نوع جديد يُضاف هنا وفي READY_GROUPS داخل scripts/validate-data.mjs.
import { visibleProducts } from './products';
import type { Product } from '@/lib/types';

export const READY_GROUPS = [
  { slug: 'tables', name: 'طاولات ومكاتب' },
  { slug: 'storage', name: 'خزائن وبوفيهات' },
  { slug: 'lighting', name: 'إضاءة وثريات' },
  { slug: 'heating', name: 'مدافئ' },
  { slug: 'outdoor', name: 'رحلات وكشتة' },
  { slug: 'bath-kitchen', name: 'حمام ومطبخ' },
  { slug: 'smart-home', name: 'أقفال وأجراس' },
] as const;

const refNum = (p: Product) => Number((p.ref || '').replace(/\D/g, '')) || 0;

/** القطع الجاهزة الظاهرة، الأحدث أولًا حسب رقم القطعة */
export const readyPieces: Product[] = visibleProducts
  .filter((p) => p.availability === 'ready-piece' && p.ref)
  .sort((a, b) => refNum(b) - refNum(a));

export const readyGroupsWithItems = READY_GROUPS.map((g) => {
  const items = readyPieces.filter((p) => p.group === g.slug);
  return {
    ...g,
    items,
    count: items.length,
    minPrice: items.length ? Math.min(...items.map((p) => p.price)) : 0,
    cover: items.find((p) => p.images[0])?.images[0],
  };
}).filter((g) => g.count > 0);
