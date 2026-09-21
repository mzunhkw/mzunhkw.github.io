import { Product } from '@/lib/types';
import { isVisible } from '@/lib/catalog';
import productsData from './products.json';

// المصدر الحقيقي للبيانات هو products.json — يتم تعديله تلقائيًا من لوحة
// الإدارة (admin.html)، أو يدويًا من GitHub إذا حبيت.
export const products: Product[] = productsData as Product[];

// المنتجات الظاهرة للزوار فقط (منشورة وغير مؤرشفة).
export const visibleProducts: Product[] = products.filter(isVisible);
