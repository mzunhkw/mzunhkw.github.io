import { siteConfig } from '@/data/site-config';

export const absoluteUrl = (path: string) =>
  `${siteConfig.siteUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}
