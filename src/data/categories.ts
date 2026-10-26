import { Category } from '@/lib/types';
import categoriesData from './categories.json';
import { isHiddenCategory } from './hidden-sections';
import { isFocusCategory, sortByFocus } from './focus';

// عدّل categories.json مباشرة لإضافة/تعديل تصنيف.
export const allCategories: Category[] = categoriesData as Category[];
// الأقسام الظاهرة فقط — الأقسام المخفية مؤقتًا في hidden-sections.ts لا تُبنى ولا تظهر بأي مكان
// مرتّبة حسب أقسام التركيز (focus.ts): غرف النوم والكنب أولًا
export const categories: Category[] = sortByFocus(
  allCategories.filter((c) => !isHiddenCategory(c.slug)),
  (c) => c.slug
);
export const focusCategories: Category[] = categories.filter((c) => isFocusCategory(c.slug));
export const secondaryCategories: Category[] = categories.filter((c) => !isFocusCategory(c.slug));
