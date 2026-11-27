export type Availability =
  | 'custom-order' // متاح للتفصيل
  | 'ready-piece' // قطعة جاهزة
  | 'temporarily-unavailable' // غير متاح مؤقتًا
  | 'archived'; // مؤرشف

export const availabilityLabels: Record<Availability, string> = {
  'custom-order': 'متاح للتفصيل',
  'ready-piece': 'قطعة جاهزة',
  'temporarily-unavailable': 'غير متاح مؤقتًا',
  archived: 'مؤرشف',
};

export type Offer = {
  id: string;
  title: string;
  price: number;
  originalPrice: number | null;
  image: string;
  productSlug: string; // فارغ = بدون ربط بمنتج (يفتح واتساب بدلًا من ذلك)
  published: boolean;
  updatedAt?: string; // ISO date — يُحدَّث تلقائيًا من لوحة الإدارة
};

export type Category = {
  slug: string;
  name: string;
  description?: string;
  seoTitle?: string;
  metaDescription?: string;
  updatedAt?: string; // ISO date — يُحدَّث تلقائيًا من لوحة الإدارة عند كل إضافة/تعديل/ترتيب
  hidden?: boolean; // true = القسم مخفي مؤقتًا من الموقع ومن جوجل (src/data/hidden-sections.ts)
};

export type Product = {
  slug: string;
  title: string;
  categorySlug: string;
  price: number;
  size: string;
  region: string;
  availability: Availability;
  shortDescription?: string;
  description: string;
  materials?: string[];
  // حقول SEO اختيارية تُدار من لوحة الإدارة؛ المنتجات القديمة تبقى صالحة بدونها.
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  imageAlts?: string[];
  ownPrice?: boolean; // true = يتجاهل سعر الخامة الموحّد لقسمه ويعرض سعره الخاص
  images: string[];
  featured?: boolean;
  published: boolean;
  // النشر المجدول (YYYY-MM-DD): المنتج المنشور لا يظهر قبل صباح هذا اليوم بتوقيت الكويت (src/lib/catalog.ts)
  publishDate?: string;
  updatedAt?: string; // ISO date — يُحدَّث تلقائيًا من لوحة الإدارة عند كل حفظ/نشر/إخفاء
  // القطع الجاهزة (ready-piece) التي تُشترى من موردين متفق معهم (طلب المالك 2026-11-27):
  ref?: string; // رقم القطعة الظاهر للعميل (MZ-001…) — يُطابَق بصفحة الموردين الخاصة بالمالك
  deliveryFee?: number; // أجور التوصيل بالدينار — تُعرض في الصفحة وتُرسل لجوجل في shippingRate
  group?: string; // نوع القطعة الجاهزة (ready-groups.ts): طاولات، خزائن، إضاءة…
  brand?: string; // العلامة التجارية الحقيقية للقطعة إن عُرفت (لا تُنسب لمزونة قطعة لم تصنعها)
};
