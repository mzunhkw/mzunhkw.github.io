import type { Metadata } from 'next';
import { services } from '@/data/services';
import { siteConfig } from '@/data/site-config';
import ServiceLandingPage from '@/components/ServiceLandingPage';

const service = services.find((s) => s.slug === 'تنجيد-مساند-الكويت')!;

export const metadata: Metadata = {
  title: { absolute: service.title },
  description: service.description,
  alternates: { canonical: service.path },
  openGraph: {
    title: service.title,
    description: service.description,
    url: service.path,
    siteName: siteConfig.name,
    locale: 'ar_KW',
    type: 'website',
    images: ['/og-image.jpg'],
  },
};

export default function Page() {
  return <ServiceLandingPage service={service} />;
}
