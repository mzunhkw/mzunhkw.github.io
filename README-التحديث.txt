# حزمة تحديث واجهة مزونة

هذه الحزمة معدة للرفع اليدوي إلى مستودع `mzunhkw.github.io`.

## الملفات التي يتم استبدالها
- `src/app/page.tsx`
- `src/components/Header.tsx`
- `src/components/ProductCard.tsx`
- `src/app/globals.css`

## ملفات الهوية الجديدة
- `public/logo.png`
- `public/icon-512.png`
- `public/icon-192.png`
- `public/favicon-32.png`
- `public/apple-touch-icon.png`
- `public/favicon.ico`

## مهم
لم يتم تعديل:
- `src/data/products.json`
- `src/app/layout.tsx`
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- صفحات المنتجات والتصنيفات
- بيانات Schema الموجودة في `layout.tsx`

لذلك تبقى روابط المنتجات وبيانات SEO وSchema الحالية كما هي.

## طريقة الرفع
1. فك ضغط الحزمة.
2. انسخ الملفات مع الحفاظ على المسارات.
3. ارفعها إلى جذر المستودع في GitHub.
4. وافق على استبدال الملفات الستة النصية وملفات الهوية الموجودة.
5. انتظر GitHub Actions حتى ينتهي البناء والنشر.

## ملاحظة عن "أحدث الأعمال"
الموقع الحالي لا يحتوي على تاريخ نشر مستقل لكل منتج، لذلك تعتمد الواجهة على ترتيب `products.json` الحالي، وهو نفس ترتيب الإضافة الذي يستخدمه الموقع. لم تتم إضافة تواريخ مصطنعة.
