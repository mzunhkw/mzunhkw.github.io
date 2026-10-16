// أسعار تفصيل غرف النوم والكبتات بالمتر المربع حسب الخامة (د.ك/م²) — تأكيد المالك 2026-10-11.
// الميلامين هو الخامة الأساسية والسعر المعروض لكل غرف النوم في الموقع وفي بيانات Google.
// هذا الملف هو المصدر الوحيد للأسعار: صفحة المنتج، بطاقة المنتج، صفحة الكبتات وبيانات Schema كلها تقرأ منه.
export type WoodTier = { id: string; name: string; note: string; price: number };

export const woodTiers: WoodTier[] = [
  { id: 'melamine', name: 'ميلامين', note: 'الخامة الأساسية لغرف النوم والكبتات، بألوان خشبية وسادة متعددة', price: 55 },
  { id: 'painted-wood', name: 'خشب مع صبغ', note: 'خشب مصبوغ باللون الذي تختاره', price: 35 },
];

// السعر الأساسي المعروض لغرف النوم = سعر الميلامين
export const bedroomPrice = woodTiers.find((t) => t.id === 'melamine')!.price;
export const woodMin = Math.min(...woodTiers.map((t) => t.price));
export const woodMax = Math.max(...woodTiers.map((t) => t.price));

// وحدة التسعير: متر مربع (UN/CEFACT: MTK)
export const priceUnitText = 'متر مربع';
export const priceUnitCode = 'MTK';

// الأقسام التي تُسعّر بالمتر المربع حسب الخامة
export const woodPricedCategories = ['bedrooms'];

// منتج في قسم مُسعّر بالخامة يُعرض بسعر الخامة الموحّد، إلا إذا كان له سعر خاص (ownPrice) —
// مثل الكبتات الميلامين المسعّرة بالمتر بسعر مختلف (طلب المالك 2026-10-17).
export const isWoodPriced = (p: { categorySlug: string; ownPrice?: boolean }) =>
  woodPricedCategories.includes(p.categorySlug) && !p.ownPrice;
