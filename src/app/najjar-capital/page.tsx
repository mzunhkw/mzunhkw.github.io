import type { Metadata } from 'next';
import { areaPages } from '@/data/area-pages';
import { siteConfig } from '@/data/site-config';
import AreaLandingPage from '@/components/AreaLandingPage';

const area = areaPages.find((a) => a.slug === 'najjar-capital')!;

export const metadata: Metadata = {
  title: { absolute: area.title },
  description: area.description,
  alternates: { canonical: area.path },
  openGraph: { title: area.title, description: area.description, url: area.path, siteName: siteConfig.name, locale: 'ar_KW', type: 'website', images: ['/og-image.jpg'] },
};

export default function Page() {
  return <AreaLandingPage area={area} />;
}
