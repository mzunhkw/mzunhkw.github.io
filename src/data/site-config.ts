// عدّل هذي القيم مباشرة عند الحاجة.
export const siteConfig = {
  // بدون شرطة مائلة بالنهاية. لازم يطابق ملف public/CNAME.
  siteUrl: 'https://mazunhkw.com',
  name: 'مزونة',
  nameEn: 'Mazona Furniture and Decor',
  tagline: 'منجرة ومعرض للأثاث والديكور — الكويت',
  about:
    'منجرة مزونة منجرة ومعرض للأثاث في الكويت: نجارة وتفصيل أثاث حسب الطلب، وتنجيد كنب وقنفات، وغرف نوم وكبتات ملابس، ومجالس ومساند. الاستفسار والطلب عبر واتساب.',
  // رقم واتساب بصيغة دولية بدون + أو مسافات، مثال: 96550000000
  whatsappNumber: '96565061072',
  // الرقم كما يظهر للزائر
  phoneDisplay: '65061072',
  address: 'الضجيج — مجمع علي عبدالوهاب، الكويت',
  hours: 'من 9 صباحًا حتى 11 مساءً',
  // إحداثيات المعرض (خط العرض والطول) — من رابط خرائط جوجل الخاص بالمعرض.
  geo: { lat: 29.262461, lng: 47.969698 } as { lat: number; lng: number } | null,
  // روابط حسابات التواصل الاجتماعي الخاصة بمزونة (إن وجدت) — تُستخدم في sameAs
  // بالـ Schema لتقوية الثقة المحلية وربط الهوية عبر المصادر. أضف فقط الحسابات
  // الفعلية والنشطة؛ لا تُضاف قائمة فارغة لبيانات Schema.
  socialLinks: ['https://www.instagram.com/mazunhkw'] as string[],
  foundedYear: 2009,
  projectsText: 'أكثر من 112 ألف مشروع',
  // عناوين ووصف محركات البحث للصفحة الرئيسية
  seoTitle: 'نجار وتفصيل أثاث وتنجيد كنب في الكويت',
  seoDescription:
    'منجرة مزونة في الكويت منذ 2009: نجار وتفصيل أثاث حسب الطلب، تنجيد كنب وقنفات، غرف نوم مودرن وكبتات، مجالس ومساند. معرضنا في الضجيج. استفسر عبر واتساب.',
  projectsCount: '+112,000',
};

// الرسالة العامة (الزر العائم وكل رابط واتساب بلا قسم): تعرّف المالك أن المراسل جاء من موقع منجرة مزونة
export const whatsappGeneralMessage = 'مرحبا اريد الاستفسار عن اعمال منجرة مزونة';

export function whatsappGeneralLink() {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(whatsappGeneralMessage)}`;
}

// رسالة واتساب موحّدة لصفحات الأقسام والمنتجات: «مرحبا اريد الاستفسار عن منتجات منجرة مزونة - القسم - الرابط»
// بلا قسم ولا رابط تُستخدم الرسالة العامة.
export function whatsappMessage(label?: string, url?: string) {
  if (!label && !url) return whatsappGeneralMessage;
  return ['مرحبا اريد الاستفسار عن منتجات منجرة مزونة', label, url].filter(Boolean).join(' - ');
}

export function whatsappLink(label?: string, path?: string) {
  const url = path ? siteConfig.siteUrl.replace(/\/$/, '') + path : undefined;
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(whatsappMessage(label, url))}`;
}

// توافق مع الاستخدامات القديمة
export function whatsappLinkForProduct(label: string, path?: string) {
  return whatsappLink(label, path);
}

// مدة التنفيذ والتوصيل (تأكيد المالك 2026-10-03): غرف النوم 15–25 يوماً، وأسرّة الأطفال 5–15، وبقية الأقسام 7–12.
// تُعرض في صفحة المنتج وتُرسل لجوجل في shippingDetails.deliveryTime (التجهيز + يوم توصيل = المجموع نفسه).
export function deliveryDays(categorySlug: string) {
  if (categorySlug === 'bedrooms') return { min: 15, max: 25 };
  if (categorySlug === 'kids-beds') return { min: 5, max: 15 };
  return { min: 7, max: 12 };
}
