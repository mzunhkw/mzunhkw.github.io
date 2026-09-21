import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import { siteConfig } from '@/data/site-config';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.name} — ${siteConfig.seoTitle}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.seoDescription,
  applicationName: siteConfig.name,
  robots: { index: true, follow: true },
  openGraph: { siteName: siteConfig.name, locale: 'ar_KW', type: 'website' },
  twitter: { card: 'summary' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FurnitureStore',
  '@id': `${siteConfig.siteUrl}/#store`,
  name: siteConfig.name,
  alternateName: siteConfig.nameEn,
  description: siteConfig.seoDescription,
  url: siteConfig.siteUrl,
  telephone: `+${siteConfig.whatsappNumber}`,
  foundingDate: String(siteConfig.foundedYear),
  areaServed: { '@type': 'Country', name: 'الكويت' },
  address: { '@type': 'PostalAddress', streetAddress: siteConfig.address, addressCountry: 'KW' },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    opens: '09:00',
    closes: '23:00',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-cream text-ink min-h-screen flex flex-col antialiased">
        <JsonLd data={jsonLd} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
