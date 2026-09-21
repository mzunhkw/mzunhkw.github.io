// عدّل هذي القيم مباشرة عند الحاجة.
export const siteConfig = {
  // بدون شرطة مائلة بالنهاية. لازم يطابق ملف public/CNAME.
  siteUrl: 'https://mazunhkw.com',
  name: 'مزونة',
  nameEn: 'Mazona Furniture and Decor',
  tagline: 'منجرة ومعرض للأثاث والديكور — الكويت',
  about:
    'مزونة معرض متخصص بالأثاث والديكور في الكويت. نقدّم قطعًا جاهزة وقطعًا بالتفصيل حسب الطلب. هذا الموقع كتالوج للتصفح فقط، والاستفسار والطلب عبر واتساب.',
  // رقم واتساب بصيغة دولية بدون + أو مسافات، مثال: 96550000000
  whatsappNumber: '96565061072',
  // الرقم كما يظهر للزائر
  phoneDisplay: '65061072',
  address: 'الضجيج — مجمع علي عبدالوهاب، الكويت',
  hours: 'من 9 صباحًا حتى 11 مساءً',
  foundedYear: 2009,
  projectsText: 'أكثر من 112 ألف مشروع',
  // عناوين ووصف محركات البحث للصفحة الرئيسية
  seoTitle: 'كنب وقنفات ومجالس ومساند في الكويت',
  seoDescription:
    'مزونة منجرة ومعرض للأثاث في الكويت: كنب وقنفات ومجالس ومساند جاهزة أو بالتفصيل حسب الطلب. معرضنا في الضجيج — مجمع علي عبدالوهاب. استفسر عبر واتساب.',
  projectsCount: '+112,000',
};

export function whatsappLinkForProduct(title: string) {
  const message = encodeURIComponent(`مرحبًا، أستفسر عن: ${title}`);
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${message}`;
}
