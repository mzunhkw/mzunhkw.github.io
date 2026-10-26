import { Product } from '@/lib/types';
import { isVisible } from '@/lib/catalog';
import productsData from './products.json';
import { sortByFocus } from './focus';

// المصدر الحقيقي للبيانات هو products.json — يتم تعديله تلقائيًا من لوحة
// الإدارة (admin.html)، أو يدويًا من GitHub إذا حبيت.
export const products: Product[] = productsData as Product[];

// المنتجات الظاهرة للزوار فقط (منشورة وغير مؤرشفة).
// مرتّبة حسب أقسام التركيز (focus.ts) حتى تظهر غرف النوم والكنب أولًا في كل القوائم
export const visibleProducts: Product[] = sortByFocus(products.filter(isVisible), (p) => p.categorySlug);
