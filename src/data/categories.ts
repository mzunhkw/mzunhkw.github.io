import { Category } from '@/lib/types';
import categoriesData from './categories.json';
import { isHiddenCategory } from './hidden-sections';

// عدّل categories.json مباشرة لإضافة/تعديل تصنيف.
export const allCategories: Category[] = categoriesData as Category[];
// الأقسام الظاهرة فقط — الأقسام المخفية مؤقتًا في hidden-sections.ts لا تُبنى ولا تظهر بأي مكان
export const categories: Category[] = allCategories.filter((c) => !isHiddenCategory(c.slug));
