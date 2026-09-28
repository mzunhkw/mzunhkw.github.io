import { Offer } from '@/lib/types';
import offersData from './offers.json';

// المصدر الحقيقي للبيانات هو offers.json — يتم تعديله تلقائيًا من لوحة
// الإدارة (admin.html)، أو يدويًا من GitHub إذا حبيت.
export const offers: Offer[] = offersData as Offer[];

// العروض الظاهرة للزوار فقط (منشورة).
export const visibleOffers: Offer[] = offers.filter((o) => o.published);
