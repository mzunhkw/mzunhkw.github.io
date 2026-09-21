import type { MetadataRoute } from 'next';
import { siteConfig } from '@/data/site-config';

// مطلوب مع output: 'export' (تصدير ساكن)
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.siteUrl.replace(/\/$/, '');
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/admin.html' },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
