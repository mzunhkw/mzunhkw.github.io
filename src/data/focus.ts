// أقسام التركيز في الموقع (طلب المالك 2026-10-26):
// أغلب اتصالات الموقع كانت لأعمال بسيطة (تسريحة منفردة، طاولة)، والمطلوب أن يركّز الموقع على
// تفصيل غرف النوم والكنب أولًا ثم المجالس والمساند. هذا الملف هو المصدر الوحيد لهذا الترتيب:
// - يرتّب الأقسام في كل القوائم (الرئيسية، التذييل، فلتر المنتجات، خريطة الموقع).
// - يرتّب المنتجات بحيث تظهر أعمال غرف النوم والكنب أولًا.
// - الأقسام الثانوية تبقى منشورة ومفهرسة، لكن بظهور أخف وبدون صور كبيرة أو عروض في الرئيسية.
// (ملف TS وليس categories.json حتى لا تمسحه لوحة الإدارة عند حفظ التصنيفات.)
export const FOCUS_CATEGORY_SLUGS = ['bedrooms', 'sofas', 'majlis', 'cushions'] as const;

// القسمان الرئيسيان اللذان تُبنى حولهما الرئيسية
export const PRIMARY_FOCUS_SLUGS = ['bedrooms', 'sofas'] as const;

export const isFocusCategory = (slug: string) => (FOCUS_CATEGORY_SLUGS as readonly string[]).includes(slug);

// ترتيب القسم: أقسام التركيز بترتيبها أعلاه، ثم البقية بترتيبها الأصلي
export const focusRank = (slug: string) => {
  const i = (FOCUS_CATEGORY_SLUGS as readonly string[]).indexOf(slug);
  return i === -1 ? FOCUS_CATEGORY_SLUGS.length : i;
};

export function sortByFocus<T>(items: T[], slugOf: (item: T) => string): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => focusRank(slugOf(a.item)) - focusRank(slugOf(b.item)) || a.index - b.index)
    .map(({ item }) => item);
}
