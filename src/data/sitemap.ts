import type { MetadataRoute } from 'next';
import { visibleProducts } from '@/data/products';
import { categories } from '@/data/categories';
import { services } from '@/data/services';
import { siteConfig } from '@/data/site-config';

// مطلوب مع output: 'export' (تصدير ساكن)
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.siteUrl.replace(/\/$/, '');

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/products/`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/about/`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const categoryUrls: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/category/${c.slug}/`,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const productUrls: MetadataRoute.Sitemap = visibleProducts.map((p) => ({
    url: `${base}/products/${p.slug}/`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const serviceUrls: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${base}${s.path}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticUrls, ...categoryUrls, ...serviceUrls, ...productUrls];
}
