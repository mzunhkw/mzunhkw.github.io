// أسعار غرف النوم والكبتات بالمتر حسب نوع الخشب الذي يختاره العميل (د.ك/متر).
// المتوسط يُستخدم كسعر معروض للمنتج في الموقع وفي بيانات Google.
export type WoodTier = { id: string; name: string; note: string; price: number };

export const woodTiers: WoodTier[] = [
  { id: 'melamine', name: 'ميلامين', note: 'اقتصادي وعملي، ألوان خشبية وسادة متعددة', price: 35 },
  { id: 'mdf-uv', name: 'MDF بتشطيب UV أو أكريليك', note: 'سطح ناعم مقاوم للخدوش', price: 50 },
  { id: 'polylac', name: 'بولي لاك / هاي جلوس', note: 'تشطيب لامع أو مطفي بألوان حسب الطلب', price: 65 },
  { id: 'beech-veneer', name: 'قشر زان', note: 'مظهر الخشب الطبيعي بسعر متوسط', price: 80 },
  { id: 'walnut-veneer', name: 'قشر جوز', note: 'عروق خشب داكنة فاخرة', price: 95 },
  { id: 'solid-wood', name: 'خشب طبيعي', note: 'أعلى متانة وعمر أطول', price: 110 },
];

export const woodMin = Math.min(...woodTiers.map((t) => t.price));
export const woodMax = Math.max(...woodTiers.map((t) => t.price));
export const woodAvg = Math.round((woodTiers.reduce((s, t) => s + t.price, 0) / woodTiers.length) * 10) / 10;

// الأقسام التي تُسعّر حسب نوع الخشب
export const woodPricedCategories = ['bedrooms'];
