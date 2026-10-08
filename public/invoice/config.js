'use strict';
/* ==========================================================================
   إعدادات نظام الفواتير — هذا الملف الوحيد الذي تعدّله لنقل النظام لموقع آخر.
   (الأصناف والخامات ومدد الضمان في codes.json)
   ========================================================================== */
window.INVOICE_CONFIG = {
  // رابط الموقع الذي فيه صفحة التحقق /verify/
  site: 'https://mazunhkw.com',
  shop: {
    ar: { name: 'منجرة مزونة', tagline: 'نجارة وتفصيل أثاث وتنجيد — الكويت', address: 'الضجيج — مجمع علي عبدالوهاب، الكويت' },
    en: { name: 'Mazona Furniture and Decor', tagline: 'Carpentry, custom furniture & upholstery — Kuwait', address: 'Al-Dajeej, Ali Abdulwahab Complex, Kuwait' },
    phone: '65061072',
    whatsapp: '96565061072', // صيغة دولية بدون +
    instagram: '@mazunhkw',
    logo: '/logo.png',
  },
  // مستودع GitHub الذي يُرفع إليه المفتاح العام عند تفعيل جهاز
  repo: { owner: 'mzunhkw', repo: 'mzunhkw.github.io', branch: 'main' },
  keysPath: 'public/verify-keys.json',
  // خزنة توكن لوحة الإدارة (اختياري). بدونها يُفعَّل الجهاز بلصق توكن GitHub مباشرة.
  vaultPath: 'public/admin-vault.json',
  storagePrefix: 'mzinv', // بادئة التخزين في الجهاز — غيّرها لكل موقع
  keyDbName: 'mazuna-invoice', // مخزن مفتاح التوقيع داخل الجهاز — غيّره لكل موقع
  quoteValidityDays: 14,
  terms: {
    invoice: {
      ar: [
        'الأسعار متفق عليها بعد أخذ المقاسات ومعاينة العينات.',
        'يبدأ التنفيذ بعد استلام العربون، ويُستكمل باقي المبلغ عند التسليم.',
        'القطع المفصّلة حسب الطلب لا تُسترجع إلا في حالة العيوب المصنعية.',
        'الضمان حسب المدة المذكورة لكل قطعة، ويشمل إصلاح عيوب التصنيع ولا يشمل الاستبدال. التفاصيل: mazunhkw.com/warranty',
        'التوصيل مجاني داخل الكويت.',
      ],
      en: [
        'Prices are agreed after taking measurements and reviewing samples.',
        'Work starts after the deposit is received; the balance is due on delivery.',
        'Made-to-order pieces are non-returnable except for manufacturing defects.',
        'Warranty is as stated for each piece and covers repair of manufacturing defects, not replacement. Details: mazunhkw.com/warranty',
        'Free delivery within Kuwait.',
      ],
    },
    quote: {
      ar: [
        'هذا عرض سعر وليس فاتورة، وهو صالح حتى التاريخ المذكور.',
        'الأسعار مبنية على المقاسات والخامات المذكورة، وتُعتمد نهائيًا بعد زيارة المندوب وأخذ المقاسات الدقيقة.',
        'يبدأ التنفيذ بعد الموافقة على العرض واستلام العربون.',
        'التوصيل مجاني داخل الكويت.',
      ],
      en: [
        'This is a quotation, not an invoice, and is valid until the date stated.',
        'Prices are based on the stated sizes and materials and are confirmed after our visit and exact measurements.',
        'Work starts after the quotation is approved and the deposit is received.',
        'Free delivery within Kuwait.',
      ],
    },
  },
};
