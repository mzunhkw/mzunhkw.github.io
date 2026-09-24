import type { MetadataRoute } from 'next';
import { execSync } from 'node:child_process';
import { visibleProducts } from '@/data/products';
import { categories } from '@/data/categories';
import { services } from '@/data/services';
import { siteConfig } from '@/data/site-config';

// مطلوب مع output: 'export' (تصدير ساكن)
export const dynamic = 'force-static';

// تاريخ وقت البناء — يُستخدم فقط كـ fallback أخير لو ما فيه تاريخ حقيقي
// (مثلاً منتج قديم ما انحفظ بعد من لوحة الإدارة الجديدة، أو بيئة بدون Git).
const buildDate = new Date();

/**
 * تاريخ آخر Commit فعلي عدّل على ملف معيّن (نسبةً لجذر المستودع).
 * يُستخدم لصفحات المحتوى الثابت (الرئيسية، /products/، /about/، صفحات
 * الخدمات) لأنها ما فيها حقل updatedAt بالبيانات — مصدر الحقيقة الوحيد
 * لتاريخ تعديلها هو تاريخ آخر تعديل على ملف الكود نفسه بـ Git.
 * يتطلب سجل Git كامل (fetch-depth: 0 بخطوة actions/checkout)، وإلا يرجع
 * buildDate كـ fallback بدل ما يفشل البناء.
 */
function gitLastModified(relativePath: string): Date {
  try {
    const iso = execSync(`git log -1 --format=%cI -- "${relativePath}"`, {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    return iso ? new Date(iso) : buildDate;
  } catch {
    return buildDate;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.siteUrl.replace(/\/$/, '');

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: gitLastModified('src/app/page.tsx'), changeFrequency: 'weekly', priority: 1 },
    {
      url: `${base}/products/`,
      lastModified: gitLastModified('src/app/products/page.tsx'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${base}/about/`,
      lastModified: gitLastModified('src/app/about/page.tsx'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  const categoryUrls: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/category/${c.slug}/`,
    // تاريخ حقيقي من لوحة الإدارة إذا موجود (تصنيفات معدَّلة بعد هذا التحديث)،
    // وإلا آخر تعديل فعلي على ملف بيانات التصنيفات كامل عبر Git.
    lastModified: c.updatedAt ? new Date(c.updatedAt) : gitLastModified('src/data/categories.json'),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const productUrls: MetadataRoute.Sitemap = visibleProducts.map((p) => ({
    url: `${base}/products/${p.slug}/`,
    // تاريخ حقيقي لكل منتج على حدة (يُختم تلقائيًا من admin.js عند كل
    // حفظ/نشر/إخفاء). المنتجات القديمة اللي ما انحفظت بعد التحديث تاخذ
    // fallback مؤقت لحد أول تعديل عليها من اللوحة.
    lastModified: p.updatedAt ? new Date(p.updatedAt) : gitLastModified('src/data/products.json'),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const serviceUrls: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${base}${s.path}`,
    // صفحات الخدمات مكتوبة يدويًا بالكود (src/data/services.ts) — تاريخ
    // تعديل الملف كامل عبر Git هو أدق مصدر متاح حاليًا لكل الخدمات مجتمعة.
    lastModified: gitLastModified('src/data/services.ts'),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticUrls, ...categoryUrls, ...serviceUrls, ...productUrls];
}
